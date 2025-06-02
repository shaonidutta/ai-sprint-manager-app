import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/ai/aiService';
import SprintSelector from '../../components/ai/SprintSelector';

const ScopeCreepPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);

  const handleAnalyze = async () => {
    if (!selectedSprint) {
      setError('Please select a sprint to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getScopeCreepAnalysis(projectId, {
        sprintId: selectedSprint.id,
        originalIssues: selectedSprint.originalIssues,
        currentIssues: selectedSprint.currentIssues
      });
      setAnalysis(response.data.scope_analysis); // Corrected path to analysis data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze scope creep');
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Scope Creep Analysis</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 max-w-[1200px] mx-auto">
          {/* Analysis Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Sprint for Analysis</h2>
              <div className="grid gap-6">
                <SprintSelector
                  projectId={projectId}
                  onSprintSelect={setSelectedSprint}
                  className="mb-6"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !selectedSprint}
                  className={`w-full px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 
                    ${loading || !selectedSprint 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? 'Analyzing...' : 'Analyze Scope Creep'}
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
          {analysis && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`flex items-center justify-between p-6 rounded-lg ${
                    analysis.scope_creep_detected
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div>
                      <p className={`text-sm font-medium ${
                        analysis.scope_creep_detected ? 'text-red-700' : 'text-green-700'
                      }`}>
                        Scope Creep Detected
                      </p>
                      <p className={`text-3xl font-bold ${
                        analysis.scope_creep_detected ? 'text-red-900' : 'text-green-900'
                      }`}>
                        {analysis.scope_creep_detected ? `Yes (Score: ${analysis.scope_creep_score || 'N/A'})` : 'No'}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      analysis.scope_creep_detected ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <span className="text-2xl">{analysis.scope_creep_detected ? '⚠️' : '✅'}</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-6 rounded-lg ${
                    analysis.severity === 'High'
                      ? 'bg-red-50 border border-red-200'
                      : analysis.severity === 'Medium'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200' // Default to green for Low or other
                  }`}>
                    <div>
                      <p className={`text-sm font-medium ${
                        analysis.severity === 'High'
                          ? 'text-red-700'
                          : analysis.severity === 'Medium'
                            ? 'text-yellow-700'
                            : 'text-green-700'
                      }`}>
                        Severity Level
                      </p>
                      <p className={`text-3xl font-bold ${
                        analysis.severity === 'High'
                          ? 'text-red-900'
                          : analysis.severity === 'Medium'
                            ? 'text-yellow-900'
                            : 'text-green-900'
                      }`}>
                        {analysis.severity || 'N/A'}
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      analysis.severity === 'High'
                        ? 'bg-red-100'
                        : analysis.severity === 'Medium'
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                    }`}>
                      <span className="text-2xl">
                        {analysis.severity === 'High' ? '🔴' : analysis.severity === 'Medium' ? '🟡' : '🟢'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Added Issues */}
              {analysis.addedIssues && analysis.addedIssues.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Added Issues</h2>
                  <div className="space-y-4">
                    {analysis.addedIssues.map((issue) => (
                      <div
                        key={issue.issueId}
                        className="p-6 border border-red-200 rounded-lg hover:border-red-300 transition-all duration-200 bg-red-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                          <span className="px-3 py-1.5 bg-red-100 text-red-800 text-sm rounded-md">
                            {issue.storyPoints} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Added on {new Date(issue.addedDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Issues */}
              {analysis.removedIssues && analysis.removedIssues.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Removed Issues</h2>
                  <div className="space-y-4">
                    {analysis.removedIssues.map((issue) => (
                      <div
                        key={issue.issueId}
                        className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-md">
                            {issue.storyPoints} points
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendations</h2>
                  <div className="space-y-4">
                    {analysis.recommendations.map((recommendation, index) => (
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

export default ScopeCreepPage; 