import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ value, onChange, options = [], label, icon: Icon, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Find active selected label
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Collapse dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        flexDirection: 'column', 
        fontFamily: 'Inter, sans-serif',
        userSelect: 'none',
        ...style 
      }}
    >
      {/* Label Prefix if passed */}
      {label && (
        <span 
          style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)', 
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {label}
        </span>
      )}

      {/* Styled Interactive Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--border-radius)',
          border: isOpen ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(255, 107, 0, 0.12)' : 'none',
          transition: 'all var(--transition-fast)',
          minWidth: '150px',
        }}
        className="custom-select-trigger"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={15} style={{ color: 'var(--primary-color)' }} />}
          <span>{selectedOption?.label}</span>
        </div>
        <ChevronDown 
          size={15} 
          style={{ 
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-normal)'
          }} 
        />
      </button>

      {/* Popover Options List Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            zIndex: 999,
            overflow: 'hidden',
            padding: '4px',
            minWidth: '180px',
            animation: 'fadeIn var(--transition-fast) forwards'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="custom-select-option"
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#FFF0E6';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--primary-color)' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;
export { Select };
