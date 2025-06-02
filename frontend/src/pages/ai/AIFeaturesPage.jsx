import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../api/endpoints/index';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';
import {
  SprintPlanningAI,
  ScopeCreepDetection,
  RiskAssessment,
  RetrospectiveAI,
  AIQuotaWidget
} from '../../components/ai';

const AIFeaturesPage = () => {
  const [activeTab, setActiveTab] = useState('sprint-planning');
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) {
      setError('No project selected. Please select a project first.');
      // Optionally redirect to projects list
      // navigate('/projects');
      return;
    }
    fetchQuota();
  }, [projectId]);

  const fetchQuota = async () => {
    try {
      const response = await aiService.getQuota(projectId);
      setQuota(response.data);
    } catch (err) {
      console.error('Error fetching AI quota:', err);
    }
  };

  const tabs = [
    {
      id: 'sprint-planning',
      title: 'Sprint Planning',
      icon: '📅',
      description: 'AI-powered sprint planning suggestions'
    },
    {
      id: 'scope-creep',
      title: 'Scope Creep Detection',
      icon: '🔍',
      description: 'Early detection of scope creep'
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      icon: '⚠️',
      description: 'Project risk analysis'
    },
    {
      id: 'retrospective',
      title: 'Retrospective',
      icon: '🎯',
      description: 'Sprint retrospective insights'
    }
  ];

  const renderActiveTab = () => {
    if (!projectId) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a project to use AI features.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'sprint-planning':
        return (
          <SprintPlanningAI
            projectId={projectId}
            onPlanGenerated={(plan) => console.log('Sprint plan generated:', plan)}
          />
        );
      case 'scope-creep':
        return (
          <ScopeCreepDetection
            projectId={projectId}
          />
        );
      case 'risk-assessment':
        return (
          <RiskAssessment
            projectId={projectId}
          />
        );
      case 'retrospective':
        return (
          <RetrospectiveAI
            projectId={projectId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Features Dashboard</h1>
        <p className="text-gray-600">
          Enhance your project management with AI-powered insights and automation
        </p>
        {projectId && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Project ID: {projectId}</span>
          </div>
        )}
      </div>

      {/* AI Quota Widget */}
      {projectId && (
        <div className="mb-6">
          <AIQuotaWidget projectId={projectId} />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg">
        {renderActiveTab()}
      </div>

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