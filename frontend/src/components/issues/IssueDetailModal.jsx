import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, Badge } from '../common';
import UserDropdown from '../common/UserDropdown';
import { api } from '../../api';

const IssueDetailModal = ({ isOpen, onClose, issueId, onIssueUpdated, onIssueDeleted }) => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [timeLog, setTimeLog] = useState({ hours: '', description: '' });
  const [timeLogs, setTimeLogs] = useState([]);
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

  // Fetch time logs
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

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssue();
      fetchComments();
      fetchTimeLogs();
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

  const getTotalTimeLogged = () => {
    return timeLogs.reduce((total, log) => total + (log.hours_logged || log.hours || 0), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-neutral-900">
                {issue ? `ISSUE-${issue.id}` : 'Issue Details'}
              </h2>
              {issue && (
                <Badge variant={issue.status === 'Done' ? 'success' : issue.status === 'In Progress' ? 'warning' : 'default'}>
                  {issue.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDeleteIssue} disabled={loading}>
                Delete
              </Button>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading && !issue ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
            </div>
          ) : issue ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Issue Details */}
                <div>
                  {isEditing ? (
                    <div className="space-y-6">
                      <Input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        placeholder="Issue title"
                        className="text-lg font-semibold"
                      />
                      <TextArea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        placeholder="Issue description"
                        rows={4}
                      />

                      {/* Assignee Dropdown */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Assignee
                        </label>
                        <UserDropdown
                          value={editForm.assignee_id ? parseInt(editForm.assignee_id) : null}
                          onChange={(userId) => setEditForm(prev => ({ ...prev, assignee_id: userId ? userId.toString() : '' }))}
                          users={teamMembers}
                          placeholder="Select assignee..."
                          includeUnassigned={true}
                          disabled={loadingTeamMembers}
                          className="w-full"
                        />
                      </div>

                      {/* Blocker Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Blocker
                          </label>
                          {editForm.blocked_reason && editForm.blocked_reason.trim() && (
                            <button
                              type="button"
                              onClick={() => setEditForm(prev => ({ ...prev, blocked_reason: '' }))}
                              className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors duration-150"
                            >
                              Clear Blocker
                            </button>
                          )}
                        </div>
                        <TextArea
                          name="blocked_reason"
                          value={editForm.blocked_reason}
                          onChange={handleEditChange}
                          placeholder="Describe what is blocking this issue (leave empty to unblock)..."
                          rows={3}
                          className={`w-full ${editForm.blocked_reason && editForm.blocked_reason.trim() ? 'border-red-300 bg-red-50' : ''}`}
                        />
                        <div className="flex items-start space-x-2">
                          {editForm.blocked_reason && editForm.blocked_reason.trim() ? (
                            <div className="flex items-center space-x-1 text-red-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs font-medium">
                                This issue will be marked as blocked and cannot be moved between columns.
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs font-medium">
                                This issue is not blocked and can be moved freely between columns.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button onClick={handleSaveEdit} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {issue.title}
                      </h3>
                      <p className="text-neutral-600 whitespace-pre-wrap">
                        {issue.description || 'No description provided.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="text-md font-medium text-neutral-900 mb-4">Comments</h4>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-neutral-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-neutral-900">
                            {comment.author_name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-neutral-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-neutral-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                    
                    {/* Add Comment */}
                    <div className="border-t pt-4">
                      <TextArea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                      />
                      <Button 
                        className="mt-2" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Issue Properties */}
                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Type:</span>
                      <Badge variant="outline">{issue.issue_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Priority:</span>
                      <Badge variant={issue.priority === 'P1' ? 'danger' : issue.priority === 'P2' ? 'warning' : 'default'}>
                        {issue.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Story Points:</span>
                      <span>{issue.story_points || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Assignee:</span>
                      <span>{issue.assignee_name || 'Unassigned'}</span>
                    </div>
                    {issue.blocked_reason && (
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Blocker:</span>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                            title="Click to edit and unblock this issue"
                          >
                            Edit to Unblock
                          </button>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <Badge variant="danger" size="sm">Blocked</Badge>
                          </div>
                          <p className="text-xs text-red-700">{issue.blocked_reason}</p>
                          <p className="text-xs text-red-600 mt-1 italic">
                            This issue cannot be moved between columns while blocked.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Created:</span>
                      <span>{formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                </Card>

                {/* Time Tracking */}
                <Card className="p-4">
                  <h4 className="font-medium text-neutral-900 mb-4">Time Tracking</h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-neutral-600">Total logged: </span>
                      <span className="font-medium">{getTotalTimeLogged()}h</span>
                    </div>
                    
                    {/* Log Time */}
                    <div className="space-y-2">
                      <Input
                        type="number"
                        step="0.5"
                        value={timeLog.hours}
                        onChange={(e) => setTimeLog(prev => ({ ...prev, hours: e.target.value }))}
                        placeholder="Hours"
                        size="sm"
                      />
                      <TextArea
                        value={timeLog.description}
                        onChange={(e) => setTimeLog(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Work description"
                        rows={2}
                        size="sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleLogTime}
                        disabled={!timeLog.hours || !timeLog.description.trim()}
                        fullWidth
                      >
                        Log Time
                      </Button>
                    </div>

                    {/* Recent Time Logs */}
                    {timeLogs.length > 0 && (
                      <div className="border-t pt-3">
                        <h5 className="text-xs font-medium text-neutral-700 mb-2">Recent Logs</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {timeLogs.slice(-3).map((log) => (
                            <div key={log.id} className="text-xs">
                              <div className="flex justify-between">
                                <span className="font-medium">{log.hours_logged || log.hours}h</span>
                                <span className="text-neutral-500">
                                  {formatDate(log.created_at)}
                                </span>
                              </div>
                              <p className="text-neutral-600 truncate">
                                {log.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600">Issue not found.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IssueDetailModal;
