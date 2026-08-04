import { Logger } from '@nestjs/common';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

/**
 * Base class every BullMQ worker extends. Handles lifecycle logging so a
 * concrete processor only has to implement `process()` and decorate itself
 * with `@Processor(QueueNames.<NAME>)`.
 *
 * No queue currently extends this — it exists as the ready-made shape for
 * the first background job a feature module introduces.
 */
export abstract class BaseProcessor<T = unknown> extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);

  abstract process(job: Job<T>): Promise<unknown>;

  @OnWorkerEvent('completed')
  onCompleted(job: Job<T>): void {
    this.logger.log(`Job ${job.id} (${job.name}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<T>, error: Error): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`, error.stack);
  }
}
