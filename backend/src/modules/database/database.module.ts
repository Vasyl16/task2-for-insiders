import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global infrastructure module exposing PrismaService to the rest of the application.
 * No schema/models are defined yet — this only wires the connection lifecycle.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
