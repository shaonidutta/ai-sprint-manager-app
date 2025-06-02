import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, Badge } from '../common';
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

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    issue_type: '',
    story_points: '',
    assignee_id: ''
  });

  // Fetch issue details
  const fetchIssue = async () => {
    if (!issueId) return;

    try {
      setLoading(true);
      console.log('🔍 Fetching issue details for ID:', issueId);
      console.log('🔍 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      const response = await api.issues.getById(issueId);
      const issueData = response.data.data.issue;
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
        assignee_id: issueData.assignee_id || ''
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
      setTimeLogs(response.data.data.timeLogs || []);
    } catch (err) {
      console.error('Failed to fetch time logs:', err);
    }
  };

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssue();
      fetchComments();
      fetchTimeLogs();
    }
  }, [isOpen, issueId]);

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
        hours: parseFloat(timeLog.hours),
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
    return timeLogs.reduce((total, log) => total + (log.hours || 0), 0);
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
                    <div className="space-y-4">
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
                      <div className="flex space-x-3">
                        <Button onClick={handleSaveEdit} disabled={loading}>
                          {loading ? 'Saving...' : 'Save'}
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
                                <span className="font-medium">{log.hours}h</span>
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
