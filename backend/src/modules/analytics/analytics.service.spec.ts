import { AnalyticsService } from './analytics.service';
import type { AnalyticsRepository } from './repositories';
import type { RedisService } from '../redis';

describe('AnalyticsService', () => {
  const now = new Date('2026-08-06T12:00:00.000Z');

  let repository: {
    getOverview: jest.Mock;
    getTopProducts: jest.Mock;
    getSalesPerDay: jest.Mock;
    getOrdersForExport: jest.Mock;
  };
  let redisService: {
    getJson: jest.Mock;
    setJson: jest.Mock;
    delByPattern: jest.Mock;
  };
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);

    repository = {
      getOverview: jest.fn(),
      getTopProducts: jest.fn(),
      getSalesPerDay: jest.fn(),
      getOrdersForExport: jest.fn(),
    };
    redisService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };

    analyticsService = new AnalyticsService(
      repository as unknown as AnalyticsRepository,
      redisService as unknown as RedisService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getOverview', () => {
    it('defaults to a 30-day range ending now when no range is given', async () => {
      repository.getOverview.mockResolvedValue({ revenue: 150, ordersCount: 3 });

      const result = await analyticsService.getOverview({});

      const [from, to] = repository.getOverview.mock.calls[0] as [Date, Date];
      expect(to.toISOString()).toBe(now.toISOString());
      expect(to.getTime() - from.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
      expect(result.revenue).toBe(150);
      expect(result.ordersCount).toBe(3);
      expect(result.averageOrderValue).toBe(50);
    });

    it('returns 0 average order value when there are no orders', async () => {
      repository.getOverview.mockResolvedValue({ revenue: 0, ordersCount: 0 });

      const result = await analyticsService.getOverview({});

      expect(result.averageOrderValue).toBe(0);
    });

    it('returns cached data without querying the repository on a cache hit', async () => {
      const cached = {
        revenue: 99,
        ordersCount: 1,
        averageOrderValue: 99,
        from: 'x',
        to: 'y',
      };
      redisService.getJson.mockResolvedValue(cached);

      const result = await analyticsService.getOverview({});

      expect(result).toBe(cached);
      expect(repository.getOverview).not.toHaveBeenCalled();
    });

    it('caches a fresh result after a miss', async () => {
      repository.getOverview.mockResolvedValue({ revenue: 100, ordersCount: 2 });

      await analyticsService.getOverview({});

      expect(redisService.setJson).toHaveBeenCalledWith(
        expect.stringContaining('analytics:overview:'),
        expect.objectContaining({ revenue: 100, ordersCount: 2, averageOrderValue: 50 }),
        expect.any(Number),
      );
    });
  });

  describe('getTopProducts', () => {
    it('rounds revenue and forwards the requested limit', async () => {
      repository.getTopProducts.mockResolvedValue([
        { productId: 'p1', productName: 'Widget', quantitySold: 3, revenue: 29.999 },
      ]);

      const result = await analyticsService.getTopProducts({ limit: 5 });

      expect(repository.getTopProducts).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), 5);
      expect(result).toEqual([
        { productId: 'p1', productName: 'Widget', quantitySold: 3, revenue: 30 },
      ]);
    });
  });

  describe('getSalesPerDay', () => {
    it('formats each row as a YYYY-MM-DD date string', async () => {
      repository.getSalesPerDay.mockResolvedValue([
        { day: new Date('2026-08-01T00:00:00.000Z'), revenue: 10, ordersCount: 1 },
      ]);

      const result = await analyticsService.getSalesPerDay({});

      expect(result).toEqual([{ date: '2026-08-01', revenue: 10, ordersCount: 1 }]);
    });
  });

  describe('exportOrdersCsv', () => {
    it('is never cached and produces a CSV with a header row', async () => {
      repository.getOrdersForExport.mockResolvedValue([
        {
          id: 'order-1',
          createdAt: new Date('2026-08-01T00:00:00.000Z'),
          status: 'COMPLETED',
          customerEmail: 'a@example.com',
          totalAmount: 42,
          itemsCount: 2,
        },
      ]);

      const csv = await analyticsService.exportOrdersCsv({});

      expect(csv.split('\r\n')[0]).toBe('Order ID,Date,Status,Customer Email,Items,Total');
      expect(csv).toContain('order-1');
      expect(csv).toContain('a@example.com');
      expect(redisService.setJson).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('deletes every analytics:* key', async () => {
      await analyticsService.invalidateCache();

      expect(redisService.delByPattern).toHaveBeenCalledWith('analytics:*');
    });
  });
});
