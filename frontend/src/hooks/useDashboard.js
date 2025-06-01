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
  const [aiInsights, setAiInsights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await api.dashboard.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      // Use fallback data if API fails
      setStats({
        totalProjects: 0,
        activeSprints: 0,
        completedTasks: 0,
        pendingTasks: 0
      });
    }
  };

  // Fetch user projects
  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll({ 
        limit: 6, // Show only recent 6 projects on dashboard
        sort_by: 'updated_at',
        sort_order: 'desc'
      });
      setProjects(response.data.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
    }
  };

  // Fetch recent activity
  const fetchActivity = async () => {
    try {
      const response = await api.dashboard.getActivity({ limit: 10 });
      setRecentActivity(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      setRecentActivity([]);
    }
  };

  // Fetch AI insights
  const fetchAIInsights = async () => {
    try {
      const response = await api.dashboard.getAIInsights();
      setAiInsights(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      // Use fallback insights if API fails
      setAiInsights([
        {
          type: 'suggestion',
          title: 'Sprint Planning Suggestion',
          message: 'Consider breaking down large tasks into smaller, manageable pieces for better velocity tracking.',
          priority: 'medium'
        },
        {
          type: 'alert',
          title: 'Performance Update',
          message: 'Your team velocity has been consistent. Great work maintaining steady progress!',
          priority: 'low'
        }
      ]);
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchProjects(),
        fetchActivity(),
        fetchAIInsights()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
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
    aiInsights,
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
    fetchActivity,
    fetchAIInsights
  };
};
