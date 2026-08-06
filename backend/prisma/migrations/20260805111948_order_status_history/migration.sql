-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill a NEW entry for existing orders so history is never empty for pre-existing data
INSERT INTO "order_status_history" ("id", "status", "changedBy", "createdAt", "orderId")
SELECT gen_random_uuid(), 'NEW', 'system', "createdAt", "id" FROM "orders";
