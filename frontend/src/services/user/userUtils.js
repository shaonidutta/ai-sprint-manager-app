export const userUtils = {
  // Format user data for display
  formatUserData: (user) => {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase(),
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      updatedAt: new Date(user.updatedAt).toLocaleDateString(),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : null
    };
  },

  // Validate user profile data
  validateProfileData: (data) => {
    const errors = {};

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.firstName = 'First name is required';
    } else if (data.firstName.length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required';
    } else if (data.lastName.length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (data.bio && data.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate password change data
  validatePasswordChange: (data) => {
    const errors = {};

    if (!data.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!data.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (data.currentPassword === data.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Generate user avatar URL or initials
  getAvatarDisplay: (user) => {
    if (user.avatarUrl) {
      return {
        type: 'image',
        src: user.avatarUrl,
        alt: `${user.firstName} ${user.lastName}`
      };
    }

    return {
      type: 'initials',
      initials: userUtils.formatUserData(user).initials,
      backgroundColor: userUtils.generateAvatarColor(user.email)
    };
  },

  // Generate consistent avatar background color based on email
  generateAvatarColor: (email) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];

    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  },

  // Format user activity data
  formatActivityData: (activities) => {
    return activities.map(activity => ({
      ...activity,
      createdAt: new Date(activity.createdAt).toLocaleDateString(),
      timeAgo: userUtils.getTimeAgo(activity.createdAt)
    }));
  },

  // Get time ago string
  getTimeAgo: (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return activityDate.toLocaleDateString();
  },

  // Get user role badge color
  getRoleBadgeColor: (role) => {
    const roleColors = {
      'Admin': 'bg-red-100 text-red-800',
      'Project Manager': 'bg-blue-100 text-blue-800',
      'Developer': 'bg-green-100 text-green-800',
      'Viewer': 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  },

  // Check if user is online (based on last activity)
  isUserOnline: (lastActivityAt) => {
    if (!lastActivityAt) return false;
    
    const now = new Date();
    const lastActivity = new Date(lastActivityAt);
    const diffInMinutes = (now - lastActivity) / (1000 * 60);
    
    return diffInMinutes <= 5; // Consider online if active within 5 minutes
  },

  // Format user preferences
  formatPreferences: (preferences) => {
    return {
      theme: preferences.theme || 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'UTC',
      emailNotifications: preferences.emailNotifications !== false,
      pushNotifications: preferences.pushNotifications !== false,
      weekStartsOn: preferences.weekStartsOn || 'monday'
    };
  },

  // Validate file for avatar upload
  validateAvatarFile: (file) => {
    const errors = {};
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      errors.file = 'Please select a file';
      return { isValid: false, errors };
    }

    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      errors.file = 'File size must be less than 5MB';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Search and filter users
  filterUsers: (users, filters) => {
    return users.filter(user => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          return false;
        }
      }

      if (filters.role && user.role !== filters.role) {
        return false;
      }

      if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
        return false;
      }

      return true;
    });
  },

  // Sort users
  sortUsers: (users, sortBy, sortOrder = 'asc') => {
    return [...users].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'fullName') {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastLoginAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
};
