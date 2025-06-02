import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/ai/aiService';
import SprintSelector from '../../components/ai/SprintSelector';
import { TeamRiskHeatmap } from '../../components/ai';

const RiskAssessmentPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [options, setOptions] = useState({
    includeTeamVelocity: true,
    includeBlockedIssues: true,
    includeHeatmap: true
  });

  const handleAssess = async () => {
    if (!selectedSprint) {
      setError('Please select a sprint to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getRiskAssessment(projectId, {
        sprintId: selectedSprint.id,
        ...options
      });
      setAssessment(response.data.risk_assessment);

      // Set heatmap data if available
      if (response.data.heatmap_data) {
        setHeatmapData(response.data.heatmap_data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform risk assessment');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskValue) => {
    if (typeof riskValue !== 'string') {
      return 'text-gray-700 bg-gray-50 border-gray-200'; // Default for undefined/invalid
    }
    switch (riskValue.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Risk Assessment</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 max-w-[1200px] mx-auto">
          {/* Assessment Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configure Risk Assessment</h2>
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
                      id="teamVelocity"
                      checked={options.includeTeamVelocity}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeTeamVelocity: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="teamVelocity" className="ml-3 text-gray-700">
                      Include Team Velocity Analysis
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="blockedIssues"
                      checked={options.includeBlockedIssues}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeBlockedIssues: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="blockedIssues" className="ml-3 text-gray-700">
                      Include Blocked Issues Analysis
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="heatmap"
                      checked={options.includeHeatmap}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeHeatmap: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="heatmap" className="ml-3 text-gray-700">
                      Generate Team Risk Heatmap
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleAssess}
                  disabled={loading || !selectedSprint}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 
                    ${loading || !selectedSprint 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Analyzing...' : 'Assess Risks'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Team Risk Heatmap - Positioned Above Risk Assessment */}
          {heatmapData && (
            <TeamRiskHeatmap data={heatmapData} />
          )}

          {/* Results Section */}
          {assessment && (
            <div className="space-y-6">
              {/* Overall Risk */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Risk Assessment</h2>
                <div className={`p-6 border rounded-lg ${getRiskColor(assessment.overall_risk_level)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Risk Level</p>
                      <p className="text-3xl font-bold mt-1">{assessment.overall_risk_level || 'N/A'}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-opacity-20 ${
                      assessment.overall_risk_level?.toLowerCase() === 'critical' ? 'bg-red-600' :
                      assessment.overall_risk_level?.toLowerCase() === 'high' ? 'bg-orange-500' :
                      assessment.overall_risk_level?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500' // Default for low or undefined
                    }`}>
                      <span className="text-2xl">
                        {assessment.overall_risk_level?.toLowerCase() === 'critical' ? '⚠️' :
                         assessment.overall_risk_level?.toLowerCase() === 'high' ? '⚡' :
                         assessment.overall_risk_level?.toLowerCase() === 'medium' ? '⚪' :
                         '✅'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sprint Health */}
              {assessment.sprintHealth && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Sprint Health</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Completion Probability</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">
                        {assessment.sprintHealth.completionProbability !== undefined ? `${Math.round(assessment.sprintHealth.completionProbability * 100)}%` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className={`p-6 border rounded-lg ${
                      assessment.sprintHealth.velocityTrend === 'Improving' ? 'bg-green-50 border-green-200' :
                      assessment.sprintHealth.velocityTrend === 'Declining' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200' // Default for Stable or N/A
                    }`}>
                      <p className={`text-sm font-medium ${
                        assessment.sprintHealth.velocityTrend === 'Improving' ? 'text-green-700' :
                        assessment.sprintHealth.velocityTrend === 'Declining' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>Velocity Trend</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        assessment.sprintHealth.velocityTrend === 'Improving' ? 'text-green-900' :
                        assessment.sprintHealth.velocityTrend === 'Declining' ? 'text-red-900' :
                        'text-yellow-900'
                      }`}>
                        {assessment.sprintHealth.velocityTrend || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">Blocked Issues</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">
                        {assessment.sprintHealth.blockerCount !== undefined ? assessment.sprintHealth.blockerCount : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Identified Risks */}
              {assessment.risks && assessment.risks.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Identified Risks</h2>
                  <div className="space-y-4">
                    {assessment.risks.map((risk, index) => (
                      <div
                        key={index}
                        className={`p-6 border rounded-lg ${getRiskColor(risk.impact)}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{risk.category || 'N/A'}</p>
                              <span className={`px-3 py-1 text-sm rounded-full ${getRiskColor(risk.impact)}`}>
                                {risk.impact || 'N/A'}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4">{risk.description || 'No description'}</p>
                            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">Suggested Mitigation:</p>
                              <p className="text-gray-700">{risk.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )} {/* Closing parenthesis and brace for Identified Risks conditional */}
  
                {/* Recommendations */}
                {assessment.recommendations && assessment.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
                  <div className="space-y-4">
                    {assessment.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="p-6 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="ml-4 text-blue-900">{recommendation}</p>
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

export default RiskAssessmentPage; 