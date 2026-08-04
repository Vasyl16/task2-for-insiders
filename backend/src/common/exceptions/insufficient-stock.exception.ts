import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(available: number) {
    super(`Only ${available} unit(s) in stock`);
  }
}
