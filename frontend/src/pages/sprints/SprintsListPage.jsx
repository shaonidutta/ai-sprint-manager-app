import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { api } from '../../api';

const SprintsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll({ limit: 100 });
      setProjects(response.data.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  // Fetch sprints for selected project
  const fetchSprints = async (projectId) => {
    if (!projectId) {
      setSprints([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // First get the project's boards, then fetch sprints for the first board
      const boardsResponse = await api.boards.getAll(projectId);
      const boards = boardsResponse.data.data.boards || [];

      if (boards.length > 0) {
        // Get sprints for the first board (assuming one board per project)
        const sprintsResponse = await api.sprints.getAll(boards[0].id);
        setSprints(sprintsResponse.data.data.sprints || []);
      } else {
        setSprints([]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sprints:', err);
      setError('Failed to load sprints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-select first project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProject && !projectId) {
      const firstProject = projects[0];
      setSelectedProject(firstProject.id.toString());
      navigate(`/sprints?project=${firstProject.id}`, { replace: true });
    }
  }, [projects, selectedProject, projectId, navigate]);

  useEffect(() => {
    if (selectedProject) {
      fetchSprints(selectedProject);
    } else {
      setSprints([]);
      setLoading(false);
    }
  }, [selectedProject]);

  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProject(newProjectId);
    
    // Update URL params
    if (newProjectId) {
      navigate(`/sprints?project=${newProjectId}`, { replace: true });
    } else {
      navigate('/sprints', { replace: true });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSprintInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const filteredSprints = sprints.filter(sprint =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sprint.goal && sprint.goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900">Sprints</h1>
          <p className="text-neutral-600 text-lg">Manage your project sprints and iterations</p>
        </div>
        <Button
          onClick={() => navigate(`/sprints/planning?project=${selectedProject}`)}
          disabled={!selectedProject}
          className="w-full sm:w-auto"
        >
          Sprint Planning
        </Button>
      </div>

      {/* Project Selection and Search */}
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label htmlFor="project" className="block text-sm font-semibold text-neutral-700 mb-2">
              Select Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={handleProjectChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150 bg-white text-neutral-900"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.project_key})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-semibold text-neutral-700 mb-2">
                Search Sprints
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Search by name or goal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 rounded-lg"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Project Info */}
      {selectedProjectData && (
        <Card className="p-6 bg-primary-50 border-primary-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-lg flex items-center justify-center font-semibold text-lg shadow-sm">
              {selectedProjectData.project_key}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 text-lg">{selectedProjectData.name}</h3>
              {selectedProjectData.description && (
                <p className="text-neutral-600 mt-1 leading-relaxed">{selectedProjectData.description}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50 shadow-sm">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Sprints List */}
      {!selectedProject ? (
        <Card className="p-16 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">Select a project</h3>
            <p className="text-neutral-600 text-lg leading-relaxed">Choose a project from the dropdown above to view its sprints.</p>
          </div>
        </Card>
      ) : loading ? (
        <Card className="divide-y divide-neutral-100">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-neutral-200 rounded-md"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2 mb-3"></div>
                      <div className="flex space-x-4">
                        <div className="h-3 bg-neutral-200 rounded w-20"></div>
                        <div className="h-3 bg-neutral-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-6 bg-neutral-200 rounded-full"></div>
                    <div className="w-5 h-5 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      ) : filteredSprints.length === 0 ? (
        <Card className="p-16 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">No sprints found</h3>
            <p className="text-neutral-600 text-lg leading-relaxed mb-8">
              {searchTerm ? 'No sprints match your search criteria.' : 'Get started by creating your first sprint.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => navigate('/sprints/new')}
                className="px-6 py-3"
              >
                Create Your First Sprint
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-neutral-100">
          {filteredSprints.map((sprint) => (
            <div
              key={sprint.id}
              className="group p-4 sm:p-6 hover:bg-neutral-50 hover:shadow-sm transition-all duration-150 cursor-pointer min-h-[44px] touch-manipulation border-l-4 border-transparent hover:border-primary-500"
              onClick={() => navigate(`/sprints/planning?project=${selectedProject}`)}
            >
              <div className="flex items-start sm:items-center justify-between">
                {/* Left section - Sprint info */}
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  {/* Sprint avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-500 group-hover:bg-secondary-600 text-white rounded-lg flex items-center justify-center font-medium text-sm sm:text-lg shadow-sm group-hover:shadow-md flex-shrink-0 transition-all duration-150">
                    {getSprintInitials(sprint.name)}
                  </div>

                  {/* Sprint details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-1">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors duration-150">
                        {sprint.name}
                      </h3>
                      <span className={`inline-block mt-1 sm:mt-0 px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(sprint.status)} w-fit group-hover:shadow-sm transition-shadow duration-150`}>
                        {sprint.status}
                      </span>
                    </div>

                    {sprint.goal && (
                      <p className="text-neutral-600 text-sm mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                        {sprint.goal}
                      </p>
                    )}

                    {/* Sprint dates */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-xs sm:text-sm text-neutral-500">
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Start: {formatDate(sprint.start_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>End: {formatDate(sprint.end_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section - Action indicator */}
                <div className="flex items-center space-x-3 ml-2 sm:ml-4 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center transition-all duration-150">
                    <svg
                      className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors duration-150"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default SprintsListPage;
