import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';

const RetrospectiveAI = ({ projectId, sprintId, className = '' }) => {
  const [formData, setFormData] = useState({
    sprintId: sprintId || '',
    sprintMetrics: {
      plannedStoryPoints: '',
      completedStoryPoints: '',
      sprintGoalAchieved: 'partially',
      velocityTrend: 'stable',
      blockedIssuesCount: ''
    },
    teamFeedback: [
      { category: 'What went well', feedback: '' },
      { category: 'What could be improved', feedback: '' },
      { category: 'Action items', feedback: '' }
    ]
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

  const handleFeedbackChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      teamFeedback: prev.teamFeedback.map((item, i) => 
        i === index ? { ...item, feedback: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = aiUtils.validateRetrospectiveData({
      ...formData,
      teamFeedback: formData.teamFeedback.filter(item => item.feedback.trim())
    });

    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        ...formData,
        teamFeedback: formData.teamFeedback.filter(item => item.feedback.trim())
      };

      const response = await aiService.retrospective(projectId, requestData);
      const formattedResult = aiUtils.formatAIResponse(response.data, 'retrospective');
      
      setResult(formattedResult);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error generating retrospective:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetRetrospective = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            🔄
          </span>
          Sprint Retrospective AI
        </h2>
        {result && (
          <button
            onClick={resetRetrospective}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            New Retrospective
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint ID
            </label>
            <input
              type="text"
              name="sprintId"
              value={formData.sprintId}
              onChange={handleInputChange}
              placeholder="Enter sprint ID or identifier"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sprint Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Story Points
                </label>
                <input
                  type="number"
                  name="sprintMetrics.plannedStoryPoints"
                  value={formData.sprintMetrics.plannedStoryPoints}
                  onChange={handleInputChange}
                  placeholder="e.g., 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completed Story Points
                </label>
                <input
                  type="number"
                  name="sprintMetrics.completedStoryPoints"
                  value={formData.sprintMetrics.completedStoryPoints}
                  onChange={handleInputChange}
                  placeholder="e.g., 35"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Goal Achievement
                </label>
                <select
                  name="sprintMetrics.sprintGoalAchieved"
                  value={formData.sprintMetrics.sprintGoalAchieved}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="fully">Fully Achieved</option>
                  <option value="partially">Partially Achieved</option>
                  <option value="not-achieved">Not Achieved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velocity Trend
                </label>
                <select
                  name="sprintMetrics.velocityTrend"
                  value={formData.sprintMetrics.velocityTrend}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="increasing">Increasing</option>
                  <option value="stable">Stable</option>
                  <option value="decreasing">Decreasing</option>
                  <option value="volatile">Volatile</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blocked Issues Count
                </label>
                <input
                  type="number"
                  name="sprintMetrics.blockedIssuesCount"
                  value={formData.sprintMetrics.blockedIssuesCount}
                  onChange={handleInputChange}
                  placeholder="Number of issues that were blocked"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Team Feedback</h3>
            <div className="space-y-4">
              {formData.teamFeedback.map((item, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {item.category}
                  </label>
                  <textarea
                    value={item.feedback}
                    onChange={(e) => handleFeedbackChange(index, e.target.value)}
                    placeholder={`Enter feedback for: ${item.category.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>
              ))}
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
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Insights...
              </span>
            ) : (
              'Generate Retrospective Insights'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-purple-800">
                Retrospective Analysis Complete
              </h3>
              {result.teamMorale && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  aiUtils.getTeamMoraleColor(result.teamMorale)
                }`}>
                  Morale: {result.teamMorale}
                </span>
              )}
            </div>
            <p className="text-sm text-purple-700">
              Analysis completed on {result.timestamp}
            </p>
          </div>

          {result.whatWentWell && result.whatWentWell.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                What Went Well
              </h4>
              <ul className="space-y-1">
                {result.whatWentWell.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-green-50 px-3 py-2 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.whatCouldImprove && result.whatCouldImprove.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
                What Could Be Improved
              </h4>
              <ul className="space-y-1">
                {result.whatCouldImprove.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.actionItems && result.actionItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                Action Items
              </h4>
              <ul className="space-y-1">
                {result.actionItems.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {item}
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

export default RetrospectiveAI;
