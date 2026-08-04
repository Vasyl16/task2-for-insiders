import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { InsufficientStockException, PaymentFailedException } from '../../common/exceptions';
import { roundToCents } from '../../common/utils';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { OrdersRepository, type OrderWithItems } from './repositories';
import { OrderResponseDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentGateway: MockPaymentGatewayService,
  ) {}

  async checkout(userId: string): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.runInTransaction(async (tx) => {
      const cart = await this.ordersRepository.findCartForCheckout(tx, userId);

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
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

      const totalAmount = roundToCents(
        cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
      );

      // A real gateway call would happen here. Holding the DB transaction
      // open for it is only safe because this mock resolves synchronously.
      const payment = await this.paymentGateway.charge(totalAmount);
      if (!payment.success) {
        throw new PaymentFailedException(payment.reason ?? 'Payment declined');
      }

      const created = await this.ordersRepository.createOrder(tx, {
        status: OrderStatus.PAID,
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

    return this.toResponse(order);
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
      items,
      createdAt: order.createdAt,
    };
  }
}
