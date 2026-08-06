import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../database';
import { RedisService } from '../redis';
import { ProductsService } from '../products';
import { slugify } from '../../common/utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CATEGORIES_CACHE_TTL_SECONDS,
  CATEGORIES_LIST_CACHE_KEY,
  categoryDetailCacheKey,
} from './categories.constants';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.prisma.category.create({
        data: { name: dto.name, slug: slugify(dto.name) },
      });
      await this.invalidateCaches();
      return category;
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async findAll(): Promise<Category[]> {
    const cached = await this.redisService.getJson<Category[]>(CATEGORIES_LIST_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    await this.redisService.setJson(
      CATEGORIES_LIST_CACHE_KEY,
      categories,
      CATEGORIES_CACHE_TTL_SECONDS,
    );
    return categories;
  }

  async findById(id: string): Promise<Category> {
    const cacheKey = categoryDetailCacheKey(id);
    const cached = await this.redisService.getJson<Category>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.redisService.setJson(cacheKey, category, CATEGORIES_CACHE_TTL_SECONDS);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = slugify(dto.name);
    }

    try {
      const category = await this.prisma.category.update({ where: { id }, data });
      await this.invalidateCaches(id);
      return category;
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    try {
      await this.prisma.category.delete({ where: { id } });
      await this.invalidateCaches(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException('Cannot delete a category that still has products');
      }
      throw error;
    }
  }

  /** Categories are embedded in every product response, so a category write also busts the product cache. */
  private async invalidateCaches(id?: string): Promise<void> {
    await Promise.all([
      this.redisService.del(CATEGORIES_LIST_CACHE_KEY),
      id ? this.redisService.del(categoryDetailCacheKey(id)) : Promise.resolve(),
      this.productsService.invalidateAllProductCaches(),
    ]);
  }

  private translateWriteError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('A category with this name already exists');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
