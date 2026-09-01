import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: { width: '16px', height: '16px', borderWidth: '2px' },
    md: { width: '28px', height: '28px', borderWidth: '3px' },
    lg: { width: '44px', height: '44px', borderWidth: '4px' },
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div className="spinner" style={sizeMap[size] || sizeMap.md} />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  );
};

export const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={20} className="flex-shrink-0" />,
    success: <CheckCircle size={20} className="flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="flex-shrink-0" />,
    info: <Info size={20} className="flex-shrink-0" />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type] || icons.info}
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
