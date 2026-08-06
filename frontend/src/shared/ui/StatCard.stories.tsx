import type { Meta, StoryObj } from '@storybook/react';
import { DollarSign } from 'lucide-react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'shared/ui/StatCard',
  component: StatCard,
  args: { label: 'Revenue', value: '$1,284.50', isLoading: false, Icon: DollarSign },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true, value: undefined },
};

export const ZeroValue: Story = {
  args: { value: 0 },
};
