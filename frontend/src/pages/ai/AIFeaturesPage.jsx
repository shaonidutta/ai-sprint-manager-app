import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../api/endpoints/index';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';

const AIFeaturesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) {
      setError('No project selected. Please select a project first.');
      // Optionally redirect to projects list
      // navigate('/projects');
      return;
    }
  }, [projectId]);

  const features = [
    {
      id: 'sprint-planning',
      title: 'Sprint Planning Assistant',
      description: 'AI-powered sprint planning suggestions based on team velocity, capacity, and historical data.',
      icon: '📅',
      gradient: 'from-blue-500 to-indigo-600',
      endpoint: projectId ? API_ENDPOINTS.AI.SPRINT_PLANNING(projectId) : null,
      handler: aiService.getSprintPlanningInsights,
      formatter: aiUtils.formatSprintPlanningData,
    },
    {
      id: 'scope-creep',
      title: 'Scope Creep Detection',
      description: 'Early detection of potential scope creep using AI analysis of requirements and changes.',
      icon: '🔍',
      gradient: 'from-red-500 to-pink-600',
      endpoint: API_ENDPOINTS.AI.SCOPE_CREEP(projectId),
      handler: aiService.getScopeCreepAnalysis,
      formatter: aiUtils.formatScopeCreepData,
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'AI-driven project risk assessment and mitigation recommendations.',
      icon: '⚠️',
      gradient: 'from-yellow-500 to-orange-600',
      endpoint: API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId),
      handler: aiService.getRiskAssessment,
      formatter: aiUtils.formatRiskAssessmentData,
    },
    {
      id: 'retrospective',
      title: 'Sprint Retrospective Insights',
      description: 'AI analysis of sprint performance and team collaboration patterns.',
      icon: '🎯',
      gradient: 'from-green-500 to-emerald-600',
      endpoint: API_ENDPOINTS.AI.RETROSPECTIVE(projectId),
      handler: aiService.getRetrospectiveInsights,
      formatter: aiUtils.formatRetrospectiveData,
    },
  ];

  const handleFeatureClick = async (feature) => {
    try {
      if (!projectId) {
        setError('Please select a project first');
        return;
      }

      setLoading(true);
      setError(null);
      setActiveFeature(feature);
      const response = await feature.handler(projectId);
      const formattedData = feature.formatter(response.data);
      setFeatureData(formattedData);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
      setError(errorMessage);
      console.error(`Error accessing ${feature.title}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const renderFeatureData = () => {
    if (!activeFeature || !featureData) return null;

    const commonClasses = "mt-6 bg-white rounded-lg shadow-lg p-6";

    switch (activeFeature.id) {
      case 'sprint-planning':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-semibold mb-4">Sprint Planning Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Suggested Story Points</p>
                <p className="text-2xl font-bold">{featureData.suggestedStoryPoints}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Suggested Duration</p>
                <p className="text-2xl font-bold">{featureData.suggestedDuration} days</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommended Issues</h4>
              <ul className="space-y-2">
                {featureData.recommendedIssues.map((issue, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded">
                    {issue.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'scope-creep':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-semibold mb-4">Scope Creep Analysis</h3>
            <div className="flex items-center mb-4">
              <div className={`px-3 py-1 rounded-full ${aiUtils.getRiskLevelColor(featureData.riskLevel)}`}>
                {featureData.riskLevel} Risk
              </div>
              <div className="ml-4">
                Risk Score: {featureData.riskScore}%
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Detected Patterns</h4>
                <ul className="space-y-2">
                  {featureData.detectedPatterns.map((pattern, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {featureData.recommendations.map((rec, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'risk-assessment':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Overall Risk</p>
                <p className="text-2xl font-bold">{featureData.overallRisk}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Confidence</p>
                <p className="text-2xl font-bold">{featureData.confidence}%</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Risk Factors</h4>
                <ul className="space-y-2">
                  {featureData.riskFactors.map((factor, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mitigation Strategies</h4>
                <ul className="space-y-2">
                  {featureData.mitigationStrategies.map((strategy, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'retrospective':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-semibold mb-4">Sprint Retrospective Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Sprint Performance</p>
                <p className="text-2xl font-bold">{featureData.sprintPerformance}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Team Collaboration</p>
                <p className="text-2xl font-bold">{featureData.teamCollaboration}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Successes</h4>
                <ul className="space-y-2">
                  {featureData.successes.map((success, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {success}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Challenges</h4>
                <ul className="space-y-2">
                  {featureData.challenges.map((challenge, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Improvements</h4>
                <ul className="space-y-2">
                  {featureData.improvements.map((improvement, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded">
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project Context Display */}
      {projectId && (
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            Project ID: {projectId}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Features</h1>
        <p className="text-gray-600">
          Enhance your project management with our AI-powered features
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sprint Planning Assistant */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 text-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Sprint Planning Assistant</h3>
                <p className="text-blue-100 text-sm">AI-powered sprint planning suggestions</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/ai/sprint-planning/${projectId}`)}
              className="w-full bg-white text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Try Now
            </button>
          </div>
        </div>
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`bg-gradient-to-r ${feature.gradient} p-6`}>
              <div className="flex items-center justify-between">
                <span className="text-4xl">{feature.icon}</span>
                <button
                  onClick={() => handleFeatureClick(feature)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  disabled={loading || !projectId}
                >
                  {loading && activeFeature?.id === feature.id ? 'Processing...' : 'Try Now'}
                </button>
              </div>
              <h3 className="text-xl font-semibold text-white mt-4">
                {feature.title}
              </h3>
              <p className="text-white text-opacity-90 mt-2">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Data Display */}
      {renderFeatureData()}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFeaturesPage; 