import { BadRequestException } from '@nestjs/common';
import type { OrderStatus } from '@prisma/client';

export class InvalidOrderStatusTransitionException extends BadRequestException {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot transition order from ${from} to ${to}`);
  }
}
