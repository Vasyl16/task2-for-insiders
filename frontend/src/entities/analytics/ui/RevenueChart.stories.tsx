import type { Meta, StoryObj } from '@storybook/react';
import { RevenueChart } from './RevenueChart';
import type { SalesPerDay } from '../model/analytics.types';

const sampleData: SalesPerDay[] = [
  { date: '2026-07-30', revenue: 128.5, ordersCount: 3 },
  { date: '2026-07-31', revenue: 340.2, ordersCount: 6 },
  { date: '2026-08-01', revenue: 210.75, ordersCount: 4 },
  { date: '2026-08-02', revenue: 95.0, ordersCount: 2 },
  { date: '2026-08-03', revenue: 410.9, ordersCount: 8 },
  { date: '2026-08-04', revenue: 275.4, ordersCount: 5 },
  { date: '2026-08-05', revenue: 505.6, ordersCount: 9 },
];

const meta: Meta<typeof RevenueChart> = {
  title: 'entities/analytics/RevenueChart',
  component: RevenueChart,
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

type Story = StoryObj<typeof RevenueChart>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true, data: undefined },
};

export const Empty: Story = {
  args: { data: [] },
};
