import { ApiProperty } from '@nestjs/swagger';

export class SalesPerDayResponseDto {
  @ApiProperty({ description: 'Day, as YYYY-MM-DD (UTC)' })
  date!: string;

  @ApiProperty()
  revenue!: number;

  @ApiProperty()
  ordersCount!: number;
}
