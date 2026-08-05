-- Replace the payment-outcome status (PAID) with a full admin-managed
-- fulfillment lifecycle (SHIPPED, COMPLETED). Existing PAID orders map to
-- COMPLETED, the closest terminal-success equivalent under the old model.
CREATE TYPE "OrderStatus_new" AS ENUM ('NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PAID' THEN 'COMPLETED'
    ELSE "status"::text
  END
)::"OrderStatus_new";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'NEW';

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
