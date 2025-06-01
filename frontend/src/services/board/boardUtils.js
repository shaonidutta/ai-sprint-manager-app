export const boardUtils = {
  // Calculate board statistics
  calculateBoardStats: (issues) => {
    return {
      totalIssues: issues.length,
      completedIssues: issues.filter(i => i.status === 'Done').length,
      blockedIssues: issues.filter(i => i.status === 'Blocked').length,
      totalStoryPoints: issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
      completedStoryPoints: issues
        .filter(i => i.status === 'Done')
        .reduce((sum, i) => sum + (i.storyPoints || 0), 0)
    };
  },

  // Group issues by status
  groupIssuesByStatus: (issues) => {
    return issues.reduce((groups, issue) => {
      const status = issue.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(issue);
      return groups;
    }, {});
  },

  // Group issues by priority
  groupIssuesByPriority: (issues) => {
    return issues.reduce((groups, issue) => {
      const priority = issue.priority;
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(issue);
      return groups;
    }, {});
  },

  // Group issues by assignee
  groupIssuesByAssignee: (issues) => {
    return issues.reduce((groups, issue) => {
      const assigneeId = issue.assignee?.id || 'unassigned';
      if (!groups[assigneeId]) {
        groups[assigneeId] = [];
      }
      groups[assigneeId].push(issue);
      return groups;
    }, {});
  },

  // Format board data for display
  formatBoardData: (board) => {
    return {
      ...board,
      createdAt: new Date(board.createdAt).toLocaleDateString(),
      updatedAt: new Date(board.updatedAt).toLocaleDateString(),
      issuesByStatus: boardUtils.groupIssuesByStatus(board.issues || []),
      stats: boardUtils.calculateBoardStats(board.issues || [])
    };
  },

  // Validate board data
  validateBoardData: (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = 'Board name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Board name must be 100 characters or less';
    }

    if (data.description && data.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Check if user can edit board
  canEditBoard: (board, user) => {
    if (!board || !user) return false;
    
    // Project admins and project managers can edit boards
    if (board.project?.userRole === 'Admin' || board.project?.userRole === 'Project Manager') {
      return true;
    }

    // Board creator can edit their own boards
    return board.createdBy === user.id;
  },

  // Calculate board completion percentage
  calculateCompletionPercentage: (issues) => {
    if (!issues || issues.length === 0) return 0;
    const completed = issues.filter(i => i.status === 'Done').length;
    return Math.round((completed / issues.length) * 100);
  }
}; 