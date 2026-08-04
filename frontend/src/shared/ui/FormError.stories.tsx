import type { Meta, StoryObj } from '@storybook/react';
import { FormError } from './FormError';

const meta: Meta<typeof FormError> = {
  title: 'shared/ui/FormError',
  component: FormError,
};
export default meta;

type Story = StoryObj<typeof FormError>;

export const WithMessage: Story = {
  args: { message: 'This field is required.' },
};

export const NoMessage: Story = {
  args: { message: undefined },
};
