import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { OrdersRepository } from './repositories';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, MockPaymentGatewayService],
  exports: [OrdersService],
})
export class OrdersModule {}
