import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/ai/aiService';

const SprintPlanningAI = ({ projectId, boardId, onPlanGenerated, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sprintPlan, setSprintPlan] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    totalStoryPoints: 40,
    tasksList: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResults(false);

    try {
      // Parse tasks list into numbered format
      const tasks = formData.tasksList
        .split('\n')
        .filter(task => task.trim())
        .map((task, index) => {
          const trimmedTask = task.trim();
          // Check if task already has a number
          const hasNumber = /^\d+\./.test(trimmedTask);
          const taskText = hasNumber ? trimmedTask : `${index + 1}. ${trimmedTask}`;
          return taskText;
        });

      const requestData = {
        boardId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalStoryPoints: formData.totalStoryPoints,
        tasksList: tasks
      };

      const response = await aiService.generateSprintCreationPlan(projectId, requestData);
      setSprintPlan(response.data);

      // Check if the AI response has an error (parsing failed)
      if (response.data.sprint_plan && response.data.sprint_plan.error) {
        const errorDetails = response.data.sprint_plan;
        setError(`AI Response Error: ${errorDetails.error}. ${errorDetails.details || ''}`);
        console.error('AI parsing error:', errorDetails);

        // Still show results to display the error details
        setEditableData(null);
        setShowResults(true);
      } else {
        // Success case - set editable data
        setEditableData(response.data.sprint_plan);
        setShowResults(true);
      }

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
      startDate: '',
      endDate: '',
      totalStoryPoints: 40,
      tasksList: ''
    });
    setError(null);
    setSprintPlan(null);
    setShowResults(false);
    setEditableData(null);
  };

  const handleCreateSprint = async () => {
    if (!editableData) return;

    setLoading(true);
    try {
      const response = await aiService.createSprintFromPlan(projectId, editableData);
      alert('Sprint created successfully!');
      resetForm();
      if (onPlanGenerated) {
        onPlanGenerated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleEditableChange = (field, value, issueIndex = null) => {
    setEditableData(prev => {
      if (issueIndex !== null) {
        // Editing an issue field
        const newIssues = [...prev.issues];
        newIssues[issueIndex] = { ...newIssues[issueIndex], [field]: value };
        return { ...prev, issues: newIssues };
      } else {
        // Editing sprint field
        return { ...prev, [field]: value };
      }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-200';
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'P4': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Story': return '📖';
      case 'Bug': return '🐛';
      case 'Task': return '✅';
      case 'Epic': return '🎯';
      default: return '📝';
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 AI Sprint Planning</h2>
        <p className="text-gray-600">
          Let AI analyze your backlog and generate an optimized sprint plan based on team capacity and priorities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
          {/* Sprint Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                📅 Sprint Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out hover:border-blue-300 hover:shadow-sm"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                📅 Sprint End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out hover:border-blue-300 hover:shadow-sm"
                required
              />
            </div>
          </div>

          {/* Total Story Points */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📊 Total Story Points *
            </label>
            <input
              type="number"
              name="totalStoryPoints"
              value={formData.totalStoryPoints}
              onChange={handleInputChange}
              min="1"
              max="200"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out hover:border-blue-300 hover:shadow-sm"
              placeholder="40"
              required
            />
            <p className="text-xs text-gray-500">Total story points available for this sprint</p>
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📝 Tasks List *
            </label>
            <textarea
              name="tasksList"
              value={formData.tasksList}
              onChange={handleInputChange}
              placeholder={`Paste all your tasks in numbered format. Example:
1. Implement user authentication (Critical)
2. Create dashboard UI components (High)
3. Setup database migrations (Medium)
4. Write unit tests (Low)

Note: Add priority in brackets (Critical/High/Medium/Low) or AI will decide automatically`}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out hover:border-blue-300 hover:shadow-sm resize-none"
              rows="8"
              required
            />
            <p className="text-xs text-gray-500">
              Keep tasks in numbered format. Add priority in brackets if needed, otherwise AI will decide.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-lg">💡</div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">How it works</h4>
                <p className="text-sm text-blue-700">
                  AI will analyze your project's backlog, consider team capacity, and suggest the optimal
                  combination of issues for your sprint with intelligent priority ordering and story point estimates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="text-red-500 text-lg">⚠️</div>
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-3 focus:ring-gray-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            🔄 Reset
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-3 focus:ring-blue-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating Plan...</span>
              </span>
            ) : (
              '🚀 Suggest Sprint Plan'
            )}
          </button>
        </div>
      </form>

      {/* Error Details Display */}
      {showResults && sprintPlan && sprintPlan.sprint_plan && sprintPlan.sprint_plan.error && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-red-900 flex items-center space-x-2 mb-4">
              <span>⚠️</span>
              <span>AI Response Error</span>
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                <p className="text-red-700 bg-red-100 p-3 rounded-lg">
                  {sprintPlan.sprint_plan.error}
                </p>
                {sprintPlan.sprint_plan.details && (
                  <p className="text-red-600 mt-2 text-sm">
                    {sprintPlan.sprint_plan.details}
                  </p>
                )}
              </div>

              {sprintPlan.sprint_plan.raw_response && (
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">Raw AI Response (for debugging):</h4>
                  <pre className="text-xs text-red-700 bg-red-100 p-3 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                    {sprintPlan.sprint_plan.raw_response}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editable Sprint Plan Results */}
      {showResults && editableData && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <span>📋</span>
                <span>AI-Generated Sprint Plan (Editable)</span>
              </h3>
              <button
                onClick={handleCreateSprint}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-3 focus:ring-green-500/20 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating Sprint...' : '✅ Create Sprint'}
              </button>
            </div>

            {/* Sprint Details Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">Sprint Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Sprint Name</label>
                  <input
                    type="text"
                    value={editableData.name || ''}
                    onChange={(e) => handleEditableChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Status</label>
                  <select
                    value={editableData.status || 'Active'}
                    onChange={(e) => handleEditableChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-800 mb-1">Sprint Goal</label>
                <textarea
                  value={editableData.goal || ''}
                  onChange={(e) => handleEditableChange('goal', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>

            {/* Issues Section */}
            {editableData.issues && editableData.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>📝</span>
                  <span>Sprint Issues ({editableData.issues.length})</span>
                </h4>
                <div className="space-y-4">
                  {editableData.issues.map((issue, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={issue.title || ''}
                            onChange={(e) => handleEditableChange('title', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                          <select
                            value={issue.issue_type || 'Story'}
                            onChange={(e) => handleEditableChange('issue_type', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Story">Story</option>
                            <option value="Task">Task</option>
                            <option value="Bug">Bug</option>
                            <option value="Epic">Epic</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={issue.priority || 'P3'}
                            onChange={(e) => handleEditableChange('priority', e.target.value, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="P1">P1 (Critical)</option>
                            <option value="P2">P2 (High)</option>
                            <option value="P3">P3 (Medium)</option>
                            <option value="P4">P4 (Low)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                          <input
                            type="number"
                            value={issue.story_points || ''}
                            onChange={(e) => handleEditableChange('story_points', parseInt(e.target.value) || 0, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="21"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Estimate (hours)</label>
                          <input
                            type="number"
                            value={issue.original_estimate || ''}
                            onChange={(e) => handleEditableChange('original_estimate', parseInt(e.target.value) || 0, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={issue.description || ''}
                          onChange={(e) => handleEditableChange('description', e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPlanningAI;
