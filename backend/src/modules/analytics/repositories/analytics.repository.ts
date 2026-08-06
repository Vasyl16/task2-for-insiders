import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database';

export interface OverviewAggregate {
  revenue: number;
  ordersCount: number;
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesPerDayRow {
  day: Date;
  revenue: number;
  ordersCount: number;
}

export interface OrderExportRow {
  id: string;
  createdAt: Date;
  status: OrderStatus;
  customerEmail: string;
  totalAmount: number;
  itemsCount: number;
}

/**
 * Analytics queries are non-trivial aggregations over orders/order_items
 * (grouping, date truncation), so they get a dedicated repository per the
 * project's repository-pattern threshold rather than living in the service.
 */
@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(from: Date, to: Date): Promise<OverviewAggregate> {
    const result = await this.prisma.order.aggregate({
      where: { status: { not: OrderStatus.CANCELLED }, createdAt: { gte: from, lte: to } },
      _sum: { totalAmount: true },
      _count: true,
    });

    return {
      revenue: Number(result._sum.totalAmount ?? 0),
      ordersCount: result._count,
    };
  }

  async getTopProducts(from: Date, to: Date, limit: number): Promise<TopProductRow[]> {
    const rows = await this.prisma.$queryRaw<
      { productId: string; productName: string; quantitySold: bigint; revenue: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT oi."productId" AS "productId",
             oi."productName" AS "productName",
             SUM(oi.quantity) AS "quantitySold",
             SUM(oi.quantity * oi."unitPrice") AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi."orderId"
      WHERE o.status != ${OrderStatus.CANCELLED}::"OrderStatus"
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY oi."productId", oi."productName"
      ORDER BY revenue DESC
      LIMIT ${limit}
    `);

    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      quantitySold: Number(row.quantitySold),
      revenue: Number(row.revenue),
    }));
  }

  async getSalesPerDay(from: Date, to: Date): Promise<SalesPerDayRow[]> {
    const rows = await this.prisma.$queryRaw<
      { day: Date; revenue: Prisma.Decimal; ordersCount: bigint }[]
    >(Prisma.sql`
      SELECT date_trunc('day', o."createdAt") AS day,
             SUM(o."totalAmount") AS revenue,
             COUNT(*) AS "ordersCount"
      FROM orders o
      WHERE o.status != ${OrderStatus.CANCELLED}::"OrderStatus"
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY day
      ORDER BY day ASC
    `);

    return rows.map((row) => ({
      day: row.day,
      revenue: Number(row.revenue),
      ordersCount: Number(row.ordersCount),
    }));
  }

  async getOrdersForExport(from: Date, to: Date): Promise<OrderExportRow[]> {
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { user: { select: { email: true } }, items: { select: { id: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      customerEmail: order.user.email,
      totalAmount: Number(order.totalAmount),
      itemsCount: order.items.length,
    }));
  }
}
