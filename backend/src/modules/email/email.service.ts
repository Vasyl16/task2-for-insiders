import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { buildPaymentReceiptEmailHtml, type PaymentReceiptData } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.resendApiKey');
    this.fromEmail = this.configService.get<string>('email.fromEmail')!;
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async sendPaymentReceipt(to: string, receipt: PaymentReceiptData): Promise<void> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY is not configured — skipping payment receipt email');
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: `Payment received — Order #${receipt.orderId.slice(0, 8)}`,
      html: buildPaymentReceiptEmailHtml(receipt),
    });

    if (error) {
      this.logger.warn(
        `Resend rejected the receipt for order ${receipt.orderId}: ${error.message}`,
      );
    }
  }
}
