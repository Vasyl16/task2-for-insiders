import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Range start (ISO 8601 date/datetime). Defaults to 30 days before `to`.',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'Range end (ISO 8601 date/datetime). Defaults to now.',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
