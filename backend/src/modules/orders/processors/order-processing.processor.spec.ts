import { OrderStatus } from '@prisma/client';
import type { Job } from 'bullmq';
import { OrderProcessingProcessor } from './order-processing.processor';
import { PROCESS_ORDER_JOB } from '../orders.constants';
import type { EmailService } from '../../email';
import type { OrderForProcessing, OrdersRepository } from '../repositories';

describe('OrderProcessingProcessor', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  function buildOrder(status: OrderStatus = OrderStatus.NEW): OrderForProcessing {
    return {
      id: 'order-1',
      userId: 'user-1',
      status,
      totalAmount: 45,
      cancelReason: null,
      createdAt: now,
      updatedAt: now,
      user: { email: 'buyer@example.com' },
      items: [
        {
          id: 'oi-1',
          orderId: 'order-1',
          productId: 'prod-1',
          productName: 'Widget',
          quantity: 2,
          unitPrice: 10,
          createdAt: now,
        },
        {
          id: 'oi-2',
          orderId: 'order-1',
          productId: 'prod-2',
          productName: 'Gadget',
          quantity: 1,
          unitPrice: 25,
          createdAt: now,
        },
      ],
    } as unknown as OrderForProcessing;
  }

  function buildJob(): Job<{ orderId: string }> {
    return { name: PROCESS_ORDER_JOB, data: { orderId: 'order-1' } } as Job<{ orderId: string }>;
  }

  let repository: {
    findForProcessing: jest.Mock;
    updateStatus: jest.Mock;
  };
  let emailService: jest.Mocked<Pick<EmailService, 'sendPaymentReceipt'>>;
  let processor: OrderProcessingProcessor;

  beforeEach(() => {
    repository = {
      findForProcessing: jest.fn(),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    emailService = { sendPaymentReceipt: jest.fn().mockResolvedValue(undefined) };

    processor = new OrderProcessingProcessor(
      repository as unknown as OrdersRepository,
      emailService as unknown as EmailService,
    );
  });

  it('skips silently when the order no longer exists', async () => {
    repository.findForProcessing.mockResolvedValue(null);

    await processor.process(buildJob());

    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(emailService.sendPaymentReceipt).not.toHaveBeenCalled();
  });

  it.each([
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ])('is idempotent and skips when the order is already %s', async (status) => {
    repository.findForProcessing.mockResolvedValue(buildOrder(status));

    await processor.process(buildJob());

    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(emailService.sendPaymentReceipt).not.toHaveBeenCalled();
  });

  it('moves a NEW order to PROCESSING and sends a confirmation email', async () => {
    repository.findForProcessing.mockResolvedValue(buildOrder(OrderStatus.NEW));

    await processor.process(buildJob());

    expect(repository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.PROCESSING);
    expect(emailService.sendPaymentReceipt).toHaveBeenCalledWith(
      'buyer@example.com',
      expect.objectContaining({
        orderId: 'order-1',
        totalAmount: 45,
        items: [
          { productName: 'Widget', quantity: 2, unitPrice: 10, lineTotal: 20 },
          { productName: 'Gadget', quantity: 1, unitPrice: 25, lineTotal: 25 },
        ],
      }),
    );
  });

  it('does not let an email-send failure surface as a job failure', async () => {
    repository.findForProcessing.mockResolvedValue(buildOrder(OrderStatus.NEW));
    emailService.sendPaymentReceipt.mockRejectedValue(new Error('Resend down'));

    await expect(processor.process(buildJob())).resolves.toBeUndefined();
    expect(repository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.PROCESSING);
  });
});
