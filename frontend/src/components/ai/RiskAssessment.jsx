import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';

const RiskAssessment = ({ projectId, className = '' }) => {
  const [formData, setFormData] = useState({
    projectContext: '',
    currentSprint: {
      sprintId: '',
      sprintGoal: '',
      teamCapacity: '',
      issuesCount: ''
    },
    teamMetrics: {
      velocity: '',
      burndownTrend: 'on-track',
      blockedIssues: '',
      teamMorale: 'neutral'
    }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = aiUtils.validateRiskAssessmentData(formData);

    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await aiService.riskAssessment(projectId, formData);
      const formattedResult = aiUtils.formatAIResponse(response.data, 'risk-assessment');
      
      setResult(formattedResult);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error performing risk assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAssessment = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            ⚠️
          </span>
          Risk Assessment
        </h2>
        {result && (
          <button
            onClick={resetAssessment}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            New Assessment
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Context *
            </label>
            <textarea
              name="projectContext"
              value={formData.projectContext}
              onChange={handleInputChange}
              placeholder="Describe the project, its goals, timeline, and any current challenges..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              required
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Sprint Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Goal
                </label>
                <input
                  type="text"
                  name="currentSprint.sprintGoal"
                  value={formData.currentSprint.sprintGoal}
                  onChange={handleInputChange}
                  placeholder="Current sprint goal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Capacity (Story Points)
                </label>
                <input
                  type="number"
                  name="currentSprint.teamCapacity"
                  value={formData.currentSprint.teamCapacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issues Count
                </label>
                <input
                  type="number"
                  name="currentSprint.issuesCount"
                  value={formData.currentSprint.issuesCount}
                  onChange={handleInputChange}
                  placeholder="Number of issues in sprint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Team Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Velocity
                </label>
                <input
                  type="number"
                  name="teamMetrics.velocity"
                  value={formData.teamMetrics.velocity}
                  onChange={handleInputChange}
                  placeholder="Story points per sprint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burndown Trend
                </label>
                <select
                  name="teamMetrics.burndownTrend"
                  value={formData.teamMetrics.burndownTrend}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ahead">Ahead of Schedule</option>
                  <option value="on-track">On Track</option>
                  <option value="behind">Behind Schedule</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blocked Issues
                </label>
                <input
                  type="number"
                  name="teamMetrics.blockedIssues"
                  value={formData.teamMetrics.blockedIssues}
                  onChange={handleInputChange}
                  placeholder="Number of blocked issues"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Morale
                </label>
                <select
                  name="teamMetrics.teamMorale"
                  value={formData.teamMetrics.teamMorale}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="very-high">Very High</option>
                  <option value="high">High</option>
                  <option value="neutral">Neutral</option>
                  <option value="low">Low</option>
                  <option value="very-low">Very Low</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assessing Risks...
              </span>
            ) : (
              'Perform Risk Assessment'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className={`border rounded-md p-4 ${aiUtils.getRiskLevelColor(result.riskLevel)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                Risk Level: {result.riskLevel}
              </h3>
              {result.riskScore !== undefined && (
                <span className="text-sm font-medium">
                  Score: {result.riskScore}/100
                </span>
              )}
            </div>
            <p className="text-sm">
              Assessment completed on {result.timestamp}
            </p>
          </div>

          {result.identifiedRisks && result.identifiedRisks.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Identified Risks</h4>
              <div className="space-y-2">
                {result.identifiedRisks.map((risk, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                    <span className="text-sm text-red-800">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.mitigationStrategies && result.mitigationStrategies.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
              <ul className="space-y-2">
                {result.mitigationStrategies.map((strategy, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
