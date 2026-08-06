import { Injectable } from '@nestjs/common';
import { roundToCents, toCsv } from '../../common/utils';
import { RedisService } from '../redis';
import { AnalyticsRepository } from './repositories';
import {
  AnalyticsOverviewResponseDto,
  AnalyticsQueryDto,
  SalesPerDayResponseDto,
  TopProductResponseDto,
  TopProductsQueryDto,
} from './dto';
import {
  ANALYTICS_CACHE_PATTERN,
  ANALYTICS_CACHE_TTL_SECONDS,
  DEFAULT_ANALYTICS_RANGE_DAYS,
  analyticsOverviewCacheKey,
  analyticsSalesPerDayCacheKey,
  analyticsTopProductsCacheKey,
} from './analytics.constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly redisService: RedisService,
  ) {}

  async getOverview(query: AnalyticsQueryDto): Promise<AnalyticsOverviewResponseDto> {
    const { from, to } = this.resolveRange(query);
    const cacheKey = analyticsOverviewCacheKey(from, to);
    const cached = await this.redisService.getJson<AnalyticsOverviewResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const { revenue, ordersCount } = await this.analyticsRepository.getOverview(from, to);
    const response: AnalyticsOverviewResponseDto = {
      revenue: roundToCents(revenue),
      ordersCount,
      averageOrderValue: ordersCount > 0 ? roundToCents(revenue / ordersCount) : 0,
      from: from.toISOString(),
      to: to.toISOString(),
    };

    await this.redisService.setJson(cacheKey, response, ANALYTICS_CACHE_TTL_SECONDS);
    return response;
  }

  async getTopProducts(query: TopProductsQueryDto): Promise<TopProductResponseDto[]> {
    const { from, to } = this.resolveRange(query);
    const cacheKey = analyticsTopProductsCacheKey(from, to, query.limit);
    const cached = await this.redisService.getJson<TopProductResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const rows = await this.analyticsRepository.getTopProducts(from, to, query.limit);
    const response = rows.map((row) => ({ ...row, revenue: roundToCents(row.revenue) }));

    await this.redisService.setJson(cacheKey, response, ANALYTICS_CACHE_TTL_SECONDS);
    return response;
  }

  async getSalesPerDay(query: AnalyticsQueryDto): Promise<SalesPerDayResponseDto[]> {
    const { from, to } = this.resolveRange(query);
    const cacheKey = analyticsSalesPerDayCacheKey(from, to);
    const cached = await this.redisService.getJson<SalesPerDayResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const rows = await this.analyticsRepository.getSalesPerDay(from, to);
    const response = rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      revenue: roundToCents(row.revenue),
      ordersCount: row.ordersCount,
    }));

    await this.redisService.setJson(cacheKey, response, ANALYTICS_CACHE_TTL_SECONDS);
    return response;
  }

  /** Not cached — a low-frequency admin action, and streaming a stale export is worse than a slightly slower one. */
  async exportOrdersCsv(query: AnalyticsQueryDto): Promise<string> {
    const { from, to } = this.resolveRange(query);
    const rows = await this.analyticsRepository.getOrdersForExport(from, to);
    const formattedRows = rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));

    return toCsv(formattedRows, [
      { header: 'Order ID', key: 'id' },
      { header: 'Date', key: 'createdAt' },
      { header: 'Status', key: 'status' },
      { header: 'Customer Email', key: 'customerEmail' },
      { header: 'Items', key: 'itemsCount' },
      { header: 'Total', key: 'totalAmount' },
    ]);
  }

  /** Called by OrdersService after checkout and after any status update — both affect revenue/order counts. */
  async invalidateCache(): Promise<void> {
    await this.redisService.delByPattern(ANALYTICS_CACHE_PATTERN);
  }

  private resolveRange(query: AnalyticsQueryDto): { from: Date; to: Date } {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - DEFAULT_ANALYTICS_RANGE_DAYS * MS_PER_DAY);
    return { from, to };
  }
}
