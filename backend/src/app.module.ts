import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { GlobalExceptionFilter } from './common/filters';
import { JwtAuthGuard } from './common/guards';
import { DatabaseModule } from './modules/database';
import { RedisModule } from './modules/redis';
import { BullModule } from './modules/bull';
import { HealthModule } from './modules/health';
import { EmailModule } from './modules/email';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ProductsModule } from './modules/products';
import { CategoriesModule } from './modules/categories';
import { CartModule } from './modules/cart';
import { OrdersModule } from './modules/orders';
import { AnalyticsModule } from './modules/analytics';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttle.ttl')! * 1000,
          limit: configService.get<number>('throttle.limit')!,
        },
      ],
      inject: [ConfigService],
    }),

    // Infrastructure
    DatabaseModule,
    RedisModule,
    BullModule,
    EmailModule,
    HealthModule,

    // Feature modules (empty scaffolding — implemented incrementally)
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
