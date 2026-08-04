import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({ example: '/uploads/products/8f14e-1234.png' })
  url!: string;
}
