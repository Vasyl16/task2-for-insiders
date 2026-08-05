export interface PaymentReceiptItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentReceiptData {
  orderId: string;
  items: PaymentReceiptItem[];
  totalAmount: number;
  createdAt: Date;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildPaymentReceiptEmailHtml(data: PaymentReceiptData): string {
  const rows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(item.productName)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#475569;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#475569;text-align:right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;text-align:right;font-weight:600;">$${item.lineTotal.toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:20px;color:#0f172a;margin:0 0 4px;">Payment received</h1>
      <p style="font-size:14px;color:#64748b;margin:0 0 24px;">Order #${escapeHtml(data.orderId)} &middot; ${data.createdAt.toLocaleDateString()}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #0f172a;color:#0f172a;">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #0f172a;color:#0f172a;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #0f172a;color:#0f172a;">Price</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #0f172a;color:#0f172a;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:2px solid #0f172a;">
        <span style="font-size:16px;font-weight:600;color:#0f172a;">Total paid</span>
        <span style="font-size:16px;font-weight:600;color:#0f172a;">$${data.totalAmount.toFixed(2)}</span>
      </div>

      <p style="font-size:12px;color:#94a3b8;margin-top:32px;">
        This is a mock receipt from Mini Marketplace's demo checkout — no real payment was processed.
      </p>
    </div>
  `;
}
