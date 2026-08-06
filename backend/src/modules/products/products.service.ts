import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../../common/utils';
import { PaginationMetaDto } from '../../common/dto';
import { RedisService } from '../redis';
import { ProductsRepository, type ProductWithCategory } from './repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductsQueryDto } from './dto/products-query.dto';
import {
  PRODUCTS_CACHE_TTL_SECONDS,
  PRODUCTS_LIST_CACHE_PATTERN,
  productDetailCacheKey,
  productListCacheKey,
} from './products.constants';

const MAX_SLUG_ATTEMPTS = 50;

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const slug = await this.generateUniqueSlug(dto.name);

    try {
      const product = await this.productsRepository.create({
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        stock: dto.stock,
        category: { connect: { id: dto.categoryId } },
      });
      await this.invalidateListCache();
      return this.toResponse(product);
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async findAll(query: ProductsQueryDto): Promise<ProductListResponseDto> {
    const cacheKey = productListCacheKey(query);
    const cached = await this.redisService.getJson<ProductListResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const { page, limit, categoryId, search, sortBy, sortOrder } = query;
    const { items, total } = await this.productsRepository.findMany({
      page,
      limit,
      categoryId,
      search,
      sortBy,
      sortOrder,
    });

    const response: ProductListResponseDto = {
      items: items.map((item) => this.toResponse(item)),
      meta: new PaginationMetaDto(page, limit, total),
    };
    await this.redisService.setJson(cacheKey, response, PRODUCTS_CACHE_TTL_SECONDS);
    return response;
  }

  async findById(id: string): Promise<ProductResponseDto> {
    const cacheKey = productDetailCacheKey(id);
    const cached = await this.redisService.getJson<ProductResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const response = this.toResponse(product);
    await this.redisService.setJson(cacheKey, response, PRODUCTS_CACHE_TTL_SECONDS);
    return response;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    await this.ensureExists(id);

    const data: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await this.generateUniqueSlug(dto.name, id);
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.price !== undefined) {
      data.price = dto.price;
    }
    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl;
    }
    if (dto.stock !== undefined) {
      data.stock = dto.stock;
    }
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }

    try {
      const product = await this.productsRepository.update(id, data);
      await Promise.all([
        this.invalidateListCache(),
        this.redisService.del(productDetailCacheKey(id)),
      ]);
      return this.toResponse(product);
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.productsRepository.delete(id);
    await Promise.all([
      this.invalidateListCache(),
      this.redisService.del(productDetailCacheKey(id)),
    ]);
  }

  /** Called by OrdersService after a successful checkout decrements these products' stock. */
  async invalidateProductsCache(productIds: string[]): Promise<void> {
    await Promise.all([
      this.invalidateListCache(),
      ...productIds.map((id) => this.redisService.del(productDetailCacheKey(id))),
    ]);
  }

  /** Called by CategoriesService on writes — a renamed/deleted category is embedded in every product response. */
  async invalidateAllProductCaches(): Promise<void> {
    await this.redisService.delByPattern('products:*');
  }

  private async invalidateListCache(): Promise<void> {
    await this.redisService.delByPattern(PRODUCTS_LIST_CACHE_PATTERN);
  }

  private async ensureExists(id: string): Promise<void> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name);
    let candidate = base;

    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
      const existing = await this.productsRepository.findBySlug(candidate);
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${attempt + 1}`;
    }

    throw new ConflictException('Could not generate a unique slug for this product name');
  }

  private toResponse(product: ProductWithCategory): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private translateWriteError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('A product with this slug already exists');
      }
      if (error.code === 'P2003' || error.code === 'P2025') {
        return new BadRequestException('Category does not exist');
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
