import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { CartService } from './cart.service';
import { AddCartItemDto, CartResponseDto, UpdateCartItemDto } from './dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's cart" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  getCart(@CurrentUser() user: AuthenticatedUser): Promise<CartResponseDto> {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a product to the cart (increments quantity if already present)' })
  @ApiResponse({ status: 201, type: CartResponseDto })
  addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(user.userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: "Update a cart item's quantity" })
  @ApiResponse({ status: 200, type: CartResponseDto })
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(user.userId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({ status: 200, type: CartResponseDto })
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(user.userId, itemId);
  }
}
