import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';
import AIQuotaWidget from './AIQuotaWidget';

const AIInsightsDashboard = ({ projectId, className = '' }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getDashboardInsights();
      const formattedInsights = aiUtils.formatDashboardInsights(response.data);
      setInsights(formattedInsights);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load AI Insights
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInsights}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              🧠
            </span>
            AI Insights Dashboard
          </h2>
          <button
            onClick={fetchInsights}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {insights?.generatedAt && (
          <p className="text-sm text-gray-600 mt-2">
            Last updated: {insights.generatedAt}
          </p>
        )}
      </div>

      {/* AI Quota Widget */}
      {projectId && (
        <AIQuotaWidget projectId={projectId} />
      )}

      {/* Project Insights */}
      {insights?.projectInsights && insights.projectInsights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Insights</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.projectInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{insight.projectName}</h4>
                  <span className="text-xs text-gray-500">{insight.lastUpdated}</span>
                </div>
                <div className="space-y-2">
                  {insight.riskLevel && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Risk Level:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        aiUtils.getRiskLevelColor(insight.riskLevel)
                      }`}>
                        {insight.riskLevel}
                      </span>
                    </div>
                  )}
                  {insight.velocity && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Velocity:</span> {insight.velocity} SP/sprint
                    </div>
                  )}
                  {insight.scopeCreepRisk && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Scope Creep Risk:</span> {insight.scopeCreepRisk}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="w-5 h-5 bg-yellow-100 rounded mr-2 flex items-center justify-center">
              💡
            </span>
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">{rec.title}</h4>
                    <p className="text-sm text-yellow-700">{rec.description}</p>
                    {rec.priority && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {insights?.trends && Object.keys(insights.trends).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="w-5 h-5 bg-blue-100 rounded mr-2 flex items-center justify-center">
              📈
            </span>
            Trends & Analytics
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(insights.trends).map(([key, value], index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </div>
                <div className="text-xs text-gray-500">
                  {typeof value === 'number' && key.includes('percentage') ? '%' : 
                   typeof value === 'number' && key.includes('velocity') ? 'SP/sprint' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!insights || (
        (!insights.projectInsights || insights.projectInsights.length === 0) &&
        (!insights.recommendations || insights.recommendations.length === 0) &&
        (!insights.trends || Object.keys(insights.trends).length === 0)
      )) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No AI Insights Available
            </h3>
            <p className="text-gray-600 mb-4">
              Start using AI features in your projects to generate insights and recommendations.
            </p>
            <button
              onClick={fetchInsights}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Check for Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard;
