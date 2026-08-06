import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PriceRangeInput } from './PriceRangeInput';

const meta: Meta<typeof PriceRangeInput> = {
  title: 'features/catalog-search/PriceRangeInput',
  component: PriceRangeInput,
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof PriceRangeInput>;

function InteractivePriceRangeInput() {
  const [range, setRange] = useState<{ min: number | undefined; max: number | undefined }>({
    min: undefined,
    max: undefined,
  });
  return (
    <PriceRangeInput
      minPrice={range.min}
      maxPrice={range.max}
      onChange={(min, max) => setRange({ min, max })}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractivePriceRangeInput />,
};

export const Empty: Story = {
  args: { minPrice: undefined, maxPrice: undefined, onChange: () => {} },
};

export const WithValues: Story = {
  args: { minPrice: 20, maxPrice: 150, onChange: () => {} },
};

export const InvalidRange: Story = {
  args: { minPrice: 200, maxPrice: 50, onChange: () => {} },
};
