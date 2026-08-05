import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import {
  InsufficientStockException,
  InvalidOrderStatusTransitionException,
  PaymentFailedException,
} from '../../common/exceptions';
import { OrdersService } from './orders.service';
import { PROCESS_ORDER_JOB } from './orders.constants';
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

  function buildOrder(status: OrderStatus = OrderStatus.NEW): OrderWithItems {
    return {
      id: 'order-1',
      userId,
      status,
      totalAmount: 45,
      cancelReason: null,
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

  let repository: {
    runInTransaction: jest.Mock;
    findCartForCheckout: jest.Mock;
    decrementStock: jest.Mock;
    createOrder: jest.Mock;
    clearCartItems: jest.Mock;
    findById: jest.Mock;
    findManyByUserId: jest.Mock;
    updateStatus: jest.Mock;
  };
  let paymentGateway: jest.Mocked<Pick<MockPaymentGatewayService, 'charge'>>;
  let ordersQueue: { add: jest.Mock };
  let ordersService: OrdersService;

  beforeEach(() => {
    repository = {
      runInTransaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
      findCartForCheckout: jest.fn(),
      decrementStock: jest.fn(),
      createOrder: jest.fn(),
      clearCartItems: jest.fn(),
      findById: jest.fn(),
      findManyByUserId: jest.fn(),
      updateStatus: jest.fn(),
    };
    paymentGateway = { charge: jest.fn() };
    ordersQueue = { add: jest.fn().mockResolvedValue(undefined) };

    ordersService = new OrdersService(
      repository as unknown as OrdersRepository,
      paymentGateway as unknown as MockPaymentGatewayService,
      ordersQueue as never,
    );
  });

  describe('checkout', () => {
    it('rejects when the user has no cart', async () => {
      repository.findCartForCheckout.mockResolvedValue(null);

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(paymentGateway.charge).not.toHaveBeenCalled();
      expect(repository.decrementStock).not.toHaveBeenCalled();
      expect(ordersQueue.add).not.toHaveBeenCalled();
    });

    it('rejects when the cart has no items', async () => {
      repository.findCartForCheckout.mockResolvedValue({ ...buildCart(), items: [] });

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(BadRequestException);
      expect(paymentGateway.charge).not.toHaveBeenCalled();
      expect(ordersQueue.add).not.toHaveBeenCalled();
    });

    it('charges the cart subtotal before touching stock', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.decrementStock.mockResolvedValue(true);
      repository.createOrder.mockResolvedValue(buildOrder());

      await ordersService.checkout(userId);

      // 2 * 10 + 1 * 25 = 45
      expect(paymentGateway.charge).toHaveBeenCalledWith(45);
    });

    it('rejects with PaymentFailedException and never touches stock or creates the order when payment is declined', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      paymentGateway.charge.mockResolvedValue({ success: false, reason: 'card declined' });

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(PaymentFailedException);
      expect(repository.decrementStock).not.toHaveBeenCalled();
      expect(repository.createOrder).not.toHaveBeenCalled();
      expect(repository.clearCartItems).not.toHaveBeenCalled();
      expect(ordersQueue.add).not.toHaveBeenCalled();
    });

    it('rejects with InsufficientStockException and never enqueues processing when a decrement fails', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.decrementStock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      await expect(ordersService.checkout(userId)).rejects.toBeInstanceOf(
        InsufficientStockException,
      );
      expect(repository.decrementStock).toHaveBeenCalledTimes(2);
      expect(repository.createOrder).not.toHaveBeenCalled();
      expect(repository.clearCartItems).not.toHaveBeenCalled();
      expect(ordersQueue.add).not.toHaveBeenCalled();
    });

    it('decrements stock for every line item in a fixed, deadlock-avoiding order', async () => {
      const cart = buildCart();
      repository.findCartForCheckout.mockResolvedValue(cart);
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.decrementStock.mockResolvedValue(true);
      repository.createOrder.mockResolvedValue(buildOrder());

      await ordersService.checkout(userId);

      expect(repository.decrementStock).toHaveBeenNthCalledWith(1, expect.anything(), 'prod-1', 2);
      expect(repository.decrementStock).toHaveBeenNthCalledWith(2, expect.anything(), 'prod-2', 1);
    });

    it('creates the order as NEW with a snapshot of each line item, clears the cart, and enqueues processing', async () => {
      repository.findCartForCheckout.mockResolvedValue(buildCart());
      paymentGateway.charge.mockResolvedValue({ success: true, transactionId: 'txn-1' });
      repository.decrementStock.mockResolvedValue(true);
      repository.createOrder.mockResolvedValue(buildOrder());

      const result = await ordersService.checkout(userId);

      expect(repository.createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: OrderStatus.NEW,
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
      expect(ordersQueue.add).toHaveBeenCalledWith(PROCESS_ORDER_JOB, { orderId: 'order-1' });
      expect(result).toEqual({
        id: 'order-1',
        status: OrderStatus.NEW,
        totalAmount: 45,
        cancelReason: null,
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

  describe('getOrderById', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(ordersService.getOrderById(userId, 'order-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the order belongs to another user', async () => {
      repository.findById.mockResolvedValue({ ...buildOrder(), userId: 'someone-else' });

      await expect(ordersService.getOrderById(userId, 'order-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the mapped order when it belongs to the requesting user', async () => {
      repository.findById.mockResolvedValue(buildOrder(OrderStatus.PROCESSING));

      const result = await ordersService.getOrderById(userId, 'order-1');

      expect(result.status).toBe(OrderStatus.PROCESSING);
      expect(result.id).toBe('order-1');
    });
  });

  describe('findMyOrders', () => {
    it('paginates and maps the user orders', async () => {
      repository.findManyByUserId.mockResolvedValue({ items: [buildOrder()], total: 1 });

      const result = await ordersService.findMyOrders(userId, { page: 1, limit: 20 });

      expect(repository.findManyByUserId).toHaveBeenCalledWith(userId, { page: 1, limit: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        ordersService.updateStatus('order-1', { status: OrderStatus.PROCESSING }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it.each([
      [OrderStatus.NEW, OrderStatus.PROCESSING],
      [OrderStatus.NEW, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING, OrderStatus.SHIPPED],
      [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED, OrderStatus.COMPLETED],
    ])('allows %s -> %s', async (from, to) => {
      repository.findById.mockResolvedValue(buildOrder(from));
      repository.updateStatus.mockResolvedValue(buildOrder(to));

      const result = await ordersService.updateStatus('order-1', { status: to });

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        to,
        to === OrderStatus.CANCELLED ? null : undefined,
      );
      expect(result.status).toBe(to);
    });

    it.each([
      [OrderStatus.NEW, OrderStatus.SHIPPED],
      [OrderStatus.NEW, OrderStatus.COMPLETED],
      [OrderStatus.PROCESSING, OrderStatus.COMPLETED],
      [OrderStatus.SHIPPED, OrderStatus.PROCESSING],
      [OrderStatus.COMPLETED, OrderStatus.SHIPPED],
      [OrderStatus.CANCELLED, OrderStatus.PROCESSING],
    ])('rejects %s -> %s', async (from, to) => {
      repository.findById.mockResolvedValue(buildOrder(from));

      await expect(ordersService.updateStatus('order-1', { status: to })).rejects.toBeInstanceOf(
        InvalidOrderStatusTransitionException,
      );
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('stores the cancellation reason when cancelling', async () => {
      repository.findById.mockResolvedValue(buildOrder(OrderStatus.NEW));
      repository.updateStatus.mockResolvedValue(buildOrder(OrderStatus.CANCELLED));

      await ordersService.updateStatus('order-1', {
        status: OrderStatus.CANCELLED,
        reason: 'Customer requested cancellation',
      });

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.CANCELLED,
        'Customer requested cancellation',
      );
    });
  });
});
