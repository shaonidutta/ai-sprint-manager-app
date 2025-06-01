import React, { useState } from 'react';
import { Card, Button, Input, TextArea } from '../common';
import { api } from '../../api';

const CreateBoardModal = ({ isOpen, onClose, projectId, onBoardCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Board name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.boards.create(projectId, {
        name: formData.name.trim(),
        description: formData.description.trim() || null
      });

      if (response.data.success) {
        onBoardCreated(response.data.data.board);
        onClose();
        setFormData({
          name: '',
          description: ''
        });
      }
    } catch (err) {
      console.error('Failed to create board:', err);
      setError(err.response?.data?.message || 'Failed to create board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({
        name: '',
        description: ''
      });
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Create Board</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Board Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Board Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter board name"
                required
                disabled={loading}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your board..."
                rows={3}
                disabled={loading}
                maxLength={500}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? 'Creating...' : 'Create Board'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateBoardModal;
