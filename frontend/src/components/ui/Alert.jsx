import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const Alert = ({
  message,
  type = 'error',
  onClose,
  className = '',
  ...props
}) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className={`alert ${isError ? 'alert-error' : 'alert-success'} ${className}`}
      role="alert"
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isError ? (
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
        )}
        <span>{message}</span>
      </div>
      
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
export { Alert };
