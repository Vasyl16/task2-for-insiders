/**
 * Central registry of BullMQ queue names.
 *
 * When a feature introduces a background job:
 *   1. Add its queue name here (e.g. `ORDERS: 'orders'`).
 *   2. Register it in the owning feature module with
 *      `BullModule.registerQueue({ name: QueueNames.ORDERS })`
 *      (re-exported from `@nestjs/bullmq` via `../bull.module`).
 *   3. Add a processor for it inside that feature module (e.g.
 *      `modules/orders/processors/`), extending `BaseProcessor` from this
 *      module and decorated with `@Processor(QueueNames.ORDERS)`. It lives
 *      in the feature module (not here) so it can depend on that module's
 *      repositories/services without a circular import back into `bull`.
 */
export const QueueNames = {
  ORDERS: 'orders',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];
