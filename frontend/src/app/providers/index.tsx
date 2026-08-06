import type { PropsWithChildren } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';

/**
 * Composes every app-wide provider. Add new providers here in the order
 * they should wrap the tree. Session state lives in the React Query cache
 * (see entities/session) rather than a dedicated context provider.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <QueryProvider>{children}</QueryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/* eslint-disable react-refresh/only-export-components -- barrel re-exports both providers and their hooks */
export * from './query-provider';
export * from './theme-provider';
export * from './toast-provider';
