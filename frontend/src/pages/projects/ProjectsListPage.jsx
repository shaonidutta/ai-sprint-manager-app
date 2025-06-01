import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { SearchIcon, ChevronDownIcon, ArrowRightIcon, CloseIcon } from '../../components/common/Icons';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import CreateProjectModal from '../../components/dashboard/CreateProjectModal';

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 50
      };

      const response = await api.projects.getAll(params);
      setProjects(response.data.data.projects || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, sortBy, sortOrder]);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectSubmit = async (projectData) => {
    setCreateLoading(true);
    try {
      const response = await api.projects.create(projectData);
      const newProject = response.data.data.project;

      // Add new project to the list
      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);

      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      // Let the modal handle the error display
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    console.log('[ProjectsListPage] Navigating to project:', projectId);
    if (!projectId) {
      console.error('[ProjectsListPage] Project ID is missing');
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
            <p className="text-neutral-600">Manage and organize your projects</p>
          </div>
          <Button onClick={handleCreateProject}>
            Create Project
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-neutral-200 rounded-sm shadow-card">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Enhanced Search Field */}
              <div className="flex-1 relative">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    id="search-projects"
                    name="search"
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                      w-full pl-10 pr-10 py-2
                      border border-neutral-300 rounded-sm
                      text-body text-neutral-900 placeholder-neutral-500
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all duration-200 ease-in-out
                      hover:border-neutral-400
                    "
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="
                        absolute right-3 top-1/2 transform -translate-y-1/2
                        w-4 h-4 text-neutral-500 hover:text-neutral-700
                        transition-colors duration-200
                      "
                      aria-label="Clear search"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="
                      appearance-none pl-3 pr-8 py-2 w-full sm:w-auto
                      border border-neutral-300 rounded-sm
                      text-body text-neutral-900 bg-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all duration-200 ease-in-out
                      hover:border-neutral-400 hover:bg-neutral-50
                      cursor-pointer
                    "
                  >
                    <option value="updated_at">Last Updated</option>
                    <option value="created_at">Created Date</option>
                    <option value="name">Name</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="
                      appearance-none pl-3 pr-8 py-2 w-full sm:w-auto
                      border border-neutral-300 rounded-sm
                      text-body text-neutral-900 bg-white
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all duration-200 ease-in-out
                      hover:border-neutral-400 hover:bg-neutral-50
                      cursor-pointer
                    "
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 border-error-200 bg-error-50">
            <p className="text-error-700">{error}</p>
          </Card>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="bg-white border border-neutral-200 rounded-sm shadow-card">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-4 border-b border-neutral-200 last:border-b-0 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="h-5 bg-neutral-200 rounded w-2/3 sm:w-1/3 mb-2"></div>
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 sm:w-1/6 mb-1 sm:mb-0"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2 sm:w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-8 w-full sm:w-16 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects found</h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm ? 'No projects match your search criteria.' : 'Get started by creating your first project.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateProject}>
                  Create Your First Project
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-sm shadow-card overflow-hidden">
            {projects.map((project, index) => {
              console.log('[ProjectsListPage] Rendering project:', project);
              return (
                <div
                  key={project.id}
                  className="
                    group p-4 border-b border-neutral-200 last:border-b-0
                    hover:bg-neutral-50 transition-all duration-200 ease-in-out
                    cursor-pointer
                  "
                  onClick={() => handleProjectClick(project.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project.id);
                    }
                  }}
                  aria-label={`View details for ${project.name}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Project Information */}
                    <div className="flex-1 min-w-0">
                      {/* Project Name */}
                      <h3 className="
                        text-subheading font-medium text-neutral-900
                        truncate mb-1
                        group-hover:text-primary-600 transition-colors duration-200
                      ">
                        {project.name}
                      </h3>

                      {/* Project Key and Last Updated - Mobile: stacked, Desktop: inline */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <p className="text-small text-neutral-500 font-mono uppercase tracking-wide">
                          {project.project_key}
                        </p>
                        <p className="text-small text-neutral-500">
                          {formatRelativeTime(project.updated_at)}
                        </p>
                      </div>
                    </div>

                    {/* Details Button */}
                    <div className="flex-shrink-0 self-start sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project.id);
                        }}
                        className="
                          inline-flex items-center gap-2 px-3 py-2
                          text-small font-medium text-neutral-700
                          border border-neutral-300 rounded-sm bg-white
                          hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                          transition-all duration-200 ease-in-out
                          group-hover:border-primary-300 group-hover:text-primary-700
                          w-full sm:w-auto justify-center sm:justify-start
                        "
                        aria-label={`View details for ${project.name}`}
                      >
                        Details
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleProjectSubmit}
          loading={createLoading}
        />
    </div>
  );
};

export default ProjectsListPage;
