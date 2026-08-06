import { Processor } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { OrderStatus } from '@prisma/client';
import { QueueNames, BaseProcessor } from '../../bull';
import { EmailService } from '../../email';
import { PROCESS_ORDER_JOB, SYSTEM_ACTOR } from '../orders.constants';
import { OrdersRepository } from '../repositories';

export interface ProcessOrderJobData {
  orderId: string;
}

/**
 * Consumes checkout jobs. By the time a job runs, payment already
 * succeeded and the order/items/stock were already committed by
 * OrdersService.checkout — this only owns the NEW -> PROCESSING transition
 * and notifying the customer. Idempotent: if the order has already moved
 * past NEW (e.g. a duplicate/retried job, or an admin already acted on it),
 * the job is a no-op so it can never apply the same update twice.
 */
@Processor(QueueNames.ORDERS)
export class OrderProcessingProcessor extends BaseProcessor<ProcessOrderJobData> {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<ProcessOrderJobData>): Promise<void> {
    if (job.name !== PROCESS_ORDER_JOB) {
      return;
    }

    const { orderId } = job.data;
    const order = await this.ordersRepository.findForProcessing(orderId);
    if (!order) {
      this.logger.warn(`Order ${orderId} no longer exists, skipping`);
      return;
    }

    if (order.status !== OrderStatus.NEW) {
      this.logger.log(`Order ${orderId} is already ${order.status}, skipping duplicate job`);
      return;
    }

    await this.ordersRepository.updateStatusWithHistory(
      orderId,
      OrderStatus.PROCESSING,
      SYSTEM_ACTOR,
    );
    this.logger.log(`Order ${orderId} entered PROCESSING`);

    await this.emailService
      .sendPaymentReceipt(order.user.email, {
        orderId: order.id,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.unitPrice) * item.quantity,
        })),
      })
      .catch((error: Error) => {
        this.logger.warn(
          `Failed to send confirmation email for order ${orderId}: ${error.message}`,
        );
      });
  }
}
