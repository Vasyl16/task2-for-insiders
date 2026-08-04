import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../../common/utils';
import { PaginationMetaDto } from '../../common/dto';
import { ProductsRepository, type ProductWithCategory } from './repositories';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';
import { ProductsQueryDto } from './dto/products-query.dto';

const MAX_SLUG_ATTEMPTS = 50;

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

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
      return this.toResponse(product);
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async findAll(query: ProductsQueryDto): Promise<ProductListResponseDto> {
    const { page, limit, categoryId, search, sortBy, sortOrder } = query;
    const { items, total } = await this.productsRepository.findMany({
      page,
      limit,
      categoryId,
      search,
      sortBy,
      sortOrder,
    });

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: new PaginationMetaDto(page, limit, total),
    };
  }

  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponse(product);
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
      return this.toResponse(product);
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.productsRepository.delete(id);
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
