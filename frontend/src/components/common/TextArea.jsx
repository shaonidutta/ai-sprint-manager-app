import React from 'react';
import PropTypes from 'prop-types';

const TextArea = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  helperText,
  rows = 4,
  cols,
  maxLength,
  resize = 'vertical',
}) => {
  const baseClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${resize === 'none' ? 'resize-none' : resize === 'horizontal' ? 'resize-x' : resize === 'vertical' ? 'resize-y' : 'resize'}
  `;

  return (
    <div className={className}>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        maxLength={maxLength}
        className={`${baseClasses} px-3 py-2`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {(error || helperText) && (
        <p
          id={`${id}-${error ? 'error' : 'helper'}`}
          className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

TextArea.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  cols: PropTypes.number,
  maxLength: PropTypes.number,
  resize: PropTypes.oneOf(['none', 'horizontal', 'vertical', 'both']),
};

export default TextArea;
