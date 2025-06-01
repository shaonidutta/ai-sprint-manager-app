import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { api } from '../../api';

const BoardsListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const [boards, setBoards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll({ limit: 100 });
      setProjects(response.data.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  // Fetch boards for selected project
  const fetchBoards = async (projectId) => {
    if (!projectId) {
      setBoards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.boards.getAll(projectId);
      const boardsData = response.data.data.boards || [];
      // Filter out any undefined or invalid board objects
      const validBoards = boardsData.filter(board => board && board.id && board.name);
      setBoards(validBoards);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('Failed to load boards. Please try again.');
      setBoards([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchBoards(selectedProject);
    } else {
      setBoards([]);
      setLoading(false);
    }
  }, [selectedProject]);

  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProject(newProjectId);

    // Update URL params
    if (newProjectId) {
      navigate(`/boards?project=${newProjectId}`, { replace: true });
    } else {
      navigate('/boards', { replace: true });
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/boards/${boardId}`);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setCreating(true);
      const response = await api.boards.create(selectedProject, createFormData);
      const newBoard = response.data.data.board;
      setBoards(prev => [newBoard, ...prev]);
      setShowCreateModal(false);
      setCreateFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getBoardInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBoards = boards.filter(board => {
    // First check if board is valid
    if (!board || !board.name) return false;

    return board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Boards</h1>
          <p className="text-neutral-600">Manage your project boards and workflows</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!selectedProject}
        >
          Create Board
        </Button>
      </div>

      {/* Project Selection and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="project" className="block text-sm font-medium text-neutral-700 mb-1">
              Select Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={handleProjectChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.project_key})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">
                Search Boards
              </label>
              <Input
                id="search"
                name="search"
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Project Info */}
      {selectedProjectData && (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 text-white rounded-md flex items-center justify-center font-medium">
              {selectedProjectData.project_key}
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">{selectedProjectData.name}</h3>
              {selectedProjectData.description && (
                <p className="text-sm text-neutral-600">{selectedProjectData.description}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-error-200 bg-error-50">
          <p className="text-error-700">{error}</p>
        </Card>
      )}

      {/* Boards Grid */}
      {!selectedProject ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Select a project</h3>
            <p className="text-neutral-600">Choose a project from the dropdown above to view its boards.</p>
          </div>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-neutral-200 rounded"></div>
                <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredBoards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No boards found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm ? 'No boards match your search criteria.' : 'Get started by creating your first board.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Board
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoards.map((board) => (
            <Card
              key={board.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleBoardClick(board.id)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center font-medium">
                  {getBoardInitials(board.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-neutral-900 truncate">
                    {board.name}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Board
                  </p>
                </div>
              </div>

              {board.description && (
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {board.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>Updated {formatDate(board.updated_at)}</span>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  <span>Kanban</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Create New Board</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label htmlFor="boardName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Board Name
                </label>
                <Input
                  id="boardName"
                  name="boardName"
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter board name"
                  required
                />
              </div>

              <div>
                <label htmlFor="boardDescription" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="boardDescription"
                  rows={3}
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your board..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={creating}
                  disabled={creating}
                >
                  Create Board
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BoardsListPage;