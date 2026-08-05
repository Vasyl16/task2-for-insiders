import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export interface PaymentChargeResult {
  success: boolean;
  transactionId?: string;
  reason?: string;
}

const DECLINE_REASONS = [
  'Card declined by issuer',
  'Insufficient funds',
  'Bank flagged transaction as suspicious',
  'Gateway timeout, please retry',
];

/**
 * Stand-in for a real payment gateway (e.g. Stripe). Declines ~50% of
 * charges at random to exercise checkout's failure/retry path; swap this
 * provider for a real integration without touching OrdersService's
 * checkout orchestration.
 */
@Injectable()
export class MockPaymentGatewayService {
  charge(amount: number): Promise<PaymentChargeResult> {
    if (amount <= 0) {
      return Promise.resolve({ success: false, reason: 'Charge amount must be positive' });
    }
    if (Math.random() < 0.5) {
      const reason = DECLINE_REASONS[Math.floor(Math.random() * DECLINE_REASONS.length)];
      return Promise.resolve({ success: false, reason });
    }
    return Promise.resolve({ success: true, transactionId: randomUUID() });
  }
}
