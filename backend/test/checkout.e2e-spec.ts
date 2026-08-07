import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/database';
import { EmailService } from '../src/modules/email/email.service';
import { MockPaymentGatewayService } from '../src/modules/orders/mock-payment-gateway.service';

jest.setTimeout(120000);

/**
 * End-to-end checkout flow: register -> add to cart -> checkout -> stock
 * decrements -> the BullMQ worker asynchronously advances NEW -> PROCESSING
 * -> an admin drives the rest of the fulfillment lifecycle -> the order
 * shows up in admin analytics. Exercises the full HTTP stack (guards,
 * pipes, real Postgres + Redis + BullMQ), not just service-level logic
 * (already covered by orders.service.spec.ts).
 *
 * The mock payment gateway declines ~50% of charges at random by design
 * (see mock-payment-gateway.service.ts) — that's exercised by
 * orders.service.spec.ts. Here it's overridden to always succeed so this
 * suite tests checkout orchestration deterministically.
 */
describe('Checkout (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const suffix = Date.now();
  const adminEmail = `checkout-e2e-admin-${suffix}@example.com`;
  const customerEmail = `checkout-e2e-customer-${suffix}@example.com`;
  const password = 'Password123!';

  let customerToken: string;
  let adminToken: string;
  let productId: string;
  let orderId: string;

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Polls GET /orders/:id (as the owning customer) until the async worker moves it out of NEW. */
  async function waitForOrderStatus(
    expectedStatus: string,
    timeoutMs = 10000,
  ): Promise<Record<string, unknown>> {
    const deadline = Date.now() + timeoutMs;
    let last: Record<string, unknown> = {};
    while (Date.now() < deadline) {
      const res = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);
      last = res.body as Record<string, unknown>;
      if (last.status === expectedStatus) {
        return last;
      }
      await sleep(250);
    }
    throw new Error(
      `Order ${orderId} never reached ${expectedStatus}; last seen status was ${String(last.status)}`,
    );
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MockPaymentGatewayService)
      .useValue({ charge: async () => ({ success: true, transactionId: 'e2e-test-txn' }) })
      .overrideProvider(EmailService)
      .useValue({ sendPaymentReceipt: async () => undefined })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password, confirmPassword: password })
      .expect(201);
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    adminToken = (adminLogin.body as { accessToken: string }).accessToken;

    const customerRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: customerEmail, password, confirmPassword: password })
      .expect(201);
    customerToken = (customerRegister.body as { accessToken: string }).accessToken;

    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Checkout E2E Category ${suffix}` })
      .expect(201);

    const productRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Checkout E2E Product ${suffix}`,
        description: 'A product created for the checkout e2e test.',
        price: 19.99,
        imageUrl: 'https://example.com/e2e-product.png',
        stock: 10,
        categoryId: (categoryRes.body as { id: string }).id,
      })
      .expect(201);
    productId = (productRes.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds the product to the cart', async () => {
    const res = await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.subtotal).toBeCloseTo(39.98);
  });

  it('rejects checkout when the cart is empty', async () => {
    // Uses a second, cart-less customer so it doesn't disturb the first customer's cart.
    const otherEmail = `checkout-e2e-empty-cart-${suffix}@example.com`;
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: otherEmail, password, confirmPassword: password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${(register.body as { accessToken: string }).accessToken}`)
      .expect(400);
  });

  it('checks out the cart, charges the subtotal, decrements stock, and clears the cart', async () => {
    const checkoutRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(201);

    orderId = (checkoutRes.body as { id: string }).id;
    expect(checkoutRes.body.status).toBe('NEW');
    expect(checkoutRes.body.totalAmount).toBeCloseTo(39.98);
    expect(checkoutRes.body.items).toEqual([
      expect.objectContaining({ productId, quantity: 2, unitPrice: 19.99 }),
    ]);

    const productRes = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(productRes.body.stock).toBe(8);

    const cartRes = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(cartRes.body.items).toHaveLength(0);
  });

  it("lists the order in the customer's own order history", async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.items.some((order: { id: string }) => order.id === orderId)).toBe(true);
  });

  it('does not let a different customer view this order', async () => {
    const strangerEmail = `checkout-e2e-stranger-${suffix}@example.com`;
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: strangerEmail, password, confirmPassword: password })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${(register.body as { accessToken: string }).accessToken}`)
      .expect(404);
  });

  it('the async worker advances the order from NEW to PROCESSING', async () => {
    const order = await waitForOrderStatus('PROCESSING');
    expect(order.status).toBe('PROCESSING');
  }, 15000);

  it('an admin sees the order and drives it through SHIPPED -> COMPLETED', async () => {
    const adminListRes = await request(app.getHttpServer())
      .get('/orders/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(adminListRes.body.items.some((order: { id: string }) => order.id === orderId)).toBe(
      true,
    );

    const shippedRes = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' })
      .expect(200);
    expect(shippedRes.body.status).toBe('SHIPPED');

    const completedRes = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(completedRes.body.status).toBe('COMPLETED');

    const historyRes = await request(app.getHttpServer())
      .get(`/orders/${orderId}/history`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const statuses = (historyRes.body as { status: string }[]).map((entry) => entry.status);
    expect(statuses).toEqual(['NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED']);
  });

  it('rejects a non-admin from updating order status', async () => {
    await request(app.getHttpServer())
      .patch(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'SHIPPED' })
      .expect(403);
  });

  it('reflects the completed order in the admin analytics overview and export', async () => {
    const overviewRes = await request(app.getHttpServer())
      .get('/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(overviewRes.body.ordersCount).toBeGreaterThan(0);
    expect(overviewRes.body.revenue).toBeGreaterThanOrEqual(39.98);

    const exportRes = await request(app.getHttpServer())
      .get('/analytics/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(exportRes.text).toContain(orderId);
  });
});
