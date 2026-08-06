export interface AnalyticsRangeParams {
  from?: string;
  to?: string;
}

export interface TopProductsParams extends AnalyticsRangeParams {
  limit?: number;
}

export interface AnalyticsOverview {
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  from: string;
  to: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesPerDay {
  date: string;
  revenue: number;
  ordersCount: number;
}
