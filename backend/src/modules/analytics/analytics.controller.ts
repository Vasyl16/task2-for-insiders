import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsOverviewResponseDto,
  AnalyticsQueryDto,
  SalesPerDayResponseDto,
  TopProductResponseDto,
  TopProductsQueryDto,
} from './dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Revenue, order count, and average order value for a date range (admin only)',
  })
  @ApiResponse({ status: 200, type: AnalyticsOverviewResponseDto })
  getOverview(@Query() query: AnalyticsQueryDto): Promise<AnalyticsOverviewResponseDto> {
    return this.analyticsService.getOverview(query);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Best-selling products by revenue for a date range (admin only)' })
  @ApiResponse({ status: 200, type: [TopProductResponseDto] })
  getTopProducts(@Query() query: TopProductsQueryDto): Promise<TopProductResponseDto[]> {
    return this.analyticsService.getTopProducts(query);
  }

  @Get('sales-per-day')
  @ApiOperation({ summary: 'Daily revenue and order counts for a date range (admin only)' })
  @ApiResponse({ status: 200, type: [SalesPerDayResponseDto] })
  getSalesPerDay(@Query() query: AnalyticsQueryDto): Promise<SalesPerDayResponseDto[]> {
    return this.analyticsService.getSalesPerDay(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'CSV export of orders in a date range (admin only)' })
  async exportCsv(@Query() query: AnalyticsQueryDto): Promise<StreamableFile> {
    const csv = await this.analyticsService.exportOrdersCsv(query);
    return new StreamableFile(Buffer.from(csv, 'utf-8'), {
      type: 'text/csv',
      disposition: 'attachment; filename="sales-export.csv"',
    });
  }
}
