import { useEffect, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-black/5 transform transition-all duration-300 max-w-sm w-full sm:w-auto ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 pr-4">
        <p className="text-sm text-primary-dark font-medium leading-tight">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md text-primary-dark/40 hover:text-primary-dark hover:bg-black/5 transition-colors focus:outline-none"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
