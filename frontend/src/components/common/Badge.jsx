import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  icon,
  dot = false,
  removable = false,
  onRemove,
}) => {
  const baseClasses = 'inline-flex items-center font-medium';

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-sm',
    large: 'px-3 py-1 text-base',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',

    // Status variants
    'status-todo': 'bg-gray-100 text-gray-800',
    'status-in-progress': 'bg-blue-100 text-blue-800',
    'status-done': 'bg-green-100 text-green-800',
    'status-blocked': 'bg-red-100 text-red-800',

    // Priority variants
    'priority-p1': 'bg-red-100 text-red-800',
    'priority-p2': 'bg-orange-100 text-orange-800',
    'priority-p3': 'bg-yellow-100 text-yellow-800',
    'priority-p4': 'bg-green-100 text-green-800',
  };

  const roundedClasses = {
    small: 'rounded',
    medium: 'rounded-md',
    large: 'rounded-lg',
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${roundedClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            mr-1.5 h-2 w-2 rounded-full
            ${variant.startsWith('status-') ? variantClasses[variant].replace('100', '400') : ''}
            ${variant.startsWith('priority-') ? variantClasses[variant].replace('100', '400') : ''}
          `}
        />
      )}

      {icon && <span className="mr-1.5">{icon}</span>}
      
      {children}

      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={`
            ml-1.5 inline-flex items-center justify-center
            hover:bg-opacity-20 hover:bg-gray-900
            rounded-full focus:outline-none
            ${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'}
          `}
        >
          <svg
            className={`${size === 'small' ? 'w-2 h-2' : 'w-3 h-3'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default',
    'primary',
    'success',
    'warning',
    'error',
    'info',
    'status-todo',
    'status-in-progress',
    'status-done',
    'status-blocked',
    'priority-p1',
    'priority-p2',
    'priority-p3',
    'priority-p4',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  icon: PropTypes.node,
  dot: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default Badge; 