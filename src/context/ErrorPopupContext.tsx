'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import ErrorCard from '@/components/ui/ErrorCard';

interface ErrorPopupContextType {
  showError: (title?: string, message?: string) => void;
}

const ErrorPopupContext = createContext<ErrorPopupContextType>({
  showError: () => {},
});

export function useErrorPopup() {
  return useContext(ErrorPopupContext);
}

export function ErrorPopupProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const showError = useCallback((title?: string, message?: string) => {
    setError({
      title: title || 'Terjadi Kesalahan',
      message: message || 'Silakan coba lagi.',
    });
  }, []);

  const handleClose = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorPopupContext.Provider value={{ showError }}>
      {children}
      {error && (
        <ErrorCard
          title={error.title}
          message={error.message}
          onClose={handleClose}
        />
      )}
    </ErrorPopupContext.Provider>
  );
}
