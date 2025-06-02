import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/ai/aiService';
import SprintSelector from '../../components/ai/SprintSelector';

const RetrospectivePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrospective, setRetrospective] = useState(null);
  const [sprintSummaryData, setSprintSummaryData] = useState(null); // New state for sprint summary
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [options, setOptions] = useState({
    includeVelocityData: true,
    includeIssueMetrics: true
  });

  const handleGenerate = async () => {
    if (!selectedSprint) {
      setError('Please select a sprint to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getRetrospectiveInsights(projectId, {
        sprintId: selectedSprint.id,
        ...options
      });
      setRetrospective(response.data.retrospective_insights);
      setSprintSummaryData(response.data.sprint_summary); // Set sprint summary data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate retrospective insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Sprint Retrospective</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 max-w-[1200px] mx-auto">
          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Retrospective Insights</h2>
              <div className="grid gap-6">
                <SprintSelector
                  projectId={projectId}
                  onSprintSelect={setSelectedSprint}
                  className="mb-6"
                />
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="velocityData"
                      checked={options.includeVelocityData}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeVelocityData: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="velocityData" className="ml-3 text-gray-700">
                      Include Velocity Data Analysis
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="issueMetrics"
                      checked={options.includeIssueMetrics}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeIssueMetrics: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="issueMetrics" className="ml-3 text-gray-700">
                      Include Issue Metrics Analysis
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !selectedSprint}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 
                    ${loading || !selectedSprint 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Generating...' : 'Generate Insights'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {retrospective && sprintSummaryData && ( // Check for both states
            <div className="space-y-6">
              {/* Sprint Summary */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sprint Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">Completed Points</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {sprintSummaryData.completedPoints !== undefined ? sprintSummaryData.completedPoints : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-700">Planned Points</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {sprintSummaryData.plannedPoints !== undefined ? sprintSummaryData.plannedPoints : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-700">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {(sprintSummaryData.plannedPoints && sprintSummaryData.completedPoints !== undefined && sprintSummaryData.plannedPoints > 0)
                        ? `${Math.round((sprintSummaryData.completedPoints / sprintSummaryData.plannedPoints) * 100)}%`
                        : (sprintSummaryData.plannedPoints === 0 && sprintSummaryData.completedPoints === 0)
                          ? '0%' // Or 'N/A' if preferred for 0/0 case
                          : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-700">Avg. Cycle Time</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">
                      {sprintSummaryData.averageCycleTime !== undefined ? `${sprintSummaryData.averageCycleTime.toFixed(1)} days` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Insights</h2>
                <div className="space-y-4">
                  {retrospective.productivity_insights && retrospective.productivity_insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-6 border rounded-lg ${
                        insight.category === 'Velocity' ? 'bg-blue-50 border-blue-200' :
                        insight.category === 'Quality' ? 'bg-green-50 border-green-200' :
                        insight.category === 'Process' ? 'bg-purple-50 border-purple-200' :
                        'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          {/* Simplified display for string-based insights */}
                          <p className="text-gray-900">{insight}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Improvements */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Suggested Improvements</h2>
                <div className="space-y-4">
                  {retrospective.improvement_suggestions && retrospective.improvement_suggestions.map((improvement, index) => (
                    <div
                      key={index}
                      className="p-6 border rounded-lg bg-green-50 border-green-200" // Default styling for suggestions
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          {/* Simplified display for string-based improvements */}
                          <p className="text-gray-700">{improvement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Celebrations */}
              {retrospective.celebrations && retrospective.celebrations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Celebrations 🎉</h2>
                  <div className="space-y-4">
                    {retrospective.celebrations.map((celebration, index) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">🌟</span>
                          </div>
                          <p className="ml-4 text-gray-900">{celebration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetrospectivePage; 