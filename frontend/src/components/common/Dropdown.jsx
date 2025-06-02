import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  placement = 'bottom-right',
  offset = 8,
  closeOnClick = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
  className = '',
  menuClassName = '',
  disabled = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  // Click outside detection
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, setIsOpen]);

  // Escape key detection
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, closeOnEscape, setIsOpen]);

  // Handle trigger click
  const handleTriggerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;
    
    setIsOpen(!isOpen);
  };

  // Handle menu click
  const handleMenuClick = (event) => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  // Get placement classes
  const getPlacementClasses = () => {
    const placements = {
      'top-left': 'bottom-full left-0 mb-2',
      'top-right': 'bottom-full right-0 mb-2',
      'bottom-left': 'top-full left-0 mt-2',
      'bottom-right': 'top-full right-0 mt-2',
      'left': 'right-full top-0 mr-2',
      'right': 'left-full top-0 ml-2',
    };
    return placements[placement] || placements['bottom-right'];
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick(e);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute z-50 min-w-max
            bg-white border border-gray-200 rounded-lg shadow-lg
            py-1 transition-all duration-150
            ${getPlacementClasses()}
            ${menuClassName}
          `}
          style={{ marginTop: placement.includes('bottom') ? `${offset}px` : undefined }}
          onClick={handleMenuClick}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Dropdown Item Component
export const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variantClasses = {
    default: 'text-gray-700 hover:bg-gray-100',
    danger: 'text-red-600 hover:bg-red-50',
    primary: 'text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      className={`
        block w-full text-left px-4 py-2 text-sm
        transition-colors duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${variantClasses[variant]}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

// Dropdown Divider Component
export const DropdownDivider = ({ className = '' }) => (
  <div className={`border-t border-gray-200 my-1 ${className}`} role="separator" />
);

// Dropdown Header Component
export const DropdownHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </div>
);

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  placement: PropTypes.oneOf([
    'top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right'
  ]),
  offset: PropTypes.number,
  closeOnClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  closeOnClickOutside: PropTypes.bool,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  disabled: PropTypes.bool,
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'danger', 'primary']),
};

DropdownDivider.propTypes = {
  className: PropTypes.string,
};

DropdownHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Dropdown;
