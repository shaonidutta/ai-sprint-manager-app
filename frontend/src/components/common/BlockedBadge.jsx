import React from 'react';

const BlockedBadge = ({ 
  blocked_reason, 
  size = 'default',
  showIcon = true,
  className = ""
}) => {
  if (!blocked_reason) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={`
        group relative inline-flex items-center space-x-1 
        bg-red-100 text-red-800 border border-red-300 
        rounded-full font-medium shadow-sm
        hover:bg-red-200 hover:border-red-400 transition-all duration-150
        cursor-help
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <svg 
          className={`${iconSizes[size]} text-red-600 animate-pulse`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
      <span>Blocked</span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
        <div className="font-medium mb-1">Blocker Reason:</div>
        <p className="max-w-xs break-words">{blocked_reason}</p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-red-800"></div>
      </div>
    </div>
  );
};

export default BlockedBadge;
