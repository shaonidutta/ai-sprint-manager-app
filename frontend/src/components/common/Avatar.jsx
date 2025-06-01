import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({
  src,
  alt,
  size = 'medium',
  variant = 'circle',
  status,
  className = '',
  fallbackText,
}) => {
  const sizeClasses = {
    tiny: 'w-6 h-6 text-xs',
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
    xlarge: 'w-16 h-16 text-xl',
  };

  const variantClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    busy: 'bg-red-400',
    away: 'bg-yellow-400',
  };

  // Generate initials from alt text
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate background color based on name
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-200';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`
            object-cover
            ${sizeClasses[size]}
            ${variantClasses[variant]}
          `}
        />
      ) : (
        <div
          className={`
            flex items-center justify-center text-white
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${getBackgroundColor(fallbackText || alt)}
          `}
        >
          {getInitials(fallbackText || alt)}
        </div>
      )}

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block
            ${size === 'tiny' ? 'w-2 h-2' : 'w-3 h-3'}
            ${variantClasses.circle}
            ${statusColors[status]}
            ring-2 ring-white
          `}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['circle', 'square']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  className: PropTypes.string,
  fallbackText: PropTypes.string,
};

export default Avatar; 