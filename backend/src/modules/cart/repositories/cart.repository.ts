import { Injectable } from '@nestjs/common';
import { Cart, CartItem, Prisma } from '@prisma/client';
import { PrismaService } from '../../database';

export type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type CartItemWithProductAndCart = Prisma.CartItemGetPayload<{
  include: { product: true; cart: true };
}>;

/**
 * Encapsulates cart/cart-item query composition so CartService stays
 * focused on business rules (stock validation, ownership).
 */
@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
    });
  }

  createForUser(userId: string): Promise<Cart> {
    return this.prisma.cart.create({ data: { userId } });
  }

  findItemById(itemId: string): Promise<CartItemWithProductAndCart | null> {
    return this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, cart: true },
    });
  }

  findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
  }

  createItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.create({ data: { cartId, productId, quantity } });
  }

  updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  deleteItem(itemId: string): Promise<CartItem> {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}
