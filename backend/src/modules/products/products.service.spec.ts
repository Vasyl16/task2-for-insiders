import { ProductsService } from './products.service';
import type { ProductsRepository, ProductWithCategory } from './repositories';
import type { RedisService } from '../redis';
import { productDetailCacheKey, productListCacheKey } from './products.constants';
import type { ProductsQueryDto } from './dto';

describe('ProductsService caching', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  function buildProduct(overrides: Partial<ProductWithCategory> = {}): ProductWithCategory {
    return {
      id: 'prod-1',
      name: 'Widget',
      slug: 'widget',
      description: 'A widget',
      price: 10 as unknown as ProductWithCategory['price'],
      imageUrl: 'https://example.com/widget.png',
      stock: 5,
      isActive: true,
      deletedAt: null,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Gadgets', slug: 'gadgets', createdAt: now, updatedAt: now },
      createdAt: now,
      updatedAt: now,
      ...overrides,
    } as ProductWithCategory;
  }

  const query: ProductsQueryDto = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  } as ProductsQueryDto;

  let repository: {
    findMany: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    hasOrderItems: jest.Mock;
    archive: jest.Mock;
    restore: jest.Mock;
  };
  let redisService: {
    getJson: jest.Mock;
    setJson: jest.Mock;
    del: jest.Mock;
    delByPattern: jest.Mock;
  };
  let productsService: ProductsService;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      hasOrderItems: jest.fn().mockResolvedValue(false),
      archive: jest.fn().mockResolvedValue(undefined),
      restore: jest.fn().mockResolvedValue(undefined),
    };
    redisService = {
      getJson: jest.fn().mockResolvedValue(null),
      setJson: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };
    productsService = new ProductsService(
      repository as unknown as ProductsRepository,
      redisService as unknown as RedisService,
    );
  });

  describe('findAll', () => {
    it('returns the cached response without hitting the repository on a cache hit', async () => {
      const cached = { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
      redisService.getJson.mockResolvedValue(cached);

      const result = await productsService.findAll(query);

      expect(result).toBe(cached);
      expect(repository.findMany).not.toHaveBeenCalled();
    });

    it('queries the repository and populates the cache on a miss', async () => {
      repository.findMany.mockResolvedValue({ items: [buildProduct()], total: 1 });

      const result = await productsService.findAll(query);

      expect(result.items).toHaveLength(1);
      expect(redisService.setJson).toHaveBeenCalledWith(
        productListCacheKey(query, true),
        expect.objectContaining({ items: expect.any(Array) }),
        expect.any(Number),
      );
    });

    it('forces the active-only filter for non-admin callers even if status is requested', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 });

      await productsService.findAll({ ...query, status: 'all' }, false);

      expect(repository.findMany).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
    });

    it('honors the status filter for admin callers', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 });

      await productsService.findAll({ ...query, status: 'archived' }, true);

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('findById', () => {
    it('returns the cached product without hitting the repository on a cache hit', async () => {
      const cached = { id: 'prod-1', name: 'Widget', isActive: true };
      redisService.getJson.mockResolvedValue(cached);

      const result = await productsService.findById('prod-1');

      expect(result).toBe(cached);
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('queries the repository and populates the cache on a miss', async () => {
      repository.findById.mockResolvedValue(buildProduct());

      const result = await productsService.findById('prod-1');

      expect(result.id).toBe('prod-1');
      expect(redisService.setJson).toHaveBeenCalledWith(
        productDetailCacheKey('prod-1'),
        expect.objectContaining({ id: 'prod-1' }),
        expect.any(Number),
      );
    });

    it('throws 404 for an archived product when the caller is not an admin', async () => {
      repository.findById.mockResolvedValue(buildProduct({ isActive: false }));

      await expect(productsService.findById('prod-1', false)).rejects.toThrow('Product not found');
    });

    it('returns an archived product to an admin caller', async () => {
      repository.findById.mockResolvedValue(buildProduct({ isActive: false }));

      const result = await productsService.findById('prod-1', true);

      expect(result.isActive).toBe(false);
    });
  });

  describe('cache invalidation on writes', () => {
    it('busts the list cache on create', async () => {
      repository.create.mockResolvedValue(buildProduct());

      await productsService.create({
        name: 'Widget',
        description: 'A widget',
        price: 10,
        imageUrl: 'https://example.com/widget.png',
        stock: 5,
        categoryId: 'cat-1',
      });

      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
    });

    it('busts the list and detail caches on update', async () => {
      repository.findById.mockResolvedValue(buildProduct());
      repository.update.mockResolvedValue(buildProduct({ name: 'Widget 2' }));

      await productsService.update('prod-1', { name: 'Widget 2' });

      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
    });

    it('busts the list and detail caches on delete', async () => {
      repository.findById.mockResolvedValue(buildProduct());

      await productsService.delete('prod-1');

      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
    });
  });

  describe('delete — soft-delete rules', () => {
    it('throws 404 when the product does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(productsService.delete('missing')).rejects.toThrow('Product not found');
      expect(repository.hasOrderItems).not.toHaveBeenCalled();
    });

    it('archives (soft-deletes) a product that has never been ordered', async () => {
      repository.findById.mockResolvedValue(buildProduct());
      repository.hasOrderItems.mockResolvedValue(false);

      await productsService.delete('prod-1');

      expect(repository.archive).toHaveBeenCalledWith('prod-1');
      expect(repository.delete).not.toHaveBeenCalled();
      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
    });

    it('archives (soft-deletes) a product that has been ordered', async () => {
      repository.findById.mockResolvedValue(buildProduct());
      repository.hasOrderItems.mockResolvedValue(true);

      await productsService.delete('prod-1');

      expect(repository.archive).toHaveBeenCalledWith('prod-1');
      expect(repository.delete).not.toHaveBeenCalled();
      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
    });

    it('is idempotent when the product is already archived', async () => {
      repository.findById.mockResolvedValue(buildProduct({ isActive: false }));

      await expect(productsService.delete('prod-1')).resolves.toBeUndefined();

      expect(repository.hasOrderItems).not.toHaveBeenCalled();
      expect(repository.archive).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('restores an archived product', async () => {
      repository.findById.mockResolvedValue(buildProduct({ isActive: false }));

      await productsService.restore('prod-1');

      expect(repository.restore).toHaveBeenCalledWith('prod-1');
      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
    });

    it('does nothing for an already active product', async () => {
      repository.findById.mockResolvedValue(buildProduct());

      await productsService.restore('prod-1');

      expect(repository.restore).not.toHaveBeenCalled();
    });
  });

  describe('invalidateProductsCache', () => {
    it('busts the list cache and each given product detail cache', async () => {
      await productsService.invalidateProductsCache(['prod-1', 'prod-2']);

      expect(redisService.delByPattern).toHaveBeenCalledWith('products:list:*');
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-1'));
      expect(redisService.del).toHaveBeenCalledWith(productDetailCacheKey('prod-2'));
    });
  });

  describe('invalidateAllProductCaches', () => {
    it('busts every products:* key', async () => {
      await productsService.invalidateAllProductCaches();

      expect(redisService.delByPattern).toHaveBeenCalledWith('products:*');
    });
  });
});
