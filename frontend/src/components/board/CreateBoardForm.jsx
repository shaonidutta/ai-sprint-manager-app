import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Select } from '../common';

const CreateBoardForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'kanban',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Board name must be 100 characters or less';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Board Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        maxLength={100}
        placeholder="Enter board name"
        disabled={isLoading}
      />

      <Input
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        maxLength={500}
        placeholder="Enter board description (optional)"
        multiline
        rows={3}
        disabled={isLoading}
      />

      <Select
        id="type"
        name="type"
        label="Board Type"
        value={formData.type}
        onChange={handleChange}
        disabled={isLoading}
        options={[
          { value: 'kanban', label: 'Kanban Board' },
          { value: 'scrum', label: 'Scrum Board' }
        ]}
      />

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => onSubmit(null)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`
            px-4 py-2 text-sm font-medium text-white rounded-md
            ${isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Board'}
        </button>
      </div>
    </form>
  );
};

CreateBoardForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default CreateBoardForm; 