import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto';
import { OrderResponseDto } from './order-response.dto';

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  items!: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
