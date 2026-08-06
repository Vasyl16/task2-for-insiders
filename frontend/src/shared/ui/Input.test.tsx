import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders with the given placeholder', () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('reflects typed input', async () => {
    render(<Input placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email');
    await userEvent.type(input, 'user@example.com');

    expect(input).toHaveValue('user@example.com');
  });

  it('calls onChange as the user types', async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Email" onChange={onChange} />);

    await userEvent.type(screen.getByPlaceholderText('Email'), 'a');

    expect(onChange).toHaveBeenCalled();
  });

  it('forwards disabled to the underlying element', () => {
    render(<Input placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText('Email')).toBeDisabled();
  });
});
