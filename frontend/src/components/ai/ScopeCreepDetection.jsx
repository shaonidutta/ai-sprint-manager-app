import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';
import { sprintService } from '../../services/sprint/sprintService';
import { issueService } from '../../services/issue/issueService';

const ScopeCreepDetection = ({ projectId, sprintId, className = '' }) => {
  const [formData, setFormData] = useState({
    sprintId: sprintId || '',
    originalScope: '',
    currentIssues: []
  });
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  useEffect(() => {
    if (formData.sprintId) {
      fetchSprintIssues();
    }
  }, [formData.sprintId]);

  const fetchSprints = async () => {
    try {
      setLoadingSprints(true);
      // Note: We need a way to get sprints by project. For now, we'll use a placeholder
      // In a real implementation, you'd have an endpoint like /projects/:id/sprints
      setSprints([]);
    } catch (err) {
      console.error('Error fetching sprints:', err);
    } finally {
      setLoadingSprints(false);
    }
  };

  const fetchSprintIssues = async () => {
    try {
      const response = await sprintService.getIssues(formData.sprintId);
      setFormData(prev => ({
        ...prev,
        currentIssues: response.data || []
      }));
    } catch (err) {
      console.error('Error fetching sprint issues:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = aiUtils.validateScopeCreepData(formData);

    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await aiService.scopeCreepDetection(projectId, formData);
      const formattedResult = aiUtils.formatAIResponse(response.data, 'scope-creep');
      
      setResult(formattedResult);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error detecting scope creep:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  const getCreepSeverityColor = (percentage) => {
    if (percentage >= 30) return 'text-red-600 bg-red-100';
    if (percentage >= 15) return 'text-orange-600 bg-orange-100';
    if (percentage >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            🔍
          </span>
          Scope Creep Detection
        </h2>
        {result && (
          <button
            onClick={resetAnalysis}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            New Analysis
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint *
            </label>
            <select
              name="sprintId"
              value={formData.sprintId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={loadingSprints}
            >
              <option value="">Select a sprint...</option>
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
            {loadingSprints && (
              <p className="text-xs text-gray-500 mt-1">Loading sprints...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Sprint Scope *
            </label>
            <textarea
              name="originalScope"
              value={formData.originalScope}
              onChange={handleInputChange}
              placeholder="Describe the original sprint scope and goals..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Issues in Sprint
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              {formData.currentIssues.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">
                    {formData.currentIssues.length} issues found in sprint:
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    {formData.currentIssues.map((issue, index) => (
                      <div key={index} className="text-xs text-gray-700 py-1">
                        • {issue.title} ({issue.issueType})
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.sprintId ? 'No issues found in selected sprint' : 'Select a sprint to load issues'}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.sprintId || !formData.originalScope}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Detect Scope Creep'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className={`border rounded-md p-4 ${
            result.creepDetected ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${
                result.creepDetected ? 'text-orange-800' : 'text-green-800'
              }`}>
                {result.creepDetected ? 'Scope Creep Detected' : 'No Scope Creep Detected'}
              </h3>
              {result.creepPercentage !== undefined && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getCreepSeverityColor(result.creepPercentage)
                }`}>
                  {result.creepPercentage}% creep
                </span>
              )}
            </div>
            <p className={`text-sm ${
              result.creepDetected ? 'text-orange-700' : 'text-green-700'
            }`}>
              Analysis completed on {result.timestamp}
            </p>
          </div>

          {result.affectedAreas && result.affectedAreas.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Affected Areas</h4>
              <div className="space-y-2">
                {result.affectedAreas.map((area, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <span className="text-sm text-yellow-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{rec}</span>
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

export default ScopeCreepDetection;
