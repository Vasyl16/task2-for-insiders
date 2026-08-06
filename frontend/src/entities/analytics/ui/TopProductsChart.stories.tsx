import type { Meta, StoryObj } from '@storybook/react';
import { TopProductsChart } from './TopProductsChart';
import type { TopProduct } from '../model/analytics.types';

const sampleData: TopProduct[] = [
  { productId: '1', productName: 'Wireless Mechanical Keyboard', quantitySold: 42, revenue: 5459.58 },
  { productId: '2', productName: 'Noise Cancelling Headphones', quantitySold: 31, revenue: 4029.69 },
  { productId: '3', productName: 'Ultra HD Webcam', quantitySold: 25, revenue: 1999.75 },
  { productId: '4', productName: 'Ergonomic Office Chair', quantitySold: 18, revenue: 1799.82 },
  { productId: '5', productName: 'USB-C Docking Station', quantitySold: 12, revenue: 959.88 },
];

const meta: Meta<typeof TopProductsChart> = {
  title: 'entities/analytics/TopProductsChart',
  component: TopProductsChart,
  args: { data: sampleData, isLoading: false },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TopProductsChart>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true, data: undefined },
};

export const Empty: Story = {
  args: { data: [] },
};
