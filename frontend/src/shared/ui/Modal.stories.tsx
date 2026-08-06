import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'shared/ui/Modal',
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Open: Story = {
  args: {
    isOpen: true,
    title: 'Edit product',
    onClose: () => {},
    children: <p className="text-sm text-slate-600">Modal content goes here.</p>,
  },
};
