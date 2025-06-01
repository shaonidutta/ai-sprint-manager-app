export const issueUtils = {
  // Calculate issue statistics
  calculateIssueStats: (issues) => {
    const stats = {
      total: issues.length,
      byStatus: {},
      byPriority: {},
      byType: {},
      totalStoryPoints: 0,
      totalTimeSpent: 0,
      totalTimeRemaining: 0
    };

    issues.forEach(issue => {
      // Count by status
      stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;
      
      // Count by priority
      stats.byPriority[issue.priority] = (stats.byPriority[issue.priority] || 0) + 1;
      
      // Count by type
      stats.byType[issue.issueType] = (stats.byType[issue.issueType] || 0) + 1;
      
      // Sum story points and time
      stats.totalStoryPoints += issue.storyPoints || 0;
      stats.totalTimeSpent += issue.timeSpent || 0;
      stats.totalTimeRemaining += issue.timeRemaining || 0;
    });

    return stats;
  },

  // Format issue data for display
  formatIssueData: (issue) => {
    return {
      ...issue,
      createdAt: new Date(issue.createdAt).toLocaleDateString(),
      updatedAt: new Date(issue.updatedAt).toLocaleDateString(),
      timeSpentFormatted: issueUtils.formatTime(issue.timeSpent),
      timeRemainingFormatted: issueUtils.formatTime(issue.timeRemaining),
      originalEstimateFormatted: issueUtils.formatTime(issue.originalEstimate)
    };
  },

  // Format time in hours to human readable format
  formatTime: (hours) => {
    if (!hours || hours === 0) return '0h';
    
    if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  },

  // Validate issue data
  validateIssueData: (data) => {
    const errors = {};

    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Issue title is required';
    } else if (data.title.length > 500) {
      errors.title = 'Title must be less than 500 characters';
    }

    if (data.description && data.description.length > 5000) {
      errors.description = 'Description must be less than 5000 characters';
    }

    if (data.storyPoints && (data.storyPoints < 0 || data.storyPoints > 100)) {
      errors.storyPoints = 'Story points must be between 0 and 100';
    }

    if (data.originalEstimate && data.originalEstimate < 0) {
      errors.originalEstimate = 'Original estimate must be positive';
    }

    if (data.timeRemaining && data.timeRemaining < 0) {
      errors.timeRemaining = 'Time remaining must be positive';
    }

    const validTypes = ['Story', 'Bug', 'Task', 'Epic'];
    if (data.issueType && !validTypes.includes(data.issueType)) {
      errors.issueType = 'Invalid issue type';
    }

    const validStatuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.status = 'Invalid status';
    }

    const validPriorities = ['P1', 'P2', 'P3', 'P4'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.priority = 'Invalid priority';
    }

    if (data.status === 'Blocked' && (!data.blockedReason || data.blockedReason.trim().length === 0)) {
      errors.blockedReason = 'Blocked reason is required when status is Blocked';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Get issue type icon
  getIssueTypeIcon: (type) => {
    const typeIcons = {
      'Story': 'bookmark',
      'Bug': 'bug',
      'Task': 'check-square',
      'Epic': 'zap'
    };
    return typeIcons[type] || 'circle';
  },

  // Get priority color
  getPriorityColor: (priority) => {
    const priorityColors = {
      'P1': 'text-red-600 bg-red-100',
      'P2': 'text-orange-600 bg-orange-100',
      'P3': 'text-yellow-600 bg-yellow-100',
      'P4': 'text-green-600 bg-green-100'
    };
    return priorityColors[priority] || 'text-gray-600 bg-gray-100';
  },

  // Get status color
  getStatusColor: (status) => {
    const statusColors = {
      'To Do': 'text-gray-600 bg-gray-100',
      'In Progress': 'text-blue-600 bg-blue-100',
      'Done': 'text-green-600 bg-green-100',
      'Blocked': 'text-red-600 bg-red-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  },

  // Group issues by status
  groupIssuesByStatus: (issues) => {
    return issues.reduce((groups, issue) => {
      const status = issue.status || 'To Do';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(issue);
      return groups;
    }, {});
  },

  // Group issues by assignee
  groupIssuesByAssignee: (issues) => {
    return issues.reduce((groups, issue) => {
      const assignee = issue.assignee ? `${issue.assignee.firstName} ${issue.assignee.lastName}` : 'Unassigned';
      if (!groups[assignee]) {
        groups[assignee] = [];
      }
      groups[assignee].push(issue);
      return groups;
    }, {});
  },

  // Group issues by priority
  groupIssuesByPriority: (issues) => {
    return issues.reduce((groups, issue) => {
      const priority = issue.priority || 'No Priority';
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(issue);
      return groups;
    }, {});
  },

  // Calculate completion percentage
  calculateCompletionPercentage: (issues) => {
    if (issues.length === 0) return 0;
    const completedIssues = issues.filter(issue => issue.status === 'Done').length;
    return Math.round((completedIssues / issues.length) * 100);
  },

  // Filter issues
  filterIssues: (issues, filters) => {
    return issues.filter(issue => {
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.priority && issue.priority !== filters.priority) return false;
      if (filters.issueType && issue.issueType !== filters.issueType) return false;
      if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) return false;
      if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  // Sort issues
  sortIssues: (issues, sortBy, sortOrder = 'asc') => {
    return [...issues].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
};
