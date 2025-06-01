import React, { useState } from 'react';
import { Card, Button } from '../components/common';
import { useDashboard } from '../hooks/useDashboard';
import StatsCard, { StatsIcons } from '../components/dashboard/StatsCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';

const Dashboard = () => {
  const {
    stats,
    projects,
    recentActivity,
    user,
    loading,
    refreshing,
    error,
    refreshDashboard,
    createProject
  } = useDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'project_created':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'issue_created':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'issue_updated':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'sprint_started':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sprint_completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return '';
      
      // Debug log to see what timestamp we're receiving
      console.log('Formatting timestamp:', timestamp);
      
      // Handle MySQL datetime format (YYYY-MM-DD HH:mm:ss)
      const date = new Date(timestamp);
      console.log('Parsed date:', date);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date from timestamp:', timestamp);
        return 'Just now'; // Fallback for new items
      }

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // For very recent items (less than a minute ago)
      if (Math.abs(diffTime) < 60000) {
        return 'Just now';
      }
      
      // For recent items (less than an hour ago)
      if (Math.abs(diffTime) < 3600000) {
        const minutes = Math.floor(Math.abs(diffTime) / 60000);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      }
      
      // For items from today
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      }
      
      // For yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // For future dates
      if (diffTime > 0) {
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `in ${diffDays} days`;
      }
      
      // For older dates
      const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      if (Math.abs(diffDays) < 7) {
        return formatter.format(-Math.abs(diffDays), 'day');
      } else if (Math.abs(diffDays) < 30) {
        const weeks = Math.round(diffDays / 7);
        return formatter.format(-Math.abs(weeks), 'week');
      } else if (Math.abs(diffDays) < 365) {
        const months = Math.round(diffDays / 30);
        return formatter.format(-Math.abs(months), 'month');
      } else {
        const years = Math.round(diffDays / 365);
        return formatter.format(-Math.abs(years), 'year');
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Just now'; // Fallback for any errors
    }
  };

  const handleCreateProject = async (projectData) => {
    setCreateLoading(true);
    try {
      await createProject(projectData);
      setShowCreateModal(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    } finally {
      setCreateLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Failed to load dashboard</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={refreshDashboard} disabled={refreshing}>
            {refreshing ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {getGreeting()}, {user?.first_name || 'there'}!
            </h1>
            <p className="text-neutral-600">Here's what's happening with your projects.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={StatsIcons.projects}
            color="primary"
            loading={loading}
          />
          <StatsCard
            title="Active Sprints"
            value={stats.activeSprints}
            icon={StatsIcons.sprints}
            color="secondary"
            loading={loading}
          />
          <StatsCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={StatsIcons.completed}
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={StatsIcons.pending}
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Projects</h2>
            {projects.length > 0 && (
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Projects
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="h-6 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                      <div className="text-center">
                        <div className="h-6 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                      <div className="text-center">
                        <div className="h-6 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-neutral-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
              <p className="text-neutral-600 mb-4">Get started by creating your first project</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Project
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card header="Recent Activity">
            <div className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-900">{activity.description}</p>
                      <p className="text-xs text-neutral-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-600">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* AI Features Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">AI-Powered Features Available</h3>
              <p className="mt-1 text-sm text-blue-700">
                Enhance your project management with AI features! Visit your project details page to access AI-powered sprint planning, risk assessment, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
          loading={createLoading}
        />
    </div>
  );
};

export default Dashboard;
