import type { PropsWithChildren } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

/**
 * Composes every app-wide provider. Add new providers here in the order
 * they should wrap the tree.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}

/* eslint-disable react-refresh/only-export-components -- barrel re-exports both providers and their hooks */
export * from './query-provider';
export * from './theme-provider';
