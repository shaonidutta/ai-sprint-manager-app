import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, Badge } from '../common';
import UserDropdown from '../common/UserDropdown';
import { api } from '../../api';

const IssueDetailModal = ({ isOpen, onClose, issueId, onIssueUpdated, onIssueDeleted }) => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  // TODO: Time tracking state - implement later
  // const [timeLog, setTimeLog] = useState({ hours: '', description: '' });
  // const [timeLogs, setTimeLogs] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    issue_type: '',
    story_points: '',
    assignee_id: '',
    blocked_reason: ''
  });

  // Fetch issue details
  const fetchIssue = async () => {
    if (!issueId) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching issue details for ID:', issueId);
      const response = await api.issues.getById(issueId);

      // Handle nested API response structure: {success: true, data: {message: "", data: {issue: {...}}}}
      let issueData;
      if (response.data?.data?.data?.issue) {
        // Nested structure
        issueData = response.data.data.data.issue;
      } else if (response.data?.data?.issue) {
        // Direct structure
        issueData = response.data.data.issue;
      } else if (response.data?.issue) {
        // Simple structure
        issueData = response.data.issue;
      } else {
        throw new Error('Invalid API response structure');
      }

      console.log('✅ Issue data received:', issueData);
      setIssue(issueData);

      // Initialize edit form
      setEditForm({
        title: issueData.title || '',
        description: issueData.description || '',
        status: issueData.status || '',
        priority: issueData.priority || '',
        issue_type: issueData.issue_type || '',
        story_points: issueData.story_points || '',
        assignee_id: issueData.assignee_id || '',
        blocked_reason: issueData.blocked_reason || ''
      });
      
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch issue:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError('Failed to load issue details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members for assignee dropdown
  const fetchTeamMembers = async () => {
    if (!issue?.board?.projectId) return;

    try {
      setLoadingTeamMembers(true);
      const response = await api.projects.getTeamMembers(issue.board.projectId);
      const teamMembersData = response?.data?.data?.team_members;

      if (Array.isArray(teamMembersData)) {
        setTeamMembers(teamMembersData);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setTeamMembers([]);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    if (!issueId) return;
    
    try {
      const response = await api.issues.comments.getAll(issueId);
      setComments(response.data.data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // TODO: Fetch time logs - implement later
  /*
  const fetchTimeLogs = async () => {
    if (!issueId) return;

    try {
      const response = await api.issues.timeLogs.getAll(issueId);
      // Handle nested API response structure
      let timeLogsData;
      if (response.data?.data?.data?.timeLogs) {
        timeLogsData = response.data.data.data.timeLogs;
      } else if (response.data?.data?.timeLogs) {
        timeLogsData = response.data.data.timeLogs;
      } else if (response.data?.timeLogs) {
        timeLogsData = response.data.timeLogs;
      } else {
        timeLogsData = [];
      }
      setTimeLogs(timeLogsData);
    } catch (err) {
      console.error('Failed to fetch time logs:', err);
      // Don't fail the whole component if time logs fail
      setTimeLogs([]);
    }
  };
  */

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssue();
      fetchComments();
      // fetchTimeLogs(); // TODO: Implement later
    }
  }, [isOpen, issueId]);

  // Fetch team members when issue is loaded
  useEffect(() => {
    if (issue?.board?.projectId) {
      fetchTeamMembers();
    }
  }, [issue?.board?.projectId]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await api.issues.update(issueId, editForm);

      if (response.data.success) {
        const updatedIssue = response.data.data.issue;
        setIssue(updatedIssue);
        setIsEditing(false);
        onIssueUpdated(updatedIssue);

        // Close the modal after successful save
        onClose();
      }
    } catch (err) {
      console.error('Failed to update issue:', err);
      setError('Failed to update issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await api.issues.comments.create(issueId, {
        content: newComment.trim()
      });
      
      if (response.data.success) {
        setComments(prev => [...prev, response.data.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  // TODO: Handle log time - implement later
  /*
  const handleLogTime = async () => {
    if (!timeLog.hours || !timeLog.description.trim()) return;

    try {
      const response = await api.issues.timeLogs.create(issueId, {
        hoursLogged: parseFloat(timeLog.hours), // Use hoursLogged to match backend
        description: timeLog.description.trim()
      });

      if (response.data.success) {
        setTimeLogs(prev => [...prev, response.data.data.timeLog]);
        setTimeLog({ hours: '', description: '' });
      }
    } catch (err) {
      console.error('Failed to log time:', err);
      setError('Failed to log time. Please try again.');
    }
  };
  */

  const handleDeleteIssue = async () => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.issues.delete(issueId);
      onIssueDeleted(issueId);
      onClose();
    } catch (err) {
      console.error('Failed to delete issue:', err);
      setError('Failed to delete issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // TODO: Get total time logged - implement later
  /*
  const getTotalTimeLogged = () => {
    return timeLogs.reduce((total, log) => total + (log.hours_logged || log.hours || 0), 0);
  };
  */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border-0 animate-in slide-in-from-bottom-4 duration-300">
        {/* Enhanced Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {issue && (
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {issue ? (issue.issue_key || `#${issue.id}`) : 'Issue Details'}
                  </h2>
                  {issue && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {issue.issue_type} • Created {formatDate(issue.created_at)}
                    </p>
                  )}
                </div>
              </div>
              {issue && (
                <Badge
                  variant={issue.status === 'Done' ? 'success' : issue.status === 'In Progress' ? 'warning' : 'default'}
                  className="px-3 py-1 text-sm font-medium"
                >
                  {issue.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-150"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteIssue}
                disabled={loading}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-150"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area with scroll */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-6">

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {loading && !issue ? (
              <div className="animate-pulse space-y-6">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ) : issue ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Issue Details */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Issue Details
                      </h3>
                      {isEditing && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            ✏️ Editing Mode
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <Input
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            placeholder="Enter issue title..."
                            className="text-lg font-semibold border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <TextArea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            placeholder="Describe the issue in detail..."
                            rows={5}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        {/* Assignee Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assignee
                          </label>
                          <UserDropdown
                            value={editForm.assignee_id ? parseInt(editForm.assignee_id) : null}
                            onChange={(userId) => setEditForm(prev => ({ ...prev, assignee_id: userId ? userId.toString() : '' }))}
                            users={teamMembers}
                            placeholder="Select assignee..."
                            includeUnassigned={true}
                            disabled={loadingTeamMembers}
                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        {/* Blocker Field */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Blocker Status
                            </label>
                            {editForm.blocked_reason && editForm.blocked_reason.trim() && (
                              <button
                                type="button"
                                onClick={() => setEditForm(prev => ({ ...prev, blocked_reason: '' }))}
                                className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded transition-all duration-150 hover:bg-red-100"
                              >
                                🚫 Clear Blocker
                              </button>
                            )}
                          </div>
                          <TextArea
                            name="blocked_reason"
                            value={editForm.blocked_reason}
                            onChange={handleEditChange}
                            placeholder="Describe what is blocking this issue (leave empty to unblock)..."
                            rows={3}
                            className={`w-full transition-all duration-150 ${
                              editForm.blocked_reason && editForm.blocked_reason.trim()
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            }`}
                          />
                          <div className="mt-3 p-3 rounded-lg border">
                            {editForm.blocked_reason && editForm.blocked_reason.trim() ? (
                              <div className="flex items-start space-x-2 text-red-600 bg-red-50 border-red-200">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">⚠️ Issue will be blocked</p>
                                  <p className="text-xs mt-1">This issue cannot be moved between columns while blocked.</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start space-x-2 text-green-600 bg-green-50 border-green-200">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium">✅ Issue is unblocked</p>
                                  <p className="text-xs mt-1">This issue can be moved freely between columns.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium transition-all duration-150"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </div>
                            ) : (
                              '💾 Save Changes'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 font-medium transition-all duration-150"
                          >
                            ❌ Cancel
                          </Button>
                        </div>
                    </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {issue.title}
                          </h3>
                          <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {issue.description || (
                                <span className="text-gray-400 italic">No description provided.</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                        Comments ({comments.length})
                      </h4>
                    </div>

                    <div className="space-y-6">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {(comment.author_name || 'U').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  {comment.author_name || 'Unknown User'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed pl-10">
                              {comment.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.544-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                          </svg>
                          <p className="text-sm">No comments yet. Be the first to comment!</p>
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="border-t border-gray-200 pt-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Add a comment
                          </label>
                          <TextArea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts, ask questions, or provide updates..."
                            rows={3}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            💬 Add Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

                {/* Enhanced Sidebar */}
                <div className="space-y-6">
                  {/* Issue Properties */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Type</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {issue.issue_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Priority</span>
                        <Badge
                          variant={issue.priority === 'P1' ? 'danger' : issue.priority === 'P2' ? 'warning' : 'default'}
                          className="font-medium"
                        >
                          {issue.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Story Points</span>
                        <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {issue.story_points || 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Assignee</span>
                        <div className="flex items-center space-x-2">
                          {issue.assignee_name ? (
                            <>
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-600">
                                  {issue.assignee_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{issue.assignee_name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 italic">Unassigned</span>
                          )}
                        </div>
                      </div>

                      {/* Blocker Status */}
                      {issue.blocked_reason ? (
                        <div className="py-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded transition-all duration-150 hover:bg-blue-100"
                              title="Click to edit and unblock this issue"
                            >
                              🔓 Edit to Unblock
                            </button>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <Badge variant="danger" size="sm" className="font-medium">🚫 Blocked</Badge>
                            </div>
                            <p className="text-xs text-red-700 mb-2 font-medium">{issue.blocked_reason}</p>
                            <p className="text-xs text-red-600 italic">
                              Cannot be moved between columns while blocked.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium">✅ Unblocked</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Created</span>
                        <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(issue.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TODO: Enhanced Time Tracking - Implement Later */}
                  {/*
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Time Tracking
                    </h4>

                    <div className="space-y-6">
                      {/* Total Time Display */}
                      {/*
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700">Total Time Logged</span>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-lg font-bold text-blue-900">{getTotalTimeLogged()}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Log Time Form */}
                      {/*
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-700">Log Work Time</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              value={timeLog.hours}
                              onChange={(e) => setTimeLog(prev => ({ ...prev, hours: e.target.value }))}
                              placeholder="e.g., 2.5"
                              size="sm"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Work Description</label>
                            <TextArea
                              value={timeLog.description}
                              onChange={(e) => setTimeLog(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe what you worked on..."
                              rows={2}
                              size="sm"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={handleLogTime}
                            disabled={!timeLog.hours || !timeLog.description.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ⏱️ Log Time
                          </Button>
                        </div>
                      </div>

                      {/* Recent Time Logs */}
                      {/*
                      {timeLogs.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h5>
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {timeLogs.slice(-3).map((log) => (
                              <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-blue-600">
                                    {log.hours_logged || log.hours}h
                                  </span>
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                    {formatDate(log.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {log.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  */}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">Issue not found</p>
                <p className="text-gray-500 text-sm mt-1">The requested issue could not be loaded.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IssueDetailModal;
