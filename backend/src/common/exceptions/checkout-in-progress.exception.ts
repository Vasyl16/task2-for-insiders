import { ConflictException } from '@nestjs/common';

export class CheckoutInProgressException extends ConflictException {
  constructor() {
    super('Checkout is already in progress.');
  }
}
