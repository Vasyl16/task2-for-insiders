import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import type { ProductSortField, SortOrder } from '../repositories';

export type ProductStatusFilter = 'active' | 'archived' | 'all';

export class ProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive search over name and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Minimum price (inclusive)', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price (inclusive)', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ['active', 'archived', 'all'],
    description:
      'Filter by active/archived status. Admin only — non-admin callers always see active products only, regardless of this value.',
  })
  @IsOptional()
  @IsIn(['active', 'archived', 'all'])
  status?: ProductStatusFilter;

  @ApiPropertyOptional({ enum: ['createdAt', 'price', 'name'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt', 'price', 'name'])
  sortBy: ProductSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: SortOrder = 'desc';
}
