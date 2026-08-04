import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    // Individual indicators (database, redis, disk, memory) will be added
    // once their respective infrastructure modules are fully implemented.
    return this.health.check([]);
  }
}
