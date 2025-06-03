import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data state
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeSprints: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await api.dashboard.getStats();
      const statsData = response.data?.data || response.data || {};
      setStats({
        totalProjects: statsData.totalProjects || 0,
        activeSprints: statsData.activeSprints || 0,
        completedTasks: statsData.completedTasks || 0,
        pendingTasks: statsData.pendingTasks || 0
      });
    } catch (err) {
      // Use fallback data if API fails
      setStats({
        totalProjects: 0,
        activeSprints: 0,
        completedTasks: 0,
        pendingTasks: 0
      });
      // Don't throw error for stats - use fallback data instead
    }
  };

  // Fetch user projects with statistics
  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll({
        limit: 6, // Show only recent 6 projects on dashboard
        sort_by: 'updated_at',
        sort_order: 'desc'
      });
      const projectsData = response.data?.data?.projects || response.data?.projects || response.data || [];

      if (Array.isArray(projectsData) && projectsData.length > 0) {
        // Fetch statistics for each project
        const projectsWithStats = await Promise.allSettled(
          projectsData.map(async (project) => {
            try {
              // Fetch project statistics
              const statsResponse = await api.projects.getStats(project.id);
              const stats = statsResponse.data?.data || {};

              // Fetch team members count
              const teamResponse = await api.projects.getTeamMembers(project.id);
              const teamMembers = teamResponse.data?.data?.team_members || [];

              return {
                ...project,
                total_issues: stats.total_issues || 0,
                active_sprints: stats.active_sprints || 0,
                team_size: teamMembers.length || 0,
                team_members: teamMembers.slice(0, 3) // Only first 3 for display
              };
            } catch (error) {
              // Return project with default values if stats fail
              return {
                ...project,
                total_issues: 0,
                active_sprints: 0,
                team_size: 0,
                team_members: []
              };
            }
          })
        );

        // Extract successful results
        const enrichedProjects = projectsWithStats
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        setProjects(enrichedProjects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setProjects([]);
      // Don't throw error for projects - show empty state instead
    }
  };

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const response = await api.dashboard.getActivity({ limit: 10 });
      const activityData = response.data?.data || response.data || [];
      setRecentActivity(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      setRecentActivity([]);
      // Don't throw error for activity - show empty state instead
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data concurrently, but don't fail if individual requests fail
      // since each fetch function handles its own errors gracefully
      await Promise.allSettled([
        fetchStats(),
        fetchProjects(),
        fetchActivity()
      ]);
    } catch (err) {
      // This should rarely happen since individual functions handle errors
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Create new project
  const createProject = async (projectData) => {
    try {
      const response = await api.projects.create(projectData);
      // Refresh projects list after creation
      await fetchProjects();
      await fetchStats(); // Update stats as well
      return response.data.data.project;
    } catch (err) {
      throw new Error(err.response?.data?.error?.message || 'Failed to create project');
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  return {
    // Data
    stats,
    projects,
    recentActivity,
    user,
    
    // Loading states
    loading,
    refreshing,
    error,
    
    // Actions
    refreshDashboard,
    createProject,
    
    // Individual fetch functions for manual refresh
    fetchStats,
    fetchProjects,
    fetchActivity
  };
};
