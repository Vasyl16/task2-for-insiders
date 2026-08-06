import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormError } from './FormError';

describe('FormError', () => {
  it('renders the message when one is provided', () => {
    render(<FormError message="This field is required." />);
    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('renders nothing when there is no message', () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });
});
