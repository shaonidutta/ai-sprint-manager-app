import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';
import { aiUtils } from '../../services/ai/aiUtils';

const SprintPlanningAI = ({ projectId, onPlanGenerated, className = '' }) => {
  const [formData, setFormData] = useState({
    sprintGoal: '',
    teamCapacity: '',
    sprintDuration: '2',
    backlogItems: []
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBacklogItemsChange = (e) => {
    const items = e.target.value.split('\n').filter(item => item.trim());
    setFormData(prev => ({
      ...prev,
      backlogItems: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = aiUtils.validateSprintPlanningData({
      ...formData,
      teamCapacity: parseInt(formData.teamCapacity),
      sprintDuration: parseInt(formData.sprintDuration)
    });

    if (!validation.isValid) {
      setError(Object.values(validation.errors).join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestData = {
        sprintGoal: formData.sprintGoal,
        teamCapacity: parseInt(formData.teamCapacity),
        sprintDuration: parseInt(formData.sprintDuration),
        backlogItems: formData.backlogItems
      };

      const response = await aiService.sprintPlanning(projectId, requestData);
      const formattedResult = aiUtils.formatAIResponse(response.data, 'sprint-planning');
      
      setResult(formattedResult);
      if (onPlanGenerated) {
        onPlanGenerated(formattedResult);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error generating sprint plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sprintGoal: '',
      teamCapacity: '',
      sprintDuration: '2',
      backlogItems: []
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            🤖
          </span>
          AI Sprint Planning
        </h2>
        {result && (
          <button
            onClick={resetForm}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            New Planning
          </button>
        )}
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint Goal *
            </label>
            <textarea
              name="sprintGoal"
              value={formData.sprintGoal}
              onChange={handleInputChange}
              placeholder="What do you want to achieve in this sprint?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Capacity (Story Points) *
              </label>
              <input
                type="number"
                name="teamCapacity"
                value={formData.teamCapacity}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprint Duration (Weeks) *
              </label>
              <select
                name="sprintDuration"
                value={formData.sprintDuration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">1 Week</option>
                <option value="2">2 Weeks</option>
                <option value="3">3 Weeks</option>
                <option value="4">4 Weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backlog Items *
            </label>
            <textarea
              value={formData.backlogItems.join('\n')}
              onChange={handleBacklogItemsChange}
              placeholder="Enter each backlog item on a new line..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter one item per line. AI will help estimate and prioritize them.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Plan...
              </span>
            ) : (
              'Generate Sprint Plan'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="font-medium text-green-800 mb-2">Sprint Plan Generated</h3>
            <p className="text-sm text-green-700">
              Generated on {result.timestamp}
            </p>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.estimatedVelocity && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <span className="text-sm font-medium text-blue-800">
                Estimated Velocity: {result.estimatedVelocity} story points
              </span>
            </div>
          )}

          {result.riskFactors && result.riskFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {result.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">
                    ⚠️ {risk}
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

export default SprintPlanningAI;
