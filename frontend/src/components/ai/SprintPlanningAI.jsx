import React, { useState } from 'react';
import { aiService } from '../../services/ai/aiService';

const SprintPlanningAI = ({ projectId, onPlanGenerated, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    sprintGoal: '',
    teamCapacity: 40,
    sprintDuration: 14,
    backlogItems: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBacklogItemsChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      backlogItems: value.split('\n').filter(item => item.trim())
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getSprintPlanningInsights(projectId, formData);
      if (onPlanGenerated) {
        onPlanGenerated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate sprint plan');
      console.error('Sprint planning error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sprintGoal: '',
      teamCapacity: 40,
      sprintDuration: 14,
      backlogItems: []
    });
    setError(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sprint Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sprint Goal *
          </label>
          <textarea
            name="sprintGoal"
            value={formData.sprintGoal}
            onChange={handleInputChange}
            placeholder="What do you want to achieve in this sprint?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-blue-300"
            rows="3"
            required
          />
        </div>

        {/* Team Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Capacity (Story Points)
          </label>
          <input
            type="number"
            name="teamCapacity"
            value={formData.teamCapacity}
            onChange={handleInputChange}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-blue-300"
          />
        </div>

        {/* Sprint Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sprint Duration (Days)
          </label>
          <input
            type="number"
            name="sprintDuration"
            value={formData.sprintDuration}
            onChange={handleInputChange}
            min="1"
            max="30"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-blue-300"
          />
        </div>

        {/* Backlog Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backlog Items (One per line)
          </label>
          <textarea
            name="backlogItems"
            value={formData.backlogItems.join('\n')}
            onChange={handleBacklogItemsChange}
            placeholder="Enter backlog items (one per line)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:border-blue-300"
            rows="5"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Generating Plan...' : 'Generate Sprint Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SprintPlanningAI;
