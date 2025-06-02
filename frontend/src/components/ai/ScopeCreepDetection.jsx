import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';
import { sprintService } from '../../services/sprint/sprintService';

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

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 INVESTIGATION: Component state changed - result:', result);
    console.log('🔍 INVESTIGATION: Component state changed - error:', error);
    console.log('🔍 INVESTIGATION: Component state changed - loading:', loading);
  }, [result, error, loading]);

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
      const response = await sprintService.getByProject(projectId);
      setSprints(response.data || []);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setSprints([]);
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

    // Validate form data with updated validation
    const validation = aiUtils.validateScopeCreepData(formData);

    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Send data in format expected by backend
      const requestData = {
        sprintId: formData.sprintId,
        originalScope: formData.originalScope
      };

      console.log('🔍 INVESTIGATION: Sending request data:', requestData);
      const response = await aiService.scopeCreepDetection(projectId, requestData);

      console.log('🔍 INVESTIGATION: aiService response (already .data):', response);
      console.log('🔍 INVESTIGATION: Response type:', typeof response);
      console.log('🔍 INVESTIGATION: Response keys:', Object.keys(response || {}));

      // The aiService already returns response.data, so we pass the response directly
      const formattedResult = aiUtils.formatAIResponse(response, 'scope-creep');
      console.log('🔍 INVESTIGATION: Formatted result:', formattedResult);
      console.log('🔍 INVESTIGATION: Formatted result type:', typeof formattedResult);
      console.log('🔍 INVESTIGATION: Formatted result keys:', Object.keys(formattedResult || {}));

      setResult(formattedResult);
      console.log('🔍 INVESTIGATION: setResult called with:', formattedResult);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze scope creep');
      console.error('Error detecting scope creep:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
  };

  // DEBUG: Test UI rendering with mock data
  const testWithMockData = () => {
    const mockResult = {
      timestamp: new Date().toLocaleString(),
      success: true,
      creepDetected: true,
      creepPercentage: 65,
      severity: 'Medium',
      affectedAreas: [
        { title: 'Goal Alignment', content: 'Test analysis content for goal alignment' },
        { title: 'Scope Expansion Indicators', content: 'Test indicators content' },
        { title: 'Impact Assessment', content: 'Test impact assessment content' }
      ],
      recommendations: ['Test recommendation 1', 'Test recommendation 2'],
      riskFactors: ['Test risk factor 1', 'Test risk factor 2'],
      analysis: {},
      sprintInfo: { id: 4, name: 'Test Sprint', goal: 'Test goal', status: 'Active' }
    };

    console.log('🔍 DEBUG: Setting mock result:', mockResult);
    setResult(mockResult);
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
        <div className="flex space-x-2">
          {result && (
            <button
              onClick={resetAnalysis}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              New Analysis
            </button>
          )}
          {/* DEBUG BUTTON - Remove in production */}
          <button
            onClick={testWithMockData}
            className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            🔍 Test UI
          </button>
        </div>
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
                  {sprint.name} ({sprint.status}) - {sprint.boardName}
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
        <>
          {console.log('🔍 INVESTIGATION: Rendering results section')}
          {console.log('🔍 INVESTIGATION: result object:', result)}
          {console.log('🔍 INVESTIGATION: result truthy?', !!result)}
          {console.log('🔍 INVESTIGATION: result keys:', result ? Object.keys(result) : 'null')}
        <div className="space-y-6 animate-fadeIn">
          {/* Main Analysis Card */}
          <div className={`border rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
            result.creepDetected
              ? aiUtils.getScopeCreepSeverityColor(result.severity)
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  result.creepDetected ? 'bg-white bg-opacity-50' : 'bg-green-200'
                }`}>
                  <span className="text-2xl">
                    {result.creepDetected ? '⚠️' : '✅'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {result.creepDetected ? 'Scope Creep Detected' : 'No Scope Creep Detected'}
                  </h3>
                  <p className="text-sm opacity-80">
                    Analysis completed on {result.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                {result.severity && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                    aiUtils.getScopeCreepSeverityColor(result.severity)
                  }`}>
                    {result.severity} Severity
                  </span>
                )}
                {result.creepPercentage !== undefined && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    aiUtils.getScopeCreepPercentageColor(result.creepPercentage)
                  }`}>
                    {result.creepPercentage}% Score
                  </span>
                )}
              </div>
            </div>

            {/* Sprint Info */}
            {result.sprintInfo && (
              <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Sprint Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {result.sprintInfo.name}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {result.sprintInfo.status}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Goal:</span> {result.sprintInfo.goal}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Details */}
          {result.affectedAreas && result.affectedAreas.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  📊
                </span>
                Detailed Analysis
              </h4>
              <div className="space-y-4">
                {result.affectedAreas.map((area, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                    <h5 className="font-semibold text-blue-900 mb-2">{area.title}</h5>
                    <p className="text-sm text-blue-800 leading-relaxed">{area.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {result.riskFactors && result.riskFactors.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  ⚠️
                </span>
                Risk Factors
              </h4>
              <div className="space-y-3">
                {result.riskFactors.map((risk, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-sm text-yellow-800 leading-relaxed">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  💡
                </span>
                Recommendations
              </h4>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default ScopeCreepDetection;
