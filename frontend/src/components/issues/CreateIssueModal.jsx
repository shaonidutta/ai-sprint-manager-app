import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, TextArea, Avatar, Modal } from '../common';
import { CloseIcon } from '../common/Icons';
import { api } from '../../api';

// Issue Type Icons
const IssueTypeIcon = ({ type, className = "w-5 h-5" }) => {
  const icons = {
    Story: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    Bug: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 12h-4v-2h4m2 6h-8v-2h8m.5-5H18V7h-1.5V5.5H15V4h-1.5V2.5h-3V4H9v1.5H7.5V7H6v2h1.5v1.5h11V9z"/>
      </svg>
    ),
    Task: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    ),
    Epic: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    )
  };

  return icons[type] || icons.Task;
};

// Priority Icons
const PriorityIcon = ({ priority, className = "w-4 h-4" }) => {
  const colors = {
    P1: "text-red-500",
    P2: "text-orange-500",
    P3: "text-yellow-500",
    P4: "text-green-500"
  };

  return (
    <svg className={`${className} ${colors[priority] || colors.P3}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
};

const CreateIssueModal = ({ isOpen, onClose, boardId, onIssueCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issue_type: 'Task',
    priority: 'P3',
    status: 'To Do',
    story_points: '',
    assignee_id: '',
    original_estimate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  const issueTypes = [
    { value: 'Story', label: 'Story', color: 'bg-blue-100 text-blue-800' },
    { value: 'Bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
    { value: 'Task', label: 'Task', color: 'bg-green-100 text-green-800' },
    { value: 'Epic', label: 'Epic', color: 'bg-purple-100 text-purple-800' }
  ];

  const priorities = [
    { value: 'P1', label: 'P1 - Critical', color: 'bg-red-100 text-red-800' },
    { value: 'P2', label: 'P2 - High', color: 'bg-orange-100 text-orange-800' },
    { value: 'P3', label: 'P3 - Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'P4', label: 'P4 - Low', color: 'bg-green-100 text-green-800' }
  ];

  const storyPoints = [
    { value: '', label: 'No estimate' },
    { value: '1', label: '1 point' },
    { value: '2', label: '2 points' },
    { value: '3', label: '3 points' },
    { value: '5', label: '5 points' },
    { value: '8', label: '8 points' },
    { value: '13', label: '13 points' },
    { value: '21', label: '21 points' }
  ];

  // Fetch team members when modal opens
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!isOpen || !boardId) return;

      try {
        setLoadingTeamMembers(true);
        // First get the board to find the project ID
        const boardResponse = await api.boards.getById(boardId);
        const projectId = boardResponse.data.data.board.project_id;

        // Then get team members for the project
        const teamResponse = await api.projects.getTeamMembers(projectId);
        const teamMembersData = teamResponse?.data?.data?.team_members;

        // Ensure we have valid team members data
        if (Array.isArray(teamMembersData)) {
          console.log('✅ Team members loaded:', teamMembersData);
          setTeamMembers(teamMembersData);
        } else {
          console.warn('Invalid team members data received:', teamMembersData);
          setTeamMembers([]);
        }
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        setTeamMembers([]);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    fetchTeamMembers();
  }, [isOpen, boardId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.issues.create(boardId, {
        title: formData.title,
        description: formData.description,
        issueType: formData.issue_type,
        priority: formData.priority,
        status: formData.status,
        assigneeId: formData.assignee_id ? parseInt(formData.assignee_id) : null,
        storyPoints: formData.story_points ? parseInt(formData.story_points) : null,
        originalEstimate: formData.original_estimate ? parseInt(formData.original_estimate) : null
      });

      if (response.data.success) {
        onIssueCreated(response.data.data.issue);
        onClose();
        setFormData({
          title: '',
          description: '',
          issue_type: 'Task',
          priority: 'P3',
          status: 'To Do',
          story_points: '',
          assignee_id: '',
          original_estimate: ''
        });
      }
    } catch (err) {
      console.error('Failed to create issue:', err);
      setError(err.response?.data?.message || 'Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Issue"
      size="large"
      className="animate-slideUp"
    >
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fadeIn">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">{/* Increased spacing for better readability */}

          {/* Issue Type Selection - Enhanced with Visual Cards */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-800 mb-3">
              Issue Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {issueTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, issue_type: type.value }))}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-150 hover:shadow-md
                    ${formData.issue_type === type.value
                      ? `${type.color} border-current shadow-sm`
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`${formData.issue_type === type.value ? 'text-current' : 'text-neutral-400'}`}>
                      <IssueTypeIcon type={type.value} className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${formData.issue_type === type.value ? 'text-current' : 'text-neutral-700'}`}>
                      {type.label}
                    </span>
                  </div>
                  {formData.issue_type === type.value && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-current" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection - Enhanced with Visual Indicators */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-800 mb-3">
              Priority *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-150 hover:shadow-md
                    ${formData.priority === priority.value
                      ? 'bg-neutral-50 border-neutral-400 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <PriorityIcon priority={priority.value} className="w-4 h-4" />
                    <span className={`text-sm font-medium ${formData.priority === priority.value ? 'text-neutral-800' : 'text-neutral-600'}`}>
                      {priority.label}
                    </span>
                  </div>
                  {formData.priority === priority.value && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title Field - Enhanced */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-neutral-800">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a clear, descriptive title for this issue"
              required
              className="text-base py-3 px-4 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
            />
            <p className="text-xs text-neutral-500">
              Be specific and descriptive to help team members understand the issue quickly
            </p>
          </div>

          {/* Description Field - Enhanced */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-neutral-800">
              Description
            </label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue, including steps to reproduce, expected behavior, and any relevant context..."
              rows={5}
              className="text-base py-3 px-4 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150 resize-none"
            />
            <p className="text-xs text-neutral-500">
              Include acceptance criteria, technical details, or any other relevant information
            </p>
          </div>

          {/* Assignee Selection - Enhanced with Avatars */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-800">
              Assignee
            </label>

            {loadingTeamMembers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-sm text-neutral-500">Loading team members...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Unassigned Option */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, assignee_id: '' }))}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-150 hover:shadow-sm
                    ${formData.assignee_id === ''
                      ? 'bg-neutral-50 border-neutral-400 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${formData.assignee_id === '' ? 'text-neutral-800' : 'text-neutral-600'}`}>
                    Unassigned
                  </span>
                  {formData.assignee_id === '' && (
                    <div className="ml-auto">
                      <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Team Members */}
                {teamMembers
                  .filter(member => member && member.id != null)
                  .map(member => {
                    const memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email || 'Unknown User';
                    const isSelected = formData.assignee_id === member.id.toString();

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, assignee_id: member.id.toString() }))}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-150 hover:shadow-sm
                          ${isSelected
                            ? 'bg-primary-50 border-primary-300 shadow-sm'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }
                        `}
                      >
                        <Avatar
                          alt={memberName}
                          fallbackText={memberName}
                          size="small"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${isSelected ? 'text-primary-800' : 'text-neutral-700'}`}>
                            {memberName}
                          </p>
                          {member.email && (
                            <p className={`text-xs ${isSelected ? 'text-primary-600' : 'text-neutral-500'}`}>
                              {member.email}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Story Points and Estimate - Enhanced Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="story_points" className="block text-sm font-semibold text-neutral-800">
                Story Points
              </label>
              <Select
                id="story_points"
                name="story_points"
                value={formData.story_points}
                onChange={handleChange}
                options={storyPoints}
                className="text-base py-3 px-4 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
              />
              <p className="text-xs text-neutral-500">
                Estimate the relative effort required for this issue
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="original_estimate" className="block text-sm font-semibold text-neutral-800">
                Original Estimate (hours)
              </label>
              <Input
                id="original_estimate"
                name="original_estimate"
                type="number"
                value={formData.original_estimate}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.5"
                className="text-base py-3 px-4 border-2 border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
              />
              <p className="text-xs text-neutral-500">
                Time estimate in hours (optional)
              </p>
            </div>
          </div>
        </form>

        {/* Form Actions - Enhanced with Better Styling */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-neutral-200 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 text-base font-medium border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-150 focus:ring-2 focus:ring-neutral-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim()}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-150 focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Issue
              </>
            )}
          </Button>
        </div>
    </Modal>
  );
};

export default CreateIssueModal;
