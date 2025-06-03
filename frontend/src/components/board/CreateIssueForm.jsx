import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Select } from '../common';

const CreateIssueForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  projectId,
  sprintId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task',
    priority: 'Medium',
    assignee_id: '',
    story_points: '',
    labels: '',
    due_date: '',
    status: 'Backlog'
  });

  const [errors, setErrors] = useState({});

  const issueTypes = [
    { value: 'Epic', label: 'Epic' },
    { value: 'Story', label: 'Story' },
    { value: 'Task', label: 'Task' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Subtask', label: 'Subtask' }
  ];

  const priorities = [
    { value: 'Highest', label: 'Highest' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Lowest', label: 'Lowest' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.story_points && (isNaN(formData.story_points) || formData.story_points < 0)) {
      newErrors.story_points = 'Story points must be a positive number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const issueData = {
      ...formData,
      project_id: projectId,
      sprint_id: sprintId,
      story_points: formData.story_points ? parseInt(formData.story_points) : null,
      labels: formData.labels ? formData.labels.split(',').map(label => label.trim()) : [],
      due_date: formData.due_date || null
    };

    try {
      await onSubmit(issueData);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter issue title"
          error={errors.title}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter issue description"
          rows={4}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.description ? 'border-red-300' : 'border-gray-300'}
          `}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <Select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={issueTypes}
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorities}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="story_points" className="block text-sm font-medium text-gray-700 mb-1">
            Story Points
          </label>
          <Input
            id="story_points"
            name="story_points"
            type="number"
            value={formData.story_points}
            onChange={handleChange}
            placeholder="Enter story points"
            min="0"
            error={errors.story_points}
          />
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="labels" className="block text-sm font-medium text-gray-700 mb-1">
          Labels
        </label>
        <Input
          id="labels"
          name="labels"
          value={formData.labels}
          onChange={handleChange}
          placeholder="Enter labels separated by commas"
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate multiple labels with commas (e.g., frontend, urgent, bug)
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Issue'}
        </Button>
      </div>
    </form>
  );
};

CreateIssueForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sprintId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default CreateIssueForm;