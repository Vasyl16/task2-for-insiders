import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Ergonomic wireless mouse with USB-C charging.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000000)
  price!: number;

  @ApiProperty({
    example: '/uploads/products/8f14e.png',
    description: 'Either an external image URL or the path returned by POST /products/images.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  imageUrl!: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 'b7f1c9d0-6e6a-4b8a-9f1a-1a2b3c4d5e6f' })
  @IsUUID()
  categoryId!: string;
}
