import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { InsufficientStockException } from '../../common/exceptions';
import { roundToCents } from '../../common/utils';
import { ProductsService } from '../products';
import { CartRepository, type CartWithItems } from './repositories';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(userId);
    return this.toResponse(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponseDto> {
    const product = await this.productsService.findById(dto.productId);

    const cart = await this.getOrCreateCart(userId);
    const existing = await this.cartRepository.findItemByCartAndProduct(cart.id, dto.productId);
    const nextQuantity = (existing?.quantity ?? 0) + dto.quantity;

    if (nextQuantity > product.stock) {
      throw new InsufficientStockException(product.stock);
    }

    if (existing) {
      await this.cartRepository.updateItemQuantity(existing.id, nextQuantity);
    } else {
      await this.cartRepository.createItem(cart.id, dto.productId, dto.quantity);
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.getOwnedItem(userId, itemId);

    if (dto.quantity > item.product.stock) {
      throw new InsufficientStockException(item.product.stock);
    }

    await this.cartRepository.updateItemQuantity(itemId, dto.quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
    await this.getOwnedItem(userId, itemId);
    await this.cartRepository.deleteItem(itemId);
    return this.getCart(userId);
  }

  private async getOrCreateCart(userId: string): Promise<{ id: string }> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (cart) {
      return cart;
    }
    return this.cartRepository.createForUser(userId);
  }

  private async getOwnedItem(userId: string, itemId: string) {
    const item = await this.cartRepository.findItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    return item;
  }

  private toResponse(cart: CartWithItems | null): CartResponseDto {
    if (!cart) {
      return { id: null, items: [], totalItems: 0, subtotal: 0 };
    }

    const items = cart.items.map((item): CartItemResponseDto => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: this.toProductSummary(item.product),
      lineTotal: roundToCents(Number(item.product.price) * item.quantity),
    }));

    return {
      id: cart.id,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: roundToCents(items.reduce((sum, item) => sum + item.lineTotal, 0)),
    };
  }

  private toProductSummary(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: Number(product.price),
      stock: product.stock,
    };
  }
}
