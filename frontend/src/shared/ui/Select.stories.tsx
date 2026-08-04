import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const OPTIONS = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
];

const meta: Meta<typeof Select> = {
  title: 'shared/ui/Select',
  component: Select,
  args: { options: OPTIONS, 'aria-label': 'Category' },
};
export default meta;

type Story = StoryObj<typeof Select>;

function InteractiveSelect() {
  const [value, setValue] = useState('');
  return <Select options={OPTIONS} value={value} onChange={setValue} placeholder="All categories" aria-label="Category" />;
}

export const Interactive: Story = {
  render: () => <InteractiveSelect />,
};

export const WithValue: Story = {
  args: { value: 'books' },
};

export const Disabled: Story = {
  args: { value: '', disabled: true, placeholder: 'Loading…' },
};
