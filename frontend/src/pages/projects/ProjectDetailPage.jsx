import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from '../../components/common';
import { CreateBoardModal } from '../../components/boards';
import { api } from '../../api';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [boards, setBoards] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.projects.getById(id);
      setProject(response.data.data.project);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch project boards (multiple boards per project)
  const fetchBoards = async () => {
    try {
      setBoardLoading(true);
      const response = await api.boards.getAll(id);
      console.log('Boards API response:', response.data);
      const boardsData = response.data.data.boards || [];
      console.log('Boards data:', boardsData);
      // Filter out any undefined or invalid board objects
      const validBoards = boardsData.filter(board => {
        const isValid = board && board.id && board.name;
        if (!isValid) {
          console.warn('Invalid board object:', board);
        }
        return isValid;
      });
      console.log('Valid boards:', validBoards);
      setBoards(validBoards);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setBoards([]); // Set empty array on error
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchBoards();
    }
  }, [id]);

  const handleBoardCreated = (newBoard) => {
    console.log('[ProjectDetailPage] Board created:', newBoard);
    setBoards(prev => [newBoard, ...prev]);
    setShowCreateBoardModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-neutral-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-8 bg-neutral-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-6">
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!project) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium text-neutral-900">Project not found</h3>
        <p className="text-neutral-600 mt-2">The project you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'boards', label: 'Boards' },
    { id: 'team', label: 'Team' },
    { id: 'ai', label: 'AI Features' },
    { id: 'settings', label: 'Settings' }
  ];

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
              <span className="text-neutral-900 font-medium">{project.name}</span>
            </li>
          </ol>
        </nav>

        {/* Project Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              {getProjectInitials(project.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{project.name}</h1>
              <p className="text-neutral-600">{project.project_key}</p>
              {project.description && (
                <p className="text-neutral-600 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => navigate(`/projects/${id}/settings`)}>
              Settings
            </Button>
            {boards.length > 0 && (
              <Button onClick={() => setActiveTab('boards')}>
                View Boards ({boards.length})
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Project Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Created</dt>
                  <dd className="text-sm text-neutral-900">{formatDate(project.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Last Updated</dt>
                  <dd className="text-sm text-neutral-900">{formatDate(project.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Project Key</dt>
                  <dd className="text-sm text-neutral-900 font-mono">{project.project_key}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Total Issues</span>
                  <span className="text-sm font-medium text-neutral-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Active Sprints</span>
                  <span className="text-sm font-medium text-neutral-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500">Team Members</span>
                  <span className="text-sm font-medium text-neutral-900">1</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {boards.length > 0 ? (
                  <Button fullWidth variant="outline" onClick={() => setActiveTab('boards')}>
                    View Boards ({boards.length})
                  </Button>
                ) : (
                  <Button fullWidth variant="outline" onClick={() => setShowCreateBoardModal(true)}>
                    Create First Board
                  </Button>
                )}
                <Button fullWidth variant="outline" onClick={() => navigate(`/projects/${id}/team`)}>
                  Manage Team
                </Button>
                <Button 
                  fullWidth 
                  variant="outline" 
                  onClick={() => setActiveTab('ai')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                >
                  AI Features
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'boards' && (
          <div className="space-y-6">
            {/* Boards Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Project Boards</h2>
              <Button onClick={() => setShowCreateBoardModal(true)}>
                Create Board
              </Button>
            </div>

            {boardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="p-6 animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                  </Card>
                ))}
              </div>
            ) : boards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.filter(board => board && board.id && board.name).map((board) => (
                  <Card
                    key={board.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      console.log('[ProjectDetailPage] Navigating to board:', board.id);
                      navigate(`/boards/${board.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-neutral-900">{board.name}</h3>
                      {board.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {board.description && (
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-neutral-50 rounded">
                        <div className="text-lg font-semibold text-neutral-900">0</div>
                        <div className="text-xs text-neutral-600">To Do</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-lg font-semibold text-neutral-900">0</div>
                        <div className="text-xs text-neutral-600">In Progress</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-semibold text-neutral-900">0</div>
                        <div className="text-xs text-neutral-600">Done</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Boards Found</h3>
                  <p className="text-neutral-600 mb-6">This project doesn't have any boards yet. Create your first board to start managing issues.</p>
                  <Button onClick={() => setShowCreateBoardModal(true)}>
                    Create First Board
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Team Management</h3>
            <p className="text-neutral-600 mb-6">Manage your project team members and permissions.</p>
            <Button onClick={() => navigate(`/projects/${id}/team`)}>
              Manage Team
            </Button>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Project Settings</h3>
            <p className="text-neutral-600 mb-6">Configure your project settings and preferences.</p>
            <Button onClick={() => navigate(`/projects/${id}/settings`)}>
              Open Settings
            </Button>
          </Card>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Features</h2>
              <p className="text-gray-600">
                Enhance your project management with our AI-powered features
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sprint Planning Assistant */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">📅</span>
                    <button
                      onClick={() => navigate(`/ai/sprint-planning/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Try Now
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    Sprint Planning Assistant
                  </h3>
                  <p className="text-white text-opacity-90 mt-2">
                    AI-powered sprint planning suggestions based on team velocity, capacity, and historical data.
                  </p>
                </div>
              </div>

              {/* Scope Creep Detection */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">🔍</span>
                    <button
                      onClick={() => navigate(`/ai/scope-creep/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Analyze Now
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    Scope Creep Detection
                  </h3>
                  <p className="text-white text-opacity-90 mt-2">
                    Early detection of potential scope creep using AI analysis of requirements and changes.
                  </p>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">⚠️</span>
                    <button
                      onClick={() => navigate(`/ai/risk-assessment/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Assess Risks
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    Risk Assessment
                  </h3>
                  <p className="text-white text-opacity-90 mt-2">
                    AI-driven project risk assessment and mitigation recommendations.
                  </p>
                </div>
              </div>

              {/* Sprint Retrospective */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">🎯</span>
                    <button
                      onClick={() => navigate(`/ai/retrospective/${id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Generate Insights
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    Sprint Retrospective Insights
                  </h3>
                  <p className="text-white text-opacity-90 mt-2">
                    AI analysis of sprint performance and team collaboration patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Dashboard Link */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mt-6">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">AI Features Dashboard</h3>
                    <p className="text-gray-600 mt-2">View all AI insights and analytics in one place</p>
                  </div>
                  <button
                    onClick={() => navigate(`/ai/dashboard/${id}`)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200"
                  >
                    Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Board Modal */}
        <CreateBoardModal
          isOpen={showCreateBoardModal}
          onClose={() => setShowCreateBoardModal(false)}
          projectId={id}
          onBoardCreated={handleBoardCreated}
        />
    </div>
  );
};

export default ProjectDetailPage;
