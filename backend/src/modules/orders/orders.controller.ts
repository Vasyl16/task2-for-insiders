import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from '../../common/decorators';
import { PaginationQueryDto } from '../../common/dto';
import { RolesGuard } from '../../common/guards';
import type { AuthenticatedUser } from '../../common/interfaces';
import { OrdersService } from './orders.service';
import {
  AdminOrdersQueryDto,
  OrderListResponseDto,
  OrderResponseDto,
  OrderStatusHistoryResponseDto,
  UpdateOrderStatusDto,
} from './dto';

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

  @Get()
  @ApiOperation({ summary: "List the current user's orders (paginated)" })
  @ApiResponse({ status: 200, type: OrderListResponseDto })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.findMyOrders(user.userId, query);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'List every order across all customers, optionally filtered by status (admin only)',
  })
  @ApiResponse({ status: 200, type: OrderListResponseDto })
  findAllForAdmin(@Query() query: AdminOrdersQueryDto): Promise<OrderListResponseDto> {
    return this.ordersService.findAllForAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id (for polling checkout/fulfillment status)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(user.userId, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: "Get an order's status change history (its owner, or any admin)" })
  @ApiResponse({ status: 200, type: [OrderStatusHistoryResponseDto] })
  getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    return this.ordersService.getOrderHistory(user, id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update an order status through its fulfillment lifecycle (admin only)',
  })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto, user.email);
  }
}
