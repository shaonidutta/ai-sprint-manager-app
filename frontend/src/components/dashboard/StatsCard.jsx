import React from 'react';
import { Card } from '../common';

const StatsCard = ({ title, value, icon, color = 'primary', trend, loading = false }) => {
  const getColorClasses = (colorName) => {
    const colors = {
      primary: {
        bg: 'bg-primary-100',
        text: 'text-primary-600',
        icon: 'text-primary-600'
      },
      secondary: {
        bg: 'bg-secondary-100',
        text: 'text-secondary-600',
        icon: 'text-secondary-600'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        icon: 'text-green-600'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        icon: 'text-yellow-600'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        icon: 'text-red-600'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      }
    };
    return colors[colorName] || colors.primary;
  };

  const colorClasses = getColorClasses(color);

  const formatValue = (val) => {
    if (loading) return '...';
    if (typeof val === 'number' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val?.toString() || '0';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.direction === 'up') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    } else if (trend.direction === 'down') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
            {loading ? (
              <div className="animate-pulse w-6 h-6 bg-gray-300 rounded"></div>
            ) : (
              <div className={`w-6 h-6 ${colorClasses.icon}`}>
                {icon}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  {title}
                </p>
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <div className="animate-pulse h-8 w-16 bg-gray-300 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-neutral-900">
                      {formatValue(value)}
                    </p>
                  )}
                  {trend && !loading && (
                    <div className="flex items-center space-x-1">
                      {getTrendIcon()}
                      <span className={`text-sm font-medium ${
                        trend.direction === 'up' ? 'text-green-600' : 
                        trend.direction === 'down' ? 'text-red-600' : 
                        'text-neutral-600'
                      }`}>
                        {trend.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Trend Description */}
            {trend && !loading && (
              <p className="text-xs text-neutral-500 mt-1">
                {trend.description || `${trend.direction === 'up' ? 'Increase' : 'Decrease'} from last period`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Predefined icons for common stats
export const StatsIcons = {
  projects: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  sprints: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  completed: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  issues: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

export default StatsCard;
