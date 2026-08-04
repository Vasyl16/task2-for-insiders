import { Module } from '@nestjs/common';
import { ProductsModule } from '../products';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories';

@Module({
  imports: [ProductsModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
