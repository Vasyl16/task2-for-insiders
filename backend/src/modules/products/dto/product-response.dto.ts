import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto';

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ description: 'Whether the product is visible in the customer catalog' })
  isActive!: boolean;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'When the product was archived (soft-deleted), if ever',
  })
  deletedAt!: Date | null;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ type: CategoryResponseDto })
  category!: CategoryResponseDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
