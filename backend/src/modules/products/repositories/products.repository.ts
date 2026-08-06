import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../database';

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export type ProductSortField = 'createdAt' | 'price' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface FindProductsOptions {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: ProductSortField;
  sortOrder: SortOrder;
  /** `true` = active only, `false` = archived only, `undefined` = no filter (all). */
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Encapsulates product query composition (pagination, filtering, search,
 * sorting) so ProductsService stays focused on business rules.
 */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput): Promise<ProductWithCategory> {
    return this.prisma.product.create({ data, include: { category: true } });
  }

  update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductWithCategory> {
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  delete(id: string): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }

  findById(id: string): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { slug } });
  }

  countByCategoryId(categoryId: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId } });
  }

  async findMany(options: FindProductsOptions): Promise<PaginatedResult<ProductWithCategory>> {
    const { page, limit, categoryId, search, minPrice, maxPrice, sortBy, sortOrder, isActive } =
      options;

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  /** Whether this product has ever appeared in a placed order — determines archive vs hard delete. */
  async hasOrderItems(productId: string): Promise<boolean> {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { productId },
      select: { id: true },
    });
    return orderItem !== null;
  }

  archive(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }
}
