import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Tabs = ({ 
  tabs, 
  defaultTab = 0, 
  onChange, 
  className = '',
  variant = 'default' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  const baseClasses = 'flex border-b border-gray-200';
  const tabClasses = {
    default: {
      base: 'px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200',
      active: 'text-blue-600 border-b-2 border-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700'
    },
    pills: {
      base: 'px-4 py-2 text-sm font-medium cursor-pointer transition-colors duration-200 rounded-lg mr-2',
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-500 hover:bg-gray-100'
    }
  };

  const currentVariant = tabClasses[variant] || tabClasses.default;

  return (
    <div className={className}>
      <div className={variant === 'pills' ? 'flex' : baseClasses}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            onClick={() => handleTabClick(index)}
            className={`
              ${currentVariant.base}
              ${activeTab === index ? currentVariant.active : currentVariant.inactive}
            `}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      content: PropTypes.node,
      icon: PropTypes.node,
      count: PropTypes.number,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'pills']),
};

export default Tabs;
