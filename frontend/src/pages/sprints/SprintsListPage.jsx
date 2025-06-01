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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Sprints</h1>
          <p className="text-neutral-600">Manage your project sprints and iterations</p>
        </div>
        <Button
          onClick={() => navigate(`/sprints/planning?project=${selectedProject}`)}
          disabled={!selectedProject}
        >
          Sprint Planning
        </Button>
      </div>

      {/* Project Selection and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="project" className="block text-sm font-medium text-neutral-700 mb-1">
              Select Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={handleProjectChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">
                Search Sprints
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Search sprints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Project Info */}
      {selectedProjectData && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 text-white rounded-md flex items-center justify-center font-medium">
              {selectedProjectData.project_key}
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">{selectedProjectData.name}</h3>
              {selectedProjectData.description && (
                <p className="text-sm text-neutral-600">{selectedProjectData.description}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-error-200 bg-error-50">
          <p className="text-error-700">{error}</p>
        </Card>
      )}

      {/* Sprints Grid */}
      {!selectedProject ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Select a project</h3>
            <p className="text-neutral-600">Choose a project from the dropdown above to view its sprints.</p>
          </div>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-neutral-200 rounded"></div>
                <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredSprints.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No sprints found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm ? 'No sprints match your search criteria.' : 'Get started by creating your first sprint.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/sprints/new')}>
                Create Your First Sprint
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSprints.map((sprint) => (
            <Card 
              key={sprint.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/sprints/${sprint.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-500 text-white rounded-md flex items-center justify-center font-medium">
                    {getSprintInitials(sprint.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-neutral-900 truncate">
                      {sprint.name}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Sprint
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sprint.status)}`}>
                  {sprint.status}
                </span>
              </div>
              
              {sprint.goal && (
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {sprint.goal}
                </p>
              )}
              
              <div className="space-y-2 text-sm text-neutral-500">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span>{formatDate(sprint.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>End Date:</span>
                  <span>{formatDate(sprint.end_date)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintsListPage;
