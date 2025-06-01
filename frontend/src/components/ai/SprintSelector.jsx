import React, { useState, useEffect } from 'react';
import { sprintService } from '../../services/sprint/sprintService';

const SprintSelector = ({ projectId, onSprintSelect, className = '' }) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!projectId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await sprintService.getProjectSprints(projectId);
        setSprints(response.data.sprints || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch sprints');
      } finally {
        setLoading(false);
      }
    };

    fetchSprints();
  }, [projectId]);

  return (
    <div className={className}>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      ) : sprints.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">No active sprints found</p>
        </div>
      ) : (
        <div className="relative">
          <select
            onChange={(e) => {
              const sprint = sprints.find(s => s.id === parseInt(e.target.value));
              onSprintSelect(sprint);
            }}
            className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-all duration-200 appearance-none bg-white"
          >
            <option value="">Select a sprint...</option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintSelector; 