import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export interface PaymentChargeResult {
  success: boolean;
  transactionId?: string;
  reason?: string;
}

/**
 * Stand-in for a real payment gateway (e.g. Stripe). Always approves the
 * charge; swap this provider for a real integration without touching
 * OrdersService's checkout orchestration.
 */
@Injectable()
export class MockPaymentGatewayService {
  charge(amount: number): Promise<PaymentChargeResult> {
    if (amount <= 0) {
      return Promise.resolve({ success: false, reason: 'Charge amount must be positive' });
    }
    return Promise.resolve({ success: true, transactionId: randomUUID() });
  }
}
