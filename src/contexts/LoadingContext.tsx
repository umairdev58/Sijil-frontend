import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  }, []);

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const value: LoadingContextType = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    setLoadingMessage: updateLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <LoadingSpinner
          size="fullscreen"
          variant="spinner"
          message={loadingMessage}
          showMessage={true}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for API calls with automatic loading state
export const useApiWithLoading = () => {
  const { showLoading, hideLoading, setLoadingMessage } = useLoading();

  const callWithLoading = useCallback(
    async function<T>(
      apiCall: () => Promise<T>,
      loadingMessage?: string,
      successMessage?: string,
      errorMessage?: string
    ): Promise<T> {
      try {
        if (loadingMessage) {
          showLoading(loadingMessage);
        }
        
        const result = await apiCall();
        
        if (successMessage) {
          setLoadingMessage(successMessage);
          // Show success message briefly
          setTimeout(() => {
            hideLoading();
          }, 1000);
        } else {
          hideLoading();
        }
        
        return result;
      } catch (error) {
        hideLoading();
        if (errorMessage) {
          console.error(errorMessage, error);
        }
        throw error;
      }
    },
    [showLoading, hideLoading, setLoadingMessage]
  );

  return { callWithLoading };
};

export default LoadingContext;
