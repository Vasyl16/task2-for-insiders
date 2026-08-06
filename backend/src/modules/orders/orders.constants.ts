import { OrderStatus } from '@prisma/client';

export const PROCESS_ORDER_JOB = 'process-order';

/** `changedBy` value recorded for status transitions not made by an admin. */
export const SYSTEM_ACTOR = 'system';

/**
 * Allowed admin-driven status transitions. NEW -> PROCESSING is also
 * enforced here for consistency, though in practice that step is only ever
 * taken by OrderProcessingProcessor, not the admin endpoint.
 * COMPLETED and CANCELLED are terminal — no further transitions.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};
