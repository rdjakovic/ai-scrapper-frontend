import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ErrorToast, { ToastMessage } from '../components/ErrorToast';

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], options?: Partial<ToastMessage>) => void;
  showError: (message: string, options?: Partial<ToastMessage>) => void;
  showSuccess: (message: string, options?: Partial<ToastMessage>) => void;
  showWarning: (message: string, options?: Partial<ToastMessage>) => void;
  showInfo: (message: string, options?: Partial<ToastMessage>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000 
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info',
    options: Partial<ToastMessage> = {}
  ) => {
    const id = generateId();
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration: defaultDuration,
      ...options,
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });
  }, [generateId, defaultDuration, maxToasts]);

  const showError = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    showToast(message, 'error', { duration: 7000, ...options });
  }, [showToast]);

  const showSuccess = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    showToast(message, 'success', { duration: 4000, ...options });
  }, [showToast]);

  const showWarning = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    showToast(message, 'warning', { duration: 6000, ...options });
  }, [showToast]);

  const showInfo = useCallback((message: string, options: Partial<ToastMessage> = {}) => {
    showToast(message, 'info', options);
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismissToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ErrorToast toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};