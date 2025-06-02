import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SprintPlanningAI } from '../../components/ai';
import { boardService } from '../../services/board/boardService';

const SprintPlanningPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [planResult, setPlanResult] = useState(null);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState(null);

  useEffect(() => {
    if (projectId) {
      const fetchBoardData = async () => {
        setBoardLoading(true);
        setBoardError(null);
        try {
          const apiResult = await boardService.getBoards(projectId);
          if (apiResult && apiResult.success && apiResult.data && apiResult.data.boards && apiResult.data.boards.length > 0) {
            setSelectedBoardId(apiResult.data.boards[0].id);
          } else {
            let errorMsg = 'No boards found for this project.';
            if (apiResult && !apiResult.success) {
              errorMsg = apiResult.message || 'Failed to load board data (API error).';
            } else if (!apiResult || !apiResult.data || !apiResult.data.boards) {
              errorMsg = 'Unexpected response structure when fetching boards.';
            }
            setBoardError(errorMsg);
          }
        } catch (error) {
          console.error('Failed to fetch board ID:', error);
          setBoardError(error.message || 'Failed to fetch board information.');
        } finally {
          setBoardLoading(false);
        }
      };
      fetchBoardData();
    }
  }, [projectId]);

  const handlePlanGenerated = (result) => {
    setPlanResult(result);
  };

  const calculateDuration = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 'N/A';
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 for inclusive days
    return diffDays;
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">AI Sprint Planning</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 max-w-[1200px] mx-auto">
          {/* Sprint Planning Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {boardLoading && <p>Loading board information...</p>}
            {boardError && <p className="text-red-500">Error: {boardError}</p>}
            {!boardLoading && !boardError && selectedBoardId && (
              <SprintPlanningAI
                projectId={projectId}
                boardId={selectedBoardId}
                onPlanGenerated={handlePlanGenerated}
              />
            )}
            {!boardLoading && !boardError && !selectedBoardId && (
              <p>No board available for sprint planning.</p>
            )}
          </div>

          {/* Results Section */}
          {planResult && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sprint Plan Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-6 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Recommended Story Points</p>
                      <p className="text-3xl font-bold text-blue-900">{planResult.sprint_plan?.capacity_story_points || 'N/A'}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-700">Suggested Duration</p>
                      <p className="text-3xl font-bold text-green-900">
                        {calculateDuration(planResult.sprint_plan?.start_date, planResult.sprint_plan?.end_date)} days
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Issues */}
              {planResult.recommendedIssues && planResult.recommendedIssues.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Issues</h2>
                  <div className="space-y-4">
                    {planResult.recommendedIssues.map((issue, index) => (
                      <div
                        key={issue.id || index}
                        className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-md">
                            {issue.storyPoints} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{issue.reasoning}</p>
                        {issue.priority && (
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                              issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {issue.priority} Priority
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks Section */}
              {planResult.risks && planResult.risks.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Potential Risks</h2>
                  <div className="space-y-4">
                    {planResult.risks.map((risk, index) => (
                      <div
                        key={index}
                        className="p-6 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-red-800">{risk.title}</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{risk.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives Section */}
              {planResult.alternatives && planResult.alternatives.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Alternative Approaches</h2>
                  <div className="space-y-4">
                    {planResult.alternatives.map((alternative, index) => (
                      <div
                        key={index}
                        className="p-6 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <h3 className="text-base font-medium text-purple-900 mb-3">{alternative.title}</h3>
                        <p className="text-sm text-purple-700">{alternative.description}</p>
                        {alternative.benefits && (
                          <ul className="mt-4 space-y-2">
                            {alternative.benefits.map((benefit, idx) => (
                              <li key={idx} className="text-sm text-purple-600 flex items-center">
                                <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
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

export default SprintPlanningPage; 