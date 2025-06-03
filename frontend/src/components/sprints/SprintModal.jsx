import React, { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea } from '../common';
import { api } from '../../api';

const SprintModal = ({ isOpen, onClose, projectId, activeSprint, onSprintUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    scope_threshold_pct: 0.10 // Default for new sprints
  });
  const [thresholdPctUI, setThresholdPctUI] = useState(10); // Integer percentage for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('create'); // 'create', 'start', 'complete', 'plan'
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [sprintIssues, setSprintIssues] = useState([]);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'planning'

  useEffect(() => {
    if (isOpen) {
      if (activeSprint) {
        setMode('manage');
        setFormData({
          name: activeSprint.name || '',
          goal: activeSprint.goal || '',
          start_date: activeSprint.start_date ? activeSprint.start_date.split('T')[0] : '',
          end_date: activeSprint.end_date ? activeSprint.end_date.split('T')[0] : '',
          scope_threshold_pct: activeSprint.scope_threshold_pct !== undefined ? activeSprint.scope_threshold_pct : 0.10
        });
        setThresholdPctUI(activeSprint.scope_threshold_pct !== undefined ? parseFloat(activeSprint.scope_threshold_pct) * 100 : 10);
      } else {
        setMode('create');
        setFormData({
          name: '',
          goal: '',
          start_date: '',
          end_date: '',
          scope_threshold_pct: 0.10 // Default for new
        });
        setThresholdPctUI(10); // Default for new
      }
      setError(null);

      // Fetch issues for sprint planning
      if (projectId) {
        fetchBacklogIssues();
        if (activeSprint) {
          fetchSprintIssues();
        }
      }
    }
  }, [isOpen, activeSprint, projectId]);

  const fetchBacklogIssues = async () => {
    try {
      const response = await api.issues.getBacklog(projectId);
      setBacklogIssues(response.data.data.issues || []);
    } catch (err) {
      console.error('Failed to fetch backlog issues:', err);
    }
  };

  const fetchSprintIssues = async () => {
    if (!activeSprint) return;

    try {
      const response = await api.issues.getBySprint(activeSprint.id);
      setSprintIssues(response.data.data.issues || []);
    } catch (err) {
      console.error('Failed to fetch sprint issues:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'thresholdPctUI') {
      const newThresholdUI = parseInt(value, 10);
      if (!isNaN(newThresholdUI) && newThresholdUI >= 0 && newThresholdUI <= 100) {
        setThresholdPctUI(newThresholdUI);
        setFormData(prev => ({
          ...prev,
          scope_threshold_pct: newThresholdUI / 100
        }));
      } else if (value === '') { // Allow clearing the input
        setThresholdPctUI('');
         setFormData(prev => ({
          ...prev,
          scope_threshold_pct: 0 // Or some other default if empty means 0
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIssueSelect = (issue) => {
    setSelectedIssues(prev => {
      const isSelected = prev.find(i => i.id === issue.id);
      if (isSelected) {
        return prev.filter(i => i.id !== issue.id);
      } else {
        return [...prev, issue];
      }
    });
  };

  const addIssuesToSprint = async () => {
    if (selectedIssues.length === 0 || !activeSprint) return;

    try {
      setLoading(true);
      const issueIds = selectedIssues.map(issue => issue.id);
      await api.sprints.addIssues(activeSprint.id, { issueIds });

      // Refresh data
      fetchBacklogIssues();
      fetchSprintIssues();
      setSelectedIssues([]);
    } catch (err) {
      console.error('Failed to add issues to sprint:', err);
      setError('Failed to add issues to sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeIssueFromSprint = async (issueId) => {
    if (!activeSprint) return;

    try {
      await api.sprints.removeIssue(activeSprint.id, issueId);

      // Refresh data
      fetchBacklogIssues();
      fetchSprintIssues();
    } catch (err) {
      console.error('Failed to remove issue from sprint:', err);
      setError('Failed to remove issue from sprint. Please try again.');
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.sprints.create(projectId, {
        name: formData.name.trim(),
        goal: formData.goal.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        scope_threshold_pct: parseFloat(formData.scope_threshold_pct) // Ensure it's a number
      });

      if (response.data.success) {
        onSprintUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
      setError(err.response?.data?.message || 'Failed to create sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async () => {
    if (!activeSprint) return;

    try {
      setLoading(true);
      setError(null);
      
      // When starting, we might also want to update details if they were changed in "manage" mode
      // The backend start endpoint currently doesn't take these, but if it did:
      // await api.sprints.update(activeSprint.id, {
      //   name: formData.name,
      //   goal: formData.goal,
      //   start_date: formData.start_date,
      //   end_date: formData.end_date,
      //   scope_threshold_pct: parseFloat(formData.scope_threshold_pct)
      // });

      const response = await api.sprints.start(activeSprint.id); // start endpoint doesn't take payload per plan

      if (response.data.success) {
        onSprintUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to start sprint:', err);
      setError(err.response?.data?.message || 'Failed to start sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for updating sprint details (used in manage mode)
  const handleUpdateSprintDetails = async (e) => {
    e.preventDefault();
    if (!activeSprint || !formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        name: formData.name.trim(),
        goal: formData.goal.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        scope_threshold_pct: parseFloat(formData.scope_threshold_pct)
      };
      
      const response = await api.sprints.update(activeSprint.id, payload);

      if (response.data.success) {
        onSprintUpdated();
        // Potentially keep modal open or close based on UX preference
        // onClose();
        alert('Sprint details updated!'); // Or use a toast
      }
    } catch (err) {
      console.error('Failed to update sprint details:', err);
      setError(err.response?.data?.message || 'Failed to update sprint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.sprints.complete(activeSprint.id);

      if (response.data.success) {
        onSprintUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to complete sprint:', err);
      setError(err.response?.data?.message || 'Failed to complete sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({
        name: '',
        goal: '',
        start_date: '',
        end_date: '',
        scope_threshold_pct: 0.10
      });
      setThresholdPctUI(10);
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {mode === 'create' ? 'Create Sprint' : 'Manage Sprint'}
            </h2>
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

          {mode === 'create' ? (
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sprint Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter sprint name"
                  required
                  disabled={loading}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sprint Goal (Optional)
                </label>
                <TextArea
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="What is the goal of this sprint?"
                  rows={3}
                  disabled={loading}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    End Date
                  </label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="thresholdPctUI" className="block text-sm font-medium text-neutral-700 mb-2">
                  Scope-Creep Threshold (%)
                </label>
                <Input
                  id="thresholdPctUI"
                  name="thresholdPctUI"
                  type="number"
                  value={thresholdPctUI}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 10 for 10%"
                  disabled={loading}
                />
              </div>

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
                  {loading ? 'Creating...' : 'Create Sprint'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdateSprintDetails} className="space-y-4">
              {/* Fields for managing an existing sprint - name, goal, dates, threshold */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Sprint Name *</label>
                <Input name="name" value={formData.name} onChange={handleChange} required disabled={loading || activeSprint?.status !== 'Planning'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Sprint Goal</label>
                <TextArea name="goal" value={formData.goal} onChange={handleChange} rows={2} disabled={loading || activeSprint?.status !== 'Planning'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                  <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} disabled={loading || activeSprint?.status !== 'Planning'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                  <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} disabled={loading || activeSprint?.status !== 'Planning'} />
                </div>
              </div>
               <div>
                <label htmlFor="thresholdPctUI" className="block text-sm font-medium text-neutral-700 mb-2">
                  Scope-Creep Threshold (%)
                </label>
                <Input
                  id="thresholdPctUI"
                  name="thresholdPctUI"
                  type="number"
                  value={thresholdPctUI}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 10 for 10%"
                  disabled={loading || activeSprint?.status !== 'Planning'}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {activeSprint?.status === 'Planning' && (
                     <Button type="submit" disabled={loading || !formData.name?.trim()}>
                       {loading ? 'Saving...' : 'Save Changes'}
                     </Button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                    Close
                  </Button>
                  {activeSprint?.status === 'Active' && (
                    <Button onClick={handleCompleteSprint} disabled={loading} variant="danger">
                      {loading ? 'Completing...' : 'Complete Sprint'}
                    </Button>
                  )}
                  {activeSprint?.status === 'Planning' && (
                    <Button onClick={handleStartSprint} disabled={loading}>
                      {loading ? 'Starting...' : 'Start Sprint'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SprintModal;
