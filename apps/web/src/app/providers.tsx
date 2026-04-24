'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
      <Toaster 
        theme="dark" 
        position="bottom-left" 
        toastOptions={{ 
          style: { 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)', 
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-inter)',
          } 
        }} 
      />
    </ThemeProvider>
  );
}
