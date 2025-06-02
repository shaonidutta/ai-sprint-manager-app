import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for dropdown functionality with click-outside detection
 * @param {Object} options - Configuration options
 * @param {boolean} options.closeOnClickOutside - Whether to close on click outside (default: true)
 * @param {boolean} options.closeOnEscape - Whether to close on escape key (default: true)
 * @param {boolean} options.initialOpen - Initial open state (default: false)
 * @returns {Object} Dropdown state and handlers
 */
const useDropdown = ({
  closeOnClickOutside = true,
  closeOnEscape = true,
  initialOpen = false,
} = {}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Open dropdown
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Toggle dropdown
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Click outside detection
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (event) => {
      // Check if click is outside both dropdown and trigger
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        close();
      }
    };

    // Use mousedown for better UX (fires before click)
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside, close]);

  // Escape key detection
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        close();
        // Return focus to trigger element
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, closeOnEscape, close]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      const dropdown = dropdownRef.current;
      if (!dropdown) return;

      const focusableElements = dropdown.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < focusableElements.length - 1) {
            focusableElements[currentIndex + 1].focus();
          } else {
            firstElement.focus();
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            focusableElements[currentIndex - 1].focus();
          } else {
            lastElement.focus();
          }
          break;

        case 'Home':
          event.preventDefault();
          firstElement.focus();
          break;

        case 'End':
          event.preventDefault();
          lastElement.focus();
          break;

        case 'Tab':
          // Allow normal tab behavior but close dropdown if tabbing out
          if (event.shiftKey && document.activeElement === firstElement) {
            close();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            close();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Auto-focus first item when dropdown opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const firstFocusable = dropdownRef.current.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        // Small delay to ensure dropdown is rendered
        setTimeout(() => firstFocusable.focus(), 0);
      }
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    dropdownRef,
    triggerRef,
    // Helper props for trigger element
    triggerProps: {
      ref: triggerRef,
      onClick: toggle,
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      },
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    },
    // Helper props for dropdown element
    dropdownProps: {
      ref: dropdownRef,
      role: 'menu',
      'aria-orientation': 'vertical',
    },
  };
};

export default useDropdown;
