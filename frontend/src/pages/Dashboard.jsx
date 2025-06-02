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
      if (!timestamp) return 'Unknown';

      // Handle different timestamp formats
      let date;

      // If timestamp is already a string like "10 minutes ago", return it
      if (typeof timestamp === 'string' && timestamp.includes('ago')) {
        return timestamp;
      }

      // Handle ISO string, MySQL datetime, or timestamp number
      if (typeof timestamp === 'string') {
        // Handle MySQL datetime format (YYYY-MM-DD HH:mm:ss)
        if (timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
          date = new Date(timestamp.replace(' ', 'T') + 'Z');
        } else {
          date = new Date(timestamp);
        }
      } else if (typeof timestamp === 'number') {
        // Handle Unix timestamp (seconds or milliseconds)
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) {
        console.warn('Invalid date from timestamp:', timestamp);
        return 'Unknown';
      }

      const now = new Date();
      const diffTime = now.getTime() - date.getTime(); // Past is positive
      const diffMinutes = Math.floor(diffTime / 60000);
      const diffHours = Math.floor(diffTime / 3600000);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // For very recent items (less than a minute ago)
      if (diffMinutes < 1) {
        return 'Just now';
      }

      // For recent items (less than an hour ago)
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      }

      // For items from today (less than 24 hours ago)
      if (diffHours < 24 && date.toDateString() === now.toDateString()) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      }

      // For yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }

      // For this week (less than 7 days ago)
      if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      }

      // For older dates, use relative time formatting
      const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return formatter.format(-weeks, 'week');
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return formatter.format(-months, 'month');
      } else {
        const years = Math.floor(diffDays / 365);
        return formatter.format(-years, 'year');
      }
    } catch (error) {
      console.error('Date formatting error:', error, 'for timestamp:', timestamp);
      return 'Unknown';
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 text-red-500">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Failed to load dashboard</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
              <div className="space-y-3">
                <Button
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="w-full min-h-[44px] transition-all duration-150"
                >
                  {refreshing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact support or try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Page Header */}
        <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.first_name || 'there'}!
              </h1>
              <p className="text-gray-600 text-lg">Here's what's happening with your projects.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={refreshDashboard}
                disabled={refreshing}
                className="flex items-center justify-center space-x-2 min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Project
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={StatsIcons.projects}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Active Sprints"
            value={stats.activeSprints}
            icon={StatsIcons.sprints}
            color="primary"
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
        </section>

        {/* Projects Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recent Projects</h2>
              <p className="text-gray-600 mt-1">Your most recently updated projects</p>
            </div>
            {projects.length > 0 && (
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150 min-h-[44px] flex items-center">
                View All Projects
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 lg:py-16">
              <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first project and begin managing your team's work efficiently</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Project
              </Button>
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600 mt-1">Latest updates across your projects</p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">Activity will appear here as you work on your projects</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Features Note */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 lg:p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">AI-Powered Features Available</h3>
              <p className="text-blue-700 leading-relaxed">
                Enhance your project management with intelligent insights! Visit your project details page to access AI-powered sprint planning, risk assessment, scope creep detection, and retrospective analysis.
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
    </div>
  );
};

export default Dashboard;
