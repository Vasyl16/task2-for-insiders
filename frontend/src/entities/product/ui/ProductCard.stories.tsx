import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import type { Product } from '../model/product.types';

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23e2e8f0'/></svg>";

const sampleProduct: Product = {
  id: '1',
  name: 'Wireless Mechanical Keyboard',
  slug: 'wireless-mechanical-keyboard',
  description: 'A tactile wireless mechanical keyboard with hot-swappable switches.',
  price: 129.99,
  imageUrl: PLACEHOLDER_IMAGE,
  stock: 12,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof ProductCard> = {
  title: 'entities/product/ProductCard',
  component: ProductCard,
  args: { product: sampleProduct },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {};

export const OutOfStock: Story = {
  args: { product: { ...sampleProduct, stock: 0 } },
};

export const LongName: Story = {
  args: {
    product: {
      ...sampleProduct,
      name: 'Extra Long Product Name That Should Wrap Onto A Second Line And Then Clamp',
    },
  },
};
