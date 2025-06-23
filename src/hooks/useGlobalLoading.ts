
import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useGlobalLoading = () => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
};
