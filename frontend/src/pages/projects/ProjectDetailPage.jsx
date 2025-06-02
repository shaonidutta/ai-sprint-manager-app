import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '../../components/common';
import { api } from '../../api';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [boards, setBoards] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getById(id);
      setProject(response.data.data.project);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch project boards (multiple boards per project)
  const fetchBoards = async () => {
    try {
      setBoardLoading(true);
      const response = await api.boards.getAll(id);
      console.log('Boards API response:', response.data);
      const boardsData = response.data.data.boards || [];
      console.log('Boards data:', boardsData);
      // Filter out any undefined or invalid board objects
      const validBoards = boardsData.filter(board => {
        const isValid = board && board.id && board.name;
        if (!isValid) {
          console.warn('Invalid board object:', board);
        }
        return isValid;
      });
      console.log('Valid boards:', validBoards);
      setBoards(validBoards);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setBoards([]); // Set empty array on error
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchBoards();
    }
  }, [id]);



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          {/* Back Navigation Skeleton */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-6 bg-neutral-200 rounded"></div>
            <div className="h-6 bg-neutral-200 rounded w-32"></div>
          </div>

          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-4 bg-neutral-200 rounded w-20"></div>
            <div className="w-4 h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-32"></div>
          </div>

          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-20 h-20 bg-neutral-200 rounded-xl"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-neutral-200 rounded w-64"></div>
                  <div className="h-6 bg-neutral-200 rounded w-48"></div>
                  <div className="h-4 bg-neutral-200 rounded w-96"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="h-12 bg-neutral-200 rounded w-24"></div>
                <div className="h-12 bg-neutral-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex-1 p-4">
                  <div className="h-6 bg-neutral-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-8 border-0 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg"></div>
                  <div className="h-6 bg-neutral-200 rounded w-32"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-12 bg-neutral-200 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Project not found</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
            <Button onClick={fetchProject}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium text-neutral-900">Project not found</h3>
        <p className="text-neutral-600 mt-2">The project you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'ai', label: 'AI Features' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-150 group"
            aria-label="Back to Projects"
          >
            <svg
              className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Projects</span>
          </button>
        </div>

        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/projects" className="text-neutral-500 hover:text-neutral-700 transition-colors duration-150">
                Projects
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-neutral-900 font-medium">{project.name}</span>
            </li>
          </ol>
        </nav>

        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                {getProjectInitials(project.name)}
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-neutral-900 leading-tight">{project.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-800">
                    {project.project_key}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-600 text-sm">
                    Created {formatDate(project.created_at)}
                  </span>
                </div>
                {project.description && (
                  <p className="text-neutral-700 text-lg leading-relaxed max-w-2xl">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/projects/${id}/settings`)}
                className="transition-all duration-150 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Button>
              {boards.length > 0 && (
                <Button
                  onClick={() => navigate(`/board?project=${id}`)}
                  className="transition-all duration-150 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  View Boards
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-150 relative ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-b-2 border-transparent'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 opacity-50"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Project Details</h3>
              </div>
              <dl className="space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <dt className="text-sm font-medium text-neutral-500 mb-1">Created</dt>
                  <dd className="text-base text-neutral-900 font-medium">{formatDate(project.created_at)}</dd>
                </div>
                <div className="border-b border-neutral-100 pb-3">
                  <dt className="text-sm font-medium text-neutral-500 mb-1">Last Updated</dt>
                  <dd className="text-base text-neutral-900 font-medium">{formatDate(project.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500 mb-1">Project Key</dt>
                  <dd className="text-base text-neutral-900 font-mono font-semibold bg-neutral-50 px-3 py-2 rounded-lg inline-block">
                    {project.project_key}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-600">Total Issues</span>
                  <span className="text-lg font-bold text-neutral-900">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-600">Active Sprints</span>
                  <span className="text-lg font-bold text-neutral-900">0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-600">Team Members</span>
                  <span className="text-lg font-bold text-neutral-900">1</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                {boards.length > 0 ? (
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => navigate(`/board?project=${id}`)}
                    className="h-12 transition-all duration-150 hover:shadow-md hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    View Boards
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No boards available</p>
                  </div>
                )}
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate(`/projects/${id}/team`)}
                  className="h-12 transition-all duration-150 hover:shadow-md hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Team
                </Button>
                <Button
                  fullWidth
                  onClick={() => setActiveTab('ai')}
                  className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-150 hover:shadow-md hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Features
                </Button>
              </div>
            </Card>
          </div>
        )}



        {activeTab === 'team' && (
          <Card className="p-12 text-center border-0 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Team Management</h3>
              <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
                Manage your project team members, assign roles, and control permissions for collaborative work.
              </p>
              <Button
                onClick={() => navigate(`/projects/${id}/team`)}
                className="transition-all duration-150 hover:shadow-md min-h-[44px] px-8"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Manage Team
              </Button>
            </div>
          </Card>
        )}

        {false && activeTab === 'settings' && (
          <Card className="p-12 text-center border-0 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-3">Project Settings</h3>
              <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
                Configure your project settings, preferences, and advanced options to customize your workflow.
              </p>
              <Button
                onClick={() => navigate(`/projects/${id}/settings`)}
                className="transition-all duration-150 hover:shadow-md min-h-[44px] px-8"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Settings
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">AI-Powered Features</h2>
                <p className="text-neutral-600 text-lg leading-relaxed">
                  Enhance your project management with intelligent insights, automated analysis, and data-driven recommendations
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sprint Planning Assistant */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <button
                      onClick={() => navigate(`/ai/sprint-planning/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium min-h-[44px]"
                    >
                      Try Now
                    </button>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Sprint Planning Assistant
                  </h3>
                  <p className="text-white text-opacity-90 leading-relaxed">
                    AI-powered sprint planning suggestions based on team velocity, capacity, and historical data.
                  </p>
                </div>
              </div>

              {/* Scope Creep Detection */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <button
                      onClick={() => navigate(`/ai/scope-creep/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium min-h-[44px]"
                    >
                      Analyze Now
                    </button>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Scope Creep Detection
                  </h3>
                  <p className="text-white text-opacity-90 leading-relaxed">
                    Early detection of potential scope creep using AI analysis of requirements and changes.
                  </p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <button
                      onClick={() => navigate(`/ai/risk-assessment/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium min-h-[44px]"
                    >
                      Assess Risks
                    </button>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Risk Assessment
                  </h3>
                  <p className="text-white text-opacity-90 leading-relaxed">
                    AI-driven project risk assessment and mitigation recommendations.
                  </p>
                </div>
              </div>

              {/* Sprint Retrospective */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <button
                      onClick={() => navigate(`/ai/retrospective/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium min-h-[44px]"
                    >
                      Generate Insights
                    </button>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Sprint Retrospective Insights
                  </h3>
                  <p className="text-white text-opacity-90 leading-relaxed">
                    AI analysis of sprint performance and team collaboration patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Dashboard Link */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-neutral-900">AI Features Dashboard</h3>
                      <p className="text-neutral-600 mt-1 text-lg">View all AI insights and analytics in one comprehensive dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/ai/dashboard/${id}`)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium min-h-[44px] hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


    </div>
  );
};

export default ProjectDetailPage;
