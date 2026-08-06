import axios from 'axios';

export function getRegisterErrorMessage(
  error: unknown,
  fallback = 'Could not create an account with those details.',
) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  return fallback;
}
