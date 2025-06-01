export const projectUtils = {
  // Calculate project statistics
  calculateProjectStats: (project, boards = [], issues = []) => {
    const stats = {
      totalBoards: boards.length,
      totalIssues: issues.length,
      completedIssues: issues.filter(issue => issue.status === 'Done').length,
      inProgressIssues: issues.filter(issue => issue.status === 'In Progress').length,
      blockedIssues: issues.filter(issue => issue.status === 'Blocked').length,
      totalStoryPoints: issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0),
      completedStoryPoints: issues
        .filter(issue => issue.status === 'Done')
        .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0),
      teamSize: project.teamMembers ? project.teamMembers.length : 0
    };

    stats.completionPercentage = stats.totalIssues > 0 
      ? Math.round((stats.completedIssues / stats.totalIssues) * 100) 
      : 0;

    stats.storyPointsCompletionPercentage = stats.totalStoryPoints > 0
      ? Math.round((stats.completedStoryPoints / stats.totalStoryPoints) * 100)
      : 0;

    return stats;
  },

  // Format project data for display
  formatProjectData: (project) => {
    return {
      ...project,
      createdAt: new Date(project.createdAt).toLocaleDateString(),
      updatedAt: new Date(project.updatedAt).toLocaleDateString(),
      aiRequestsResetDate: project.aiRequestsResetDate 
        ? new Date(project.aiRequestsResetDate).toLocaleDateString() 
        : null
    };
  },

  // Validate project data
  validateProjectData: (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Project name is required';
    } else if (data.name.length > 255) {
      errors.name = 'Project name must be less than 255 characters';
    }

    if (data.description && data.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    if (data.projectKey) {
      if (!/^[A-Z]{2,4}\d{2}$/.test(data.projectKey)) {
        errors.projectKey = 'Project key must be 2-4 uppercase letters followed by 2 digits (e.g., PROJ01)';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Generate project key from name
  generateProjectKey: (name) => {
    if (!name) return '';
    
    // Extract first 3-4 letters from name
    const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase().substring(0, 4);
    
    // Add random 2-digit number
    const numbers = Math.floor(Math.random() * 90) + 10; // 10-99
    
    return `${letters}${numbers}`;
  },

  // Get project role color
  getRoleColor: (role) => {
    const roleColors = {
      'Admin': 'text-red-600 bg-red-100',
      'Project Manager': 'text-blue-600 bg-blue-100',
      'Developer': 'text-green-600 bg-green-100'
    };
    return roleColors[role] || 'text-gray-600 bg-gray-100';
  },

  // Check if user has permission
  hasPermission: (userRole, requiredPermission) => {
    const permissions = {
      'Admin': ['create', 'read', 'update', 'delete', 'manage_team', 'manage_boards'],
      'Project Manager': ['create', 'read', 'update', 'manage_team', 'manage_boards'],
      'Developer': ['create', 'read', 'update']
    };

    return permissions[userRole]?.includes(requiredPermission) || false;
  },

  // Filter projects by user role
  filterProjectsByRole: (projects, role) => {
    if (!role) return projects;
    return projects.filter(project => project.userRole === role);
  },

  // Sort projects
  sortProjects: (projects, sortBy, sortOrder = 'asc') => {
    return [...projects].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Search projects
  searchProjects: (projects, query) => {
    if (!query) return projects;
    
    const searchTerm = query.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description?.toLowerCase().includes(searchTerm) ||
      project.projectKey.toLowerCase().includes(searchTerm)
    );
  },

  // Get AI quota status
  getAIQuotaStatus: (project) => {
    const maxRequests = 10; // As per PRD
    const used = project.aiRequestsCount || 0;
    const remaining = Math.max(0, maxRequests - used);
    const percentage = Math.round((used / maxRequests) * 100);

    return {
      used,
      remaining,
      total: maxRequests,
      percentage,
      isExceeded: used >= maxRequests,
      resetDate: project.aiRequestsResetDate
    };
  },

  // Calculate project health score
  calculateHealthScore: (project, issues = []) => {
    let score = 100;
    
    // Deduct points for blocked issues
    const blockedIssues = issues.filter(issue => issue.status === 'Blocked').length;
    score -= blockedIssues * 10;
    
    // Deduct points for overdue issues (if we had due dates)
    // This would require additional date fields
    
    // Deduct points for low completion rate
    const completionRate = issues.length > 0 
      ? (issues.filter(issue => issue.status === 'Done').length / issues.length) * 100
      : 100;
    
    if (completionRate < 50) score -= 20;
    else if (completionRate < 75) score -= 10;
    
    // Ensure score doesn't go below 0
    return Math.max(0, Math.min(100, score));
  },

  // Get health score color
  getHealthScoreColor: (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }
};
