import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderStatusHistoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ required: false, nullable: true })
  reason!: string | null;

  @ApiProperty({ required: false, nullable: true, description: '"system" or the admin\'s email' })
  changedBy!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
