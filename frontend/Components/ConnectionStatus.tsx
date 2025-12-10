// frontend/Components/ConnectionStatus.tsx
import React from 'react';
import { ConnectionStatus as Status } from '../hooks/useSocketManager';

interface ConnectionStatusProps {
  status: Status;
  error: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, error }) => {
  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'reconnecting':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '🔄',
          title: 'Reconnecting...',
          message: error || 'Attempting to restore connection',
        };
      case 'disconnected':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          icon: '⚠️',
          title: 'Connection Lost',
          message: error || 'Real-time updates paused. Reconnecting...',
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: '❌',
          title: 'Connection Error',
          message: error || 'Unable to connect. Please refresh the page.',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md ${config.bgColor} ${config.borderColor} border-l-4 p-4 rounded-lg shadow-lg animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-2xl mr-3">{config.icon}</span>
        <div className="flex-1">
          <p className={`font-semibold ${config.textColor}`}>{config.title}</p>
          <p className={`text-sm ${config.textColor} mt-1`}>{config.message}</p>
        </div>
      </div>
    </div>
  );
};
