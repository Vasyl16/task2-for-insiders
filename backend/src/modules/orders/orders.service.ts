import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { OrderStatus } from '@prisma/client';
import { QueueNames } from '../bull';
import { PaginationMetaDto, type PaginationQueryDto } from '../../common/dto';
import {
  InsufficientStockException,
  InvalidOrderStatusTransitionException,
  PaymentFailedException,
} from '../../common/exceptions';
import { roundToCents } from '../../common/utils';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { OrdersRepository, type OrderWithItems } from './repositories';
import { OrderListResponseDto, OrderResponseDto, UpdateOrderStatusDto } from './dto';
import { ORDER_STATUS_TRANSITIONS, PROCESS_ORDER_JOB } from './orders.constants';
import type { ProcessOrderJobData } from './processors';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentGateway: MockPaymentGatewayService,
    @InjectQueue(QueueNames.ORDERS) private readonly ordersQueue: Queue<ProcessOrderJobData>,
  ) {}

  async checkout(userId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.runInTransaction(async (tx) => {
      const cart = await this.ordersRepository.findCartForCheckout(tx, userId);

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const totalAmount = roundToCents(
        cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
      );

      // Gate the whole checkout on payment before touching stock or
      // creating anything — a decline leaves no trace to roll back.
      const payment = await this.paymentGateway.charge(totalAmount);
      if (!payment.success) {
        throw new PaymentFailedException(payment.reason ?? 'Payment declined');
      }

      for (const item of cart.items) {
        const decremented = await this.ordersRepository.decrementStock(
          tx,
          item.productId,
          item.quantity,
        );
        if (!decremented) {
          throw new InsufficientStockException(item.product.stock);
        }
      }

      const created = await this.ordersRepository.createOrder(tx, {
        status: OrderStatus.NEW,
        totalAmount,
        user: { connect: { id: userId } },
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: Number(item.product.price),
          })),
        },
      });

      await this.ordersRepository.clearCartItems(tx, cart.id);

      return created;
    });

    this.logger.log(`Order ${order.id} created`);

    // Order processing (NEW -> PROCESSING) happens asynchronously in the
    // orders worker so checkout responds as soon as the order is committed.
    await this.ordersQueue.add(PROCESS_ORDER_JOB, { orderId: order.id });

    return this.toResponse(order);
  }

  async findMyOrders(userId: string, query: PaginationQueryDto): Promise<OrderListResponseDto> {
    const { page, limit } = query;
    const { items, total } = await this.ordersRepository.findManyByUserId(userId, { page, limit });

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return this.toResponse(order);
  }

  /** Admin-only: moves an order through its fulfillment lifecycle. Never touches stock. */
  async updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedNextStatuses.includes(dto.status)) {
      throw new InvalidOrderStatusTransitionException(order.status, dto.status);
    }

    const updated = await this.ordersRepository.updateStatus(
      orderId,
      dto.status,
      dto.status === OrderStatus.CANCELLED ? (dto.reason ?? null) : undefined,
    );

    this.logStatusChange(orderId, dto.status);

    return this.toResponse(updated);
  }

  private logStatusChange(orderId: string, status: OrderStatus): void {
    const messages: Record<OrderStatus, string> = {
      [OrderStatus.NEW]: `Order ${orderId} created`,
      [OrderStatus.PROCESSING]: `Order ${orderId} entered PROCESSING`,
      [OrderStatus.SHIPPED]: `Order ${orderId} shipped`,
      [OrderStatus.COMPLETED]: `Order ${orderId} completed`,
      [OrderStatus.CANCELLED]: `Order ${orderId} cancelled`,
    };
    this.logger.log(messages[status]);
  }

  private toResponse(order: OrderWithItems): OrderResponseDto {
    const items = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: roundToCents(Number(item.unitPrice) * item.quantity),
    }));

    return {
      id: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      cancelReason: order.cancelReason,
      items,
      createdAt: order.createdAt,
    };
  }
}
