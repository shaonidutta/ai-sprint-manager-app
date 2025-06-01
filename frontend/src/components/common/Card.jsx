import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  variant = 'default',
  elevation = 'medium',
  interactive = false,
  onClick,
  header,
  footer,
  fullWidth = false,
}) => {
  const baseClasses = `
    bg-white rounded-lg
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    default: 'border border-gray-200',
    outlined: 'border border-gray-300',
    filled: 'bg-gray-50',
  };

  const elevationClasses = {
    none: '',
    low: 'shadow-sm',
    medium: 'shadow',
    high: 'shadow-md',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300'
    : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${elevationClasses[elevation]}
        ${interactiveClasses}
        ${className}
      `}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {header && (
        <div className="px-4 py-3 border-b border-gray-200">
          {typeof header === 'string' ? (
            <h3 className="text-lg font-medium text-gray-900">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}

      <div className="p-4">{children}</div>

      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  elevation: PropTypes.oneOf(['none', 'low', 'medium', 'high']),
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  fullWidth: PropTypes.bool,
};

export default Card; 