import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from '../bull';
import { ProductsModule } from '../products';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { OrdersRepository } from './repositories';
import { OrderProcessingProcessor } from './processors';

@Module({
  imports: [
    ProductsModule,
    BullModule.registerQueue({
      name: QueueNames.ORDERS,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, MockPaymentGatewayService, OrderProcessingProcessor],
  exports: [OrdersService],
})
export class OrdersModule {}
