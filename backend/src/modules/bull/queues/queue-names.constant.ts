/**
 * Central registry of BullMQ queue names.
 *
 * When a feature introduces a background job:
 *   1. Add its queue name here (e.g. `ORDERS: 'orders'`).
 *   2. Register it in the owning feature module with
 *      `BullModule.registerQueue({ name: QueueNames.ORDERS })`
 *      (re-exported from `@nestjs/bullmq` via `../bull.module`).
 *   3. Add a processor for it under `modules/bull/processors/`, extending
 *      `BaseProcessor` and decorated with `@Processor(QueueNames.ORDERS)`.
 *
 * No queues are registered yet — this bootstrap only wires the shared
 * connection (see `bull.module.ts`).
 */
export const QueueNames = {} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
