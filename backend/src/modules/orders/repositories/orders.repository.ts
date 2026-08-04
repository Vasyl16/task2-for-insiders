import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database';

export type CartForCheckout = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

/**
 * All checkout data access is transaction-scoped (methods take the `tx`
 * client from OrdersService.checkout's `$transaction` callback) so stock
 * reservation, order creation, and cart clearing commit or roll back as one
 * atomic unit.
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
}
