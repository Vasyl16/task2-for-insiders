import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'b7f1c9d0-6e6a-4b8a-9f1a-1a2b3c4d5e6f' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 999 })
  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}
