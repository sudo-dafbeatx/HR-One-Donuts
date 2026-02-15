'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import GlobalLoading from '@/components/GlobalLoading';

interface LoadingContextType {
  setIsLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Please wait ...');

  const setIsLoading = useCallback((loading: boolean, message?: string) => {
    if (message) setLoadingMessage(message);
    setIsLoadingState(loading);
  }, []);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      <GlobalLoading isVisible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
