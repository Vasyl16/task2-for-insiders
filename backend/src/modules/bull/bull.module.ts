import { Module } from '@nestjs/common';
import { BullModule as NestBullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

/**
 * Infrastructure module configuring the shared BullMQ connection.
 * Individual queues will be registered by feature modules as they are implemented.
 */
@Module({
  imports: [
    NestBullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password') || undefined,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestBullModule],
})
export class BullModule {}
