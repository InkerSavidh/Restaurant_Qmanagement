import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from '../Components/Toast/Toast';
import ConfirmationToast, { ConfirmationToastProps } from '../Components/Toast/ConfirmationToast';

interface ToastContextType {
  showToast: (message: string, type: ToastProps['type'], duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showConfirmation: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      duration?: number;
    }
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastProps['type'];
  duration?: number;
}

interface ConfirmationItem {
  id: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  duration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationItem[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeConfirmation = (id: string) => {
    setConfirmations(prev => prev.filter(confirmation => confirmation.id !== id));
  };

  const showToast = (message: string, type: ToastProps['type'], duration = 5000) => {
    const id = Date.now().toString();
    const newToast: ToastItem = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration = 5000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration = 4000) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration = 4000) => {
    showToast(message, 'info', duration);
  };

  const showConfirmation = (
    message: string,
    onConfirm: () => void,
    onCancel: () => void = () => {},
    options: {
      confirmText?: string;
      cancelText?: string;
      duration?: number;
    } = {}
  ) => {
    const id = Date.now().toString();
    const newConfirmation: ConfirmationItem = {
      id,
      message,
      onConfirm,
      onCancel,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      duration: options.duration,
    };
    
    setConfirmations(prev => [...prev, newConfirmation]);
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          id={index.toString()}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      {/* Render confirmation toasts */}
      {confirmations.map((confirmation, index) => (
        <ConfirmationToast
          key={confirmation.id}
          id={index.toString()}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
          onClose={() => removeConfirmation(confirmation.id)}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          duration={confirmation.duration}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};