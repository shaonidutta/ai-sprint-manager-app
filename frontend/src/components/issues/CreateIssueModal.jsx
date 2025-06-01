import React, { useState } from 'react';
import { Card, Button, Input, Select, TextArea } from '../common';
import { api } from '../../api';

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
        ...formData,
        story_points: formData.story_points ? parseInt(formData.story_points) : null,
        original_estimate: formData.original_estimate ? parseInt(formData.original_estimate) : null
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Create Issue</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Issue Type
                </label>
                <Select
                  id="issue_type"
                  name="issue_type"
                  value={formData.issue_type}
                  onChange={handleChange}
                  options={issueTypes}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Priority
                </label>
                <Select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={priorities}
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter issue title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue..."
                rows={4}
              />
            </div>

            {/* Story Points and Estimate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Story Points
                </label>
                <Select
                  id="story_points"
                  name="story_points"
                  value={formData.story_points}
                  onChange={handleChange}
                  options={storyPoints}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateIssueModal;
