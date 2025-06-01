import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';

const AIQuotaWidget = ({ projectId, className = '' }) => {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchQuota();
    }
  }, [projectId]);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getQuota(projectId);
      setQuota(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching AI quota:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-red-600 text-sm">
          Failed to load AI quota: {error}
        </div>
      </div>
    );
  }

  if (!quota) return null;

  const quotaData = aiUtils.formatQuotaData(quota);
  const statusColor = aiUtils.getQuotaStatusColor(quotaData.percentage);

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">AI Quota</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
          {quotaData.used}/{quotaData.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            quotaData.percentage >= 90 ? 'bg-red-500' :
            quotaData.percentage >= 70 ? 'bg-orange-500' :
            quotaData.percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(quotaData.percentage, 100)}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>{quotaData.remaining} remaining</span>
        {quotaData.resetDate && (
          <span>Resets: {quotaData.resetDate}</span>
        )}
      </div>

      {quotaData.isExceeded && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          Monthly quota exceeded. Resets on {quotaData.resetDate}
        </div>
      )}

      {quotaData.daysUntilReset && quotaData.daysUntilReset <= 3 && !quotaData.isExceeded && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          Quota resets in {quotaData.daysUntilReset} day{quotaData.daysUntilReset !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default AIQuotaWidget;
