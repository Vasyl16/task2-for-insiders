import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  lineTotal!: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty({ required: false, nullable: true })
  cancelReason!: string | null;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty()
  createdAt!: Date;
}
