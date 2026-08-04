import { ApiProperty } from '@nestjs/swagger';

export class CartItemProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  stock!: number;
}

export class CartItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ type: CartItemProductDto })
  product!: CartItemProductDto;

  @ApiProperty()
  lineTotal!: number;
}

export class CartResponseDto {
  @ApiProperty({ nullable: true, type: String })
  id!: string | null;

  @ApiProperty({ type: [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  subtotal!: number;
}
