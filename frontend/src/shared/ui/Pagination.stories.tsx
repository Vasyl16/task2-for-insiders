import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'shared/ui/Pagination',
  component: Pagination,
};
export default meta;

type Story = StoryObj<typeof Pagination>;

function InteractivePagination() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} totalPages={5} onPageChange={setPage} />;
}

export const Interactive: Story = {
  render: () => <InteractivePagination />,
};

export const SinglePage: Story = {
  args: { page: 1, totalPages: 1, onPageChange: () => {} },
};
