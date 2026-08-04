import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../database';
import { slugify } from '../../common/utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: { name: dto.name, slug: slugify(dto.name) },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
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
      return await this.prisma.category.update({ where: { id }, data });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException('Cannot delete a category that still has products');
      }
      throw error;
    }
  }

  private translateWriteError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('A category with this name already exists');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
