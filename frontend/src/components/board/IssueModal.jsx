import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Select, Badge, Avatar, Tooltip } from '../common';

const IssueModal = ({
  issue,
  isOpen,
  onClose,
  onSave,
  users,
  isLoading = false,
  error = null,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    type: issue?.type || 'task',
    status: issue?.status || 'To Do',
    priority: issue?.priority || 'P3',
    assigneeId: issue?.assignee?.id || '',
    storyPoints: issue?.storyPoints || '',
    dueDate: issue?.dueDate || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      ...issue,
      ...formData,
      assignee: users.find(u => u.id === formData.assigneeId),
    });
    setEditMode(false);
  };

  const typeOptions = [
    { value: 'task', label: '✨ Task' },
    { value: 'bug', label: '🐛 Bug' },
    { value: 'story', label: '📖 Story' },
    { value: 'epic', label: '🚀 Epic' },
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
    { value: 'Blocked', label: 'Blocked' },
  ];

  const priorityOptions = [
    { value: 'P1', label: 'P1 - Highest' },
    { value: 'P2', label: 'P2 - High' },
    { value: 'P3', label: 'P3 - Medium' },
    { value: 'P4', label: 'P4 - Low' },
  ];

  const renderViewMode = () => (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {issue.type === 'bug' ? '🐛' : '✨'}
          </span>
          <div>
            <div className="text-sm text-gray-500">{issue.key}</div>
            <h2 className="text-xl font-semibold text-gray-900">
              {issue.title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Edit
        </button>
      </div>

      {/* Meta Information */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <Badge
            variant={`status-${issue.status.toLowerCase().replace(' ', '-')}`}
          >
            {issue.status}
          </Badge>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Priority</div>
          <Badge variant={`priority-${issue.priority.toLowerCase()}`}>
            {issue.priority}
          </Badge>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Assignee</div>
          {issue.assignee ? (
            <div className="flex items-center space-x-2">
              <Avatar
                src={issue.assignee.avatar}
                alt={issue.assignee.name}
                size="small"
              />
              <span className="text-sm text-gray-900">
                {issue.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Unassigned</span>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
          <span className="text-sm text-gray-900">
            {issue.dueDate
              ? new Date(issue.dueDate).toLocaleDateString()
              : 'No due date'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
        <div className="prose prose-sm max-w-none">
          {issue.description || 'No description provided.'}
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="text-sm font-medium text-gray-500 mb-2">Activity</div>
        {issue.comments > 0 ? (
          <div className="space-y-4">
            {/* Placeholder for comments */}
            <div className="text-sm text-gray-500">
              {issue.comments} comments
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No activity yet</div>
        )}
      </div>
    </>
  );

  const renderEditMode = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="space-y-4">
        {/* Title */}
        <Input
          id="title"
          name="title"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          required
          fullWidth
        />

        {/* Type and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="type"
            name="type"
            label="Type"
            value={formData.type}
            onChange={handleInputChange}
            options={typeOptions}
            required
          />
          <Select
            id="priority"
            name="priority"
            label="Priority"
            value={formData.priority}
            onChange={handleInputChange}
            options={priorityOptions}
            required
          />
        </div>

        {/* Status and Assignee */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="status"
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
            required
          />
          <Select
            id="assigneeId"
            name="assigneeId"
            label="Assignee"
            value={formData.assigneeId}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Unassigned' },
              ...users
                .filter(user => user && user.id != null)
                .map(user => ({
                  value: user.id,
                  label: user.name || user.email || 'Unknown User',
                })),
            ]}
          />
        </div>

        {/* Story Points and Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="storyPoints"
            name="storyPoints"
            type="number"
            label="Story Points"
            value={formData.storyPoints}
            onChange={handleInputChange}
            min={0}
          />
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            label="Due Date"
            value={formData.dueDate}
            onChange={handleInputChange}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMode ? 'Edit Issue' : 'Issue Details'}
      size="large"
      footer={
        <div className="flex justify-end space-x-3">
          {editMode ? (
            <>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          )}
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      {editMode ? renderEditMode() : renderViewMode()}
    </Modal>
  );
};

IssueModal.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string,
    assignee: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }),
    storyPoints: PropTypes.number,
    dueDate: PropTypes.string,
    comments: PropTypes.number,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default IssueModal; 