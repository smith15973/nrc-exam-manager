// src/hooks/useErrorHandler.ts
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export type ErrorType = 'notFound' | 'network' | 'general';

interface UseErrorHandlerReturn {
  handleError: (error: Error | string, type?: ErrorType) => void;
  navigateToError: (type: ErrorType, message?: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const navigate = useNavigate();

  const handleError = useCallback((error: Error | string, type: ErrorType = 'general') => {
    const message = typeof error === 'string' ? error : error.message;
    console.error(`[${type.toUpperCase()}] Error:`, error);
    
    // Navigate to error page with state
    navigate('/error', { 
      state: { 
        errorType: type, 
        errorMessage: message 
      },
      replace: true 
    });
  }, [navigate]);

  const navigateToError = useCallback((type: ErrorType, message?: string) => {
    navigate('/error', { 
      state: { 
        errorType: type, 
        errorMessage: message 
      },
      replace: true 
    });
  }, [navigate]);

  return {
    handleError,
    navigateToError
  };
};