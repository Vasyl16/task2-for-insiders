import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { AnalyticsQueryDto } from './analytics-query.dto';
import { DEFAULT_TOP_PRODUCTS_LIMIT, MAX_TOP_PRODUCTS_LIMIT } from '../analytics.constants';

export class TopProductsQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({
    default: DEFAULT_TOP_PRODUCTS_LIMIT,
    minimum: 1,
    maximum: MAX_TOP_PRODUCTS_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_TOP_PRODUCTS_LIMIT)
  limit: number = DEFAULT_TOP_PRODUCTS_LIMIT;
}
