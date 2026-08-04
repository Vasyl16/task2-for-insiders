import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentFailedException extends HttpException {
  constructor(reason: string) {
    super(`Payment failed: ${reason}`, HttpStatus.PAYMENT_REQUIRED);
  }
}
