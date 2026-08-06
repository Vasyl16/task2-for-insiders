import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsOverviewResponseDto {
  @ApiProperty({ description: 'Sum of totalAmount for non-cancelled orders in range' })
  revenue!: number;

  @ApiProperty({ description: 'Count of non-cancelled orders in range' })
  ordersCount!: number;

  @ApiProperty()
  averageOrderValue!: number;

  @ApiProperty()
  from!: string;

  @ApiProperty()
  to!: string;
}
