import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Select, Badge } from '../common';
import UserDropdown from '../common/UserDropdown';
import { api } from '../../api';

const IssueDetailModal = ({ isOpen, onClose, issueId, onIssueUpdated, onIssueDeleted }) => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

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

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssue();
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
      setError(null);

      // Validate required fields
      if (!editForm.title?.trim()) {
        throw new Error('Title is required');
      }

      // Prepare update data
      const updateData = {
        title: editForm.title.trim(),
        description: editForm.description?.trim() || '',
        issue_type: editForm.issue_type,
        status: editForm.status,
        priority: editForm.priority,
        // Convert story_points to number if present
        story_points: editForm.story_points ? parseInt(editForm.story_points) : null,
        // Convert assignee_id to number if present
        assignee_id: editForm.assignee_id ? parseInt(editForm.assignee_id) : null
      };

      const response = await api.issues.update(issueId, updateData);

      if (response.data.success) {
        const updatedIssue = response.data.data.issue;
        setIssue(updatedIssue);
        
        // Update the edit form with the new values
        setEditForm(prev => ({
          ...prev
        }));
        
        // Notify parent component
        if (onIssueUpdated) {
          onIssueUpdated(updatedIssue);
        }

        // Close the modal after successful save
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update issue');
      }
    } catch (err) {
      console.error('Failed to update issue:', err);
      setError(err.message || err.response?.data?.message || 'Failed to update issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.issues.delete(issueId);
      if (onIssueDeleted) {
        onIssueDeleted(issueId);
      }
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
                    </div>
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
                          id="description"
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
                          onClick={onClose}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 font-medium transition-all duration-150"
                        >
                          ❌ Cancel
                        </Button>
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
                        <Badge variant="primary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {issue.issue_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Priority</span>
                        <Badge
                          variant={issue.priority === 'P1' ? 'error' : issue.priority === 'P2' ? 'warning' : 'default'}
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

                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-600">Created</span>
                        <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(issue.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
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
