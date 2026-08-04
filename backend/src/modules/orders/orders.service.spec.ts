import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { InsufficientStockException, PaymentFailedException } from '../../common/exceptions';
import { OrdersService } from './orders.service';
import type { MockPaymentGatewayService } from './mock-payment-gateway.service';
import type { CartForCheckout, OrderWithItems, OrdersRepository } from './repositories';

describe('OrdersService', () => {
  const userId = 'user-1';
  const now = new Date('2026-01-01T00:00:00.000Z');

  const buildProduct = (overrides: { id: string; name: string; price: number; stock: number }) => ({
    slug: overrides.name.toLowerCase(),
    description: 'A product',
    imageUrl: 'https://example.com/product.png',
    categoryId: 'cat-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  const buildCart = (): CartForCheckout =>
    ({
      id: 'cart-1',
      userId,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: 'item-1',
          cartId: 'cart-1',
          productId: 'prod-1',
          quantity: 2,
          createdAt: now,
          updatedAt: now,
          product: buildProduct({ id: 'prod-1', name: 'Widget', price: 10, stock: 5 }),
        },
        {
          id: 'item-2',
          cartId: 'cart-1',
          productId: 'prod-2',
          quantity: 1,
          createdAt: now,
          updatedAt: now,
          product: buildProduct({ id: 'prod-2', name: 'Gadget', price: 25, stock: 1 }),
        },
      ],
    }) as unknown as CartForCheckout;

  let repository: {
    runInTransaction: jest.Mock;
    findCartForCheckout: jest.Mock;
    decrementStock: jest.Mock;
    createOrder: jest.Mock;
    clearCartItems: jest.Mock;
  };
  let paymentGateway: jest.Mocked<Pick<MockPaymentGatewayService, 'charge'>>;
  let ordersService: OrdersService;

  beforeEach(() => {
    repository = {
      runInTransaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
      findCartForCheckout: jest.fn(),
      decrementStock: jest.fn(),
      createOrder: jest.fn(),
      clearCartItems: jest.fn(),
    };
    paymentGateway = {
      charge: jest.fn(),
    };

    ordersService = new OrdersService(
      repository as unknown as OrdersRepository,
      paymentGateway as unknown as MockPaymentGatewayService,
    );
  });

  describe('checkout', () => {
    it('rejects when the user has no cart', async () => {
      repository.findCartForCheckout.mockResolvedValue(null);

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.decrementStock).not.toHaveBeenCalled();
      expect(paymentGateway.charge).not.toHaveBeenCalled();
    });

    it('rejects when the cart has no items', async () => {
      repository.findCartForCheckout.mockResolvedValue({ ...buildCart(), items: [] });

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(paymentGateway.charge).not.toHaveBeenCalled();
    });

    it('rejects with InsufficientStockException and never charges payment when a decrement fails', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      repository.decrementStock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(
        InsufficientStockException,
      );
      expect(repository.decrementStock).toHaveBeenCalledTimes(2);
      expect(paymentGateway.charge).not.toHaveBeenCalled();
      expect(repository.createOrder).not.toHaveBeenCalled();
      expect(repository.clearCartItems).not.toHaveBeenCalled();
    });

    it('decrements stock for every line item in a fixed, deadlock-avoiding order', async () => {
      const cart = buildCart();
      repository.findCartForCheckout.mockResolvedValue(cart);
      repository.decrementStock.mockResolvedValue(true);
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.createOrder.mockResolvedValue(buildOrder());

      await ordersService.checkout(userId);

      expect(repository.decrementStock).toHaveBeenNthCalledWith(1, expect.anything(), 'prod-1', 2);
      expect(repository.decrementStock).toHaveBeenNthCalledWith(2, expect.anything(), 'prod-2', 1);
    });

    it('rejects with PaymentFailedException and never creates the order when payment is declined', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      repository.decrementStock.mockResolvedValue(true);
      paymentGateway.charge.mockResolvedValue({ success: false, reason: 'card declined' });

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(PaymentFailedException);
      expect(repository.createOrder).not.toHaveBeenCalled();
      expect(repository.clearCartItems).not.toHaveBeenCalled();
    });

    it('charges the cart subtotal', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      repository.decrementStock.mockResolvedValue(true);
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.createOrder.mockResolvedValue(buildOrder());

      await ordersService.checkout(userId);

      // 2 * 10 + 1 * 25 = 45
      expect(paymentGateway.charge).toHaveBeenCalledWith(45);
    });

    it('creates the order with a snapshot of each line item and clears the cart on success', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      repository.decrementStock.mockResolvedValue(true);
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.createOrder.mockResolvedValue(buildOrder());

      const result = await ordersService.checkout(userId);

      expect(repository.createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: OrderStatus.PAID,
          totalAmount: 45,
          user: { connect: { id: userId } },
          items: {
            create: [
              { productId: 'prod-1', productName: 'Widget', quantity: 2, unitPrice: 10 },
              { productId: 'prod-2', productName: 'Gadget', quantity: 1, unitPrice: 25 },
            ],
          },
        }),
      );
      expect(repository.clearCartItems).toHaveBeenCalledWith(expect.anything(), 'cart-1');
      expect(result).toEqual({
        id: 'order-1',
        status: OrderStatus.PAID,
        totalAmount: 45,
        createdAt: now,
        items: [
          {
            id: 'oi-1',
            productId: 'prod-1',
            productName: 'Widget',
            quantity: 2,
            unitPrice: 10,
            lineTotal: 20,
          },
          {
            id: 'oi-2',
            productId: 'prod-2',
            productName: 'Gadget',
            quantity: 1,
            unitPrice: 25,
            lineTotal: 25,
          },
        ],
      });
    });
  });

  function buildOrder(): OrderWithItems {
    return {
      id: 'order-1',
      userId,
      status: OrderStatus.PAID,
      totalAmount: 45,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: 'oi-1',
          orderId: 'order-1',
          productId: 'prod-1',
          productName: 'Widget',
          quantity: 2,
          unitPrice: 10,
          createdAt: now,
        },
        {
          id: 'oi-2',
          orderId: 'order-1',
          productId: 'prod-2',
          productName: 'Gadget',
          quantity: 1,
          unitPrice: 25,
          createdAt: now,
        },
      ],
    } as unknown as OrderWithItems;
  }
});
