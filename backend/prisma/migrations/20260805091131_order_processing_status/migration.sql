-- Recreate OrderStatus with NEW/PROCESSING replacing the unused PENDING value,
-- so orders can move through an async NEW -> PROCESSING -> PAID/CANCELLED flow.
CREATE TYPE "OrderStatus_new" AS ENUM ('NEW', 'PROCESSING', 'PAID', 'CANCELLED');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'NEW'
    ELSE "status"::text
  END
)::"OrderStatus_new";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'NEW';

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "cancelReason" TEXT;
