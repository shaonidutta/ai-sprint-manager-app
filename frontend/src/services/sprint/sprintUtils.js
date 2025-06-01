export const sprintUtils = {
  // Calculate sprint statistics
  calculateSprintStats: (sprint, issues = []) => {
    const sprintIssues = issues.filter(issue => issue.sprintId === sprint.id);
    const completedIssues = sprintIssues.filter(issue => issue.status === 'Done');
    const inProgressIssues = sprintIssues.filter(issue => issue.status === 'In Progress');
    const blockedIssues = sprintIssues.filter(issue => issue.status === 'Blocked');

    const totalStoryPoints = sprintIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const completedStoryPoints = completedIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

    return {
      totalIssues: sprintIssues.length,
      completedIssues: completedIssues.length,
      inProgressIssues: inProgressIssues.length,
      blockedIssues: blockedIssues.length,
      totalStoryPoints,
      completedStoryPoints,
      completionPercentage: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0,
      velocity: completedStoryPoints
    };
  },

  // Calculate sprint progress
  calculateSprintProgress: (sprint) => {
    if (!sprint.startDate || !sprint.endDate) {
      return { daysElapsed: 0, totalDays: 0, progressPercentage: 0 };
    }

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const currentDate = new Date();

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)));
    const progressPercentage = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

    return {
      daysElapsed: Math.min(daysElapsed, totalDays),
      totalDays,
      progressPercentage,
      daysRemaining: Math.max(0, totalDays - daysElapsed),
      isOverdue: currentDate > endDate
    };
  },

  // Format sprint data for display
  formatSprintData: (sprint) => {
    return {
      ...sprint,
      startDate: sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : null,
      endDate: sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : null,
      createdAt: new Date(sprint.createdAt).toLocaleDateString(),
      duration: sprint.startDate && sprint.endDate 
        ? Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24))
        : null
    };
  },

  // Validate sprint data
  validateSprintData: (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Sprint name is required';
    } else if (data.name.length > 255) {
      errors.name = 'Sprint name must be less than 255 characters';
    }

    if (data.goal && data.goal.length > 1000) {
      errors.goal = 'Sprint goal must be less than 1000 characters';
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate >= endDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    if (data.capacityStoryPoints && (data.capacityStoryPoints < 0 || data.capacityStoryPoints > 1000)) {
      errors.capacityStoryPoints = 'Capacity must be between 0 and 1000 story points';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Get sprint status color
  getSprintStatusColor: (status) => {
    const statusColors = {
      'Planning': 'bg-gray-100 text-gray-800',
      'Active': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  // Generate burndown chart data
  generateBurndownData: (sprint, issues = []) => {
    if (!sprint.startDate || !sprint.endDate) {
      return { labels: [], idealLine: [], actualLine: [] };
    }

    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const sprintIssues = issues.filter(issue => issue.sprintId === sprint.id);
    const totalStoryPoints = sprintIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

    const labels = [];
    const idealLine = [];
    const actualLine = [];

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      
      labels.push(currentDate.toLocaleDateString());
      
      // Ideal burndown (linear)
      const idealRemaining = totalStoryPoints * (1 - (day / totalDays));
      idealLine.push(Math.max(0, idealRemaining));
      
      // Actual burndown (would need real completion data)
      // This is a placeholder - in real implementation, you'd track daily completions
      actualLine.push(totalStoryPoints); // Placeholder
    }

    return { labels, idealLine, actualLine };
  }
};
