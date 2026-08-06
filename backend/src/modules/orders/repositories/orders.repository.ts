import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database';

export type CartForCheckout = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export type OrderForProcessing = Prisma.OrderGetPayload<{
  include: { items: true; user: { select: { email: true } } };
}>;

export interface PaginatedOrders {
  items: OrderWithItems[];
  total: number;
}

export type OrderWithItemsAndCustomer = Prisma.OrderGetPayload<{
  include: { items: true; user: { select: { email: true } } };
}>;

export interface PaginatedAdminOrders {
  items: OrderWithItemsAndCustomer[];
  total: number;
}

export type OrderStatusHistoryEntry = Prisma.OrderStatusHistoryGetPayload<object>;

/**
 * Checkout-time methods (findCartForCheckout, decrementStock, createOrder,
 * clearCartItems) are transaction-scoped (take the `tx` client from
 * OrdersService.checkout's `$transaction` callback) so stock reservation,
 * order creation, and cart clearing commit or roll back as one atomic unit.
 * Status-update methods run outside that transaction — the admin/worker
 * lifecycle never touches stock (it's reserved exactly once, at checkout).
 */
@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  findCartForCheckout(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<CartForCheckout | null> {
    return tx.cart.findUnique({
      where: { userId },
      // Ascending productId order gives concurrent checkouts a consistent
      // row-locking order, avoiding circular-wait deadlocks on overlapping
      // products.
      include: { items: { include: { product: true }, orderBy: { productId: 'asc' } } },
    });
  }

  /** Atomically decrements stock only if enough is available; returns whether it succeeded. */
  async decrementStock(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const result = await tx.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return result.count === 1;
  }

  createOrder(
    tx: Prisma.TransactionClient,
    data: Prisma.OrderCreateInput,
  ): Promise<OrderWithItems> {
    return tx.order.create({ data, include: { items: true } });
  }

  clearCartItems(tx: Prisma.TransactionClient, cartId: string): Promise<Prisma.BatchPayload> {
    return tx.cartItem.deleteMany({ where: { cartId } });
  }

  findById(orderId: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  }

  findForProcessing(orderId: string): Promise<OrderForProcessing | null> {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    });
  }

  async findManyByUserId(
    userId: string,
    { page, limit }: { page: number; limit: number },
  ): Promise<PaginatedOrders> {
    return this.findManyPaginated({ userId }, { page, limit });
  }

  async findManyForAdmin({
    page,
    limit,
    status,
  }: {
    page: number;
    limit: number;
    status?: OrderStatus;
  }): Promise<PaginatedAdminOrders> {
    const where: Prisma.OrderWhereInput = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true, user: { select: { email: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  private async findManyPaginated(
    where: Prisma.OrderWhereInput,
    { page, limit }: { page: number; limit: number },
  ): Promise<PaginatedOrders> {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Status update + its history entry, committed atomically. Never touches
   * stock — reservation happens exactly once, at checkout.
   */
  async updateStatusWithHistory(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    reason?: string | null,
  ): Promise<OrderWithItems> {
    const [order] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status, ...(reason !== undefined ? { cancelReason: reason } : {}) },
        include: { items: true },
      }),
      this.prisma.orderStatusHistory.create({
        data: { orderId, status, changedBy, reason: reason ?? null },
      }),
    ]);

    return order;
  }

  findHistoryByOrderId(orderId: string): Promise<OrderStatusHistoryEntry[]> {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
