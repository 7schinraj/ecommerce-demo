import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  className = '',
  required,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span style={{ color: 'var(--error-color)', marginLeft: '4px', fontWeight: 'bold' }}>*</span>}
        </label>
      )}
      
      <div className={`input-wrapper ${error ? 'animate-shake' : ''}`}>
        {Icon && (
          <div className="input-icon-wrapper input-icon-wrapper-left">
            <Icon size={18} />
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`input-control 
            ${error ? 'input-control-error' : ''} 
            ${Icon ? 'input-icon-left' : ''} 
            ${isPassword ? 'input-icon-right' : ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="input-icon-wrapper input-icon-wrapper-right"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="error-message" role="alert">
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
export { Input };
