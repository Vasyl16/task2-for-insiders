import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import type { AuthenticatedUser } from '../../common/interfaces';
import {
  ALLOWED_PRODUCT_IMAGE_MIME_TYPES,
  MAX_PRODUCT_IMAGE_SIZE_BYTES,
  PRODUCT_IMAGES_DIR,
  PRODUCT_IMAGES_URL_PREFIX,
} from './products.constants';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  ProductListResponseDto,
  ProductResponseDto,
  ProductsQueryDto,
  UpdateProductDto,
  UploadImageResponseDto,
} from './dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List products (paginated, filterable, sortable). Non-admins always see active products only; admins can pass `status` to include archived products.',
  })
  @ApiResponse({ status: 200, type: ProductListResponseDto })
  findAll(
    @Query() query: ProductsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductListResponseDto> {
    return this.productsService.findAll(query, user.role === Role.ADMIN);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by id. Archived products are only visible to admins.',
  })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductResponseDto> {
    return this.productsService.findById(id, user.role === Role.ADMIN);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a product (admin only)' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Archive a product (admin only). Archived products remain in the database as soft-deleted.',
  })
  @ApiResponse({ status: 204, description: 'Archived or already archived.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.delete(id);
  }

  @Patch(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Restore an archived product (admin only).' })
  @ApiResponse({ status: 204, description: 'Restored or already active.' })
  restore(@Param('id') id: string): Promise<void> {
    return this.productsService.restore(id);
  }

  @Post('images')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: PRODUCT_IMAGES_DIR,
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_PRODUCT_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException('Only JPEG, PNG, WebP, or GIF images are allowed'),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @ApiOperation({
    summary: 'Upload a product image and get back a URL to use as imageUrl (admin only)',
  })
  @ApiResponse({ status: 201, type: UploadImageResponseDto })
  uploadImage(@UploadedFile() file?: Express.Multer.File): UploadImageResponseDto {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { url: `${PRODUCT_IMAGES_URL_PREFIX}/${file.filename}` };
  }
}
