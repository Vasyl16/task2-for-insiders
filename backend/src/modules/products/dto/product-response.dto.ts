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

  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ type: CategoryResponseDto })
  category!: CategoryResponseDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
