import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'shared/ui/Toast',
  component: Toast,
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: { variant: 'success', message: 'Order status updated.', onDismiss: () => {} },
};

export const Error: Story = {
  args: { variant: 'error', message: "Couldn't update quantity. Please try again.", onDismiss: () => {} },
};

export const Info: Story = {
  args: { variant: 'info', message: 'A receipt email is on its way.', onDismiss: () => {} },
};
