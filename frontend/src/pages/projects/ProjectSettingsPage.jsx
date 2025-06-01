import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { api } from '../../api';

const ProjectSettingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getById(id);
      const projectData = response.data.data.project;
      setProject(projectData);
      setFormData({
        name: projectData.name || '',
        description: projectData.description || ''
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.projects.update(id, formData);
      setProject(prev => ({ ...prev, ...formData }));
      setError(null);
      // Show success message or redirect
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.projects.delete(id);
      navigate('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="h-20 bg-neutral-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Project not found</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
              <Button onClick={fetchProject}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/projects" className="text-neutral-500 hover:text-neutral-700">
              Projects
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link to={`/projects/${id}`} className="text-neutral-500 hover:text-neutral-700">
              {project?.name}
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-neutral-900 font-medium">Settings</span>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Project Settings</h1>
          <p className="text-neutral-600">Manage your project configuration and preferences</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
          Back to Project
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-error-200 bg-error-50">
          <p className="text-error-700">{error}</p>
        </Card>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                Project Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label htmlFor="project_key" className="block text-sm font-medium text-neutral-700 mb-1">
                Project Key
              </label>
              <Input
                id="project_key"
                name="project_key"
                type="text"
                value={project?.project_key || ''}
                readOnly
                disabled
                className="font-mono bg-neutral-50 text-neutral-600"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Auto-generated unique identifier for your project (read-only)
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
              disabled={saving}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="p-6 border-error-200">
        <h2 className="text-lg font-medium text-error-900 mb-4">Danger Zone</h2>
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-error-900">Delete Project</h3>
              <p className="text-sm text-error-700 mt-1">
                Once you delete a project, there is no going back. Please be certain.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Delete Project</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete "{project?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={saving}
                disabled={saving}
              >
                Delete Project
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectSettingsPage;
