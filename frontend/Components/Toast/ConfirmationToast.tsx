import React, { useEffect, useState } from 'react';

export interface ConfirmationToastProps {
  id: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: (id: string) => void;
  confirmText?: string;
  cancelText?: string;
  duration?: number;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({
  id,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  duration = 10000, // Longer duration for confirmation
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleCancel();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    onCancel();
    handleClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`
          fixed inset-0 z-[59] bg-black transition-opacity duration-300 ease-in-out
          ${isVisible && !isLeaving ? 'opacity-30' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleCancel}
      />
      
      {/* Confirmation toast */}
      <div
        className={`
          fixed top-1/2 left-1/2 z-[60] max-w-sm w-[calc(100%-2rem)] sm:w-full transform transition-all duration-300 ease-in-out
          ${isVisible && !isLeaving ? '-translate-x-1/2 -translate-y-1/2 opacity-100 scale-100' : '-translate-x-1/2 -translate-y-1/2 opacity-0 scale-95'}
        `}
        style={{ marginTop: `${parseInt(id) * 10}px` }}
      >
        <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Confirm Action</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button
              onClick={handleCancel}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#5D3FD3] hover:bg-[#4A2FB8] rounded-md transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationToast;