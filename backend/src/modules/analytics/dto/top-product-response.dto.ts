import { ApiProperty } from '@nestjs/swagger';

export class TopProductResponseDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  quantitySold!: number;

  @ApiProperty()
  revenue!: number;
}
