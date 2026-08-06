import type { Category } from '@prisma/client';
import { CategoriesService } from './categories.service';
import type { PrismaService } from '../database';
import type { RedisService } from '../redis';
import type { ProductsService } from '../products';
import { CATEGORIES_LIST_CACHE_KEY, categoryDetailCacheKey } from './categories.constants';

describe('CategoriesService caching', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  function buildCategory(overrides: Partial<Category> = {}): Category {
    return {
      id: 'cat-1',
      name: 'Gadgets',
      slug: 'gadgets',
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  let prisma: {
    category: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let redisService: {
    getJson: jest.Mock;
    setJson: jest.Mock;
    del: jest.Mock;
    delByPattern: jest.Mock;
  };
  let productsService: { invalidateAllProductCaches: jest.Mock };
  let categoriesService: CategoriesService;

  beforeEach(() => {
    prisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    redisService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };
    productsService = { invalidateAllProductCaches: jest.fn().mockResolvedValue(undefined) };
    categoriesService = new CategoriesService(
      prisma as unknown as PrismaService,
      redisService as unknown as RedisService,
      productsService as unknown as ProductsService,
    );
  });

  describe('findAll', () => {
    it('returns the cached list without hitting the database on a cache hit', async () => {
      const cached = [buildCategory()];
      redisService.getJson.mockResolvedValue(cached);

      const result = await categoriesService.findAll();

      expect(result).toBe(cached);
      expect(prisma.category.findMany).not.toHaveBeenCalled();
    });

    it('queries the database and populates the cache on a miss', async () => {
      prisma.category.findMany.mockResolvedValue([buildCategory()]);

      const result = await categoriesService.findAll();

      expect(result).toHaveLength(1);
      expect(redisService.setJson).toHaveBeenCalledWith(
        CATEGORIES_LIST_CACHE_KEY,
        expect.any(Array),
        expect.any(Number),
      );
    });
  });

  describe('cache invalidation on writes', () => {
    it('busts the category list cache and every product cache on create', async () => {
      prisma.category.create.mockResolvedValue(buildCategory());

      await categoriesService.create({ name: 'Gadgets' });

      expect(redisService.del).toHaveBeenCalledWith(CATEGORIES_LIST_CACHE_KEY);
      expect(productsService.invalidateAllProductCaches).toHaveBeenCalled();
    });

    it('busts the category detail cache and every product cache on update (renamed category is embedded in products)', async () => {
      prisma.category.findUnique.mockResolvedValue(buildCategory());
      prisma.category.update.mockResolvedValue(buildCategory({ name: 'Electronics' }));

      await categoriesService.update('cat-1', { name: 'Electronics' });

      expect(redisService.del).toHaveBeenCalledWith(categoryDetailCacheKey('cat-1'));
      expect(productsService.invalidateAllProductCaches).toHaveBeenCalled();
    });

    it('busts caches on delete', async () => {
      prisma.category.findUnique.mockResolvedValue(buildCategory());

      await categoriesService.delete('cat-1');

      expect(redisService.del).toHaveBeenCalledWith(categoryDetailCacheKey('cat-1'));
      expect(productsService.invalidateAllProductCaches).toHaveBeenCalled();
    });
  });
});
