/**
 * Utility functions for date formatting and manipulation
 * Following Atlassian Design System guidelines
 */

/**
 * Format a date to relative time (e.g., "Updated 2 days ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never updated';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Updated just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `Updated ${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  
  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Updated ${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `Updated ${years} year${years === 1 ? '' : 's'} ago`;
};

/**
 * Format a date to a readable string (e.g., "Jan 15, 2024")
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date to a full readable string (e.g., "January 15, 2024 at 3:30 PM")
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Check if a date is today
 * @param {string|Date} dateString - The date to check
 * @returns {boolean} - True if the date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is within the last week
 * @param {string|Date} dateString - The date to check
 * @returns {boolean} - True if the date is within the last week
 */
export const isWithinLastWeek = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  return diffInDays <= 7;
};
