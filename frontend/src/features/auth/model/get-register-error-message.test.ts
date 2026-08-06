import { describe, expect, it } from 'vitest';
import { getRegisterErrorMessage } from './get-register-error-message';

describe('getRegisterErrorMessage', () => {
  it('returns the backend message when the API returns one', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Email is already registered',
        },
      },
    };

    expect(getRegisterErrorMessage(error)).toBe('Email is already registered');
  });

  it('falls back to the default message when the error has no API message', () => {
    expect(getRegisterErrorMessage(new Error('unexpected'))).toBe('Could not create an account with those details.');
  });
});
