import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces';
import { OrdersService } from './orders.service';
import { OrderResponseDto } from './dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Check out the current user's cart and create an order" })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  checkout(@CurrentUser() user: AuthenticatedUser): Promise<OrderResponseDto> {
    return this.ordersService.checkout(user.userId);
  }
}
