import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { CreateIssueModal } from '../../components/issues';
import { api } from '../../api';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable Issue Card Component
const DraggableIssueCard = ({ issue }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Story':
        return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">S</div>;
      case 'Bug':
        return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">B</div>;
      case 'Task':
        return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">T</div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">?</div>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'text-red-600';
      case 'P2': return 'text-orange-600';
      case 'P3': return 'text-yellow-600';
      case 'P4': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {getIssueTypeIcon(issue.issue_type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {issue.title}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {issue.issue_key || `#${issue.id}`}
            </span>
            <div className="flex items-center space-x-2">
              {issue.story_points && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {issue.story_points} SP
                </span>
              )}
              <span className={`text-xs ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sprint Creation Modal
const SprintModal = ({ isOpen, onClose, boardId, onSprintCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacityStoryPoints: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.sprints.create(boardId, {
        name: formData.name.trim(),
        goal: formData.goal.trim() || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        capacityStoryPoints: formData.capacityStoryPoints ? parseInt(formData.capacityStoryPoints) : null
      });

      if (response.data.success) {
        onSprintCreated(response.data.data.sprint);
        onClose();
        setFormData({
          name: '',
          goal: '',
          startDate: '',
          endDate: '',
          capacityStoryPoints: ''
        });
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
      setError(err.response?.data?.message || 'Failed to create sprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Sprint</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Name *
            </label>
            <Input
              id="sprint-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Sprint 1"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Goal
            </label>
            <Input
              id="sprint-goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="What is the goal of this sprint?"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                id="sprint-start-date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                id="sprint-end-date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Story Points)
            </label>
            <Input
              id="sprint-capacity"
              name="capacityStoryPoints"
              type="number"
              value={formData.capacityStoryPoints}
              onChange={handleChange}
              placeholder="40"
              min="0"
              disabled={loading}
            />
          </div>

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
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Sprint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JiraSprintPlanningPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');
  
  const [projects, setProjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [sprints, setSprints] = useState([]);
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch projects
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
      return;
    }

    try {
      const response = await api.boards.getAll(projectId);
      const boardsData = response.data.data.boards || [];
      setBoards(boardsData);
      
      // Auto-select first board if available
      if (boardsData.length > 0 && !selectedBoard) {
        setSelectedBoard(boardsData[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('Failed to load boards. Please try again.');
    }
  };

  // Fetch sprints for selected board
  const fetchSprints = async (boardId) => {
    if (!boardId) {
      setSprints([]);
      return;
    }

    try {
      const response = await api.sprints.getAll(boardId);
      const sprintsData = response.data.data.sprints || [];

      // Fetch issues for each sprint using the dedicated endpoint
      const sprintsWithIssues = await Promise.all(
        sprintsData.map(async (sprint) => {
          try {
            const issuesResponse = await api.issues.getBySprint(sprint.id);
            const sprintIssues = issuesResponse.data.data.issues || [];
            return { ...sprint, issues: sprintIssues };
          } catch (err) {
            console.error(`Failed to fetch issues for sprint ${sprint.id}:`, err);
            return { ...sprint, issues: [] };
          }
        })
      );

      setSprints(sprintsWithIssues);
    } catch (err) {
      console.error('Failed to fetch sprints:', err);
    }
  };

  // Fetch backlog issues (issues without sprint)
  const fetchBacklogIssues = async (boardId) => {
    if (!boardId) {
      setBacklogIssues([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.issues.getAll(boardId);
      const allIssues = response.data.data.issues || [];

      // Filter issues that are not assigned to any sprint (backlog)
      const backlog = allIssues.filter(issue => !issue.sprint_id);
      setBacklogIssues(backlog);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch backlog issues:', err);
      setError('Failed to load backlog issues. Please try again.');
      setBacklogIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active issue
    const activeIssue = backlogIssues.find(issue => issue.id.toString() === activeId);
    if (!activeIssue) return;

    // Check if dropped on a sprint
    if (overId.startsWith('sprint-')) {
      const sprintId = overId.replace('sprint-', '');

      try {
        // Update issue to assign it to the sprint
        await api.issues.update(activeIssue.id, { sprintId: parseInt(sprintId) });

        // Remove from backlog
        setBacklogIssues(prev => prev.filter(issue => issue.id !== activeIssue.id));

        // Add to sprint issues (update sprint state)
        setSprints(prev => prev.map(sprint => {
          if (sprint.id.toString() === sprintId) {
            return {
              ...sprint,
              issues: [...(sprint.issues || []), { ...activeIssue, sprint_id: parseInt(sprintId) }]
            };
          }
          return sprint;
        }));
      } catch (err) {
        console.error('Failed to move issue to sprint:', err);
        alert('Failed to move issue to sprint. Please try again.');
      }
    }
  };

  // Start sprint
  const handleStartSprint = async (sprintId) => {
    try {
      await api.sprints.start(sprintId);

      // Refresh sprints
      fetchSprints(selectedBoard);

      // Navigate to board view
      navigate(`/boards/${selectedBoard}`);
    } catch (err) {
      console.error('Failed to start sprint:', err);
      alert('Failed to start sprint. Please try again.');
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
      setSelectedBoard('');
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedBoard) {
      fetchSprints(selectedBoard);
      fetchBacklogIssues(selectedBoard);
    } else {
      setSprints([]);
      setBacklogIssues([]);
      setLoading(false);
    }
  }, [selectedBoard]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sprints')}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Sprints</span>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Sprint Planning</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Project Selector */}
            <div className="min-w-0 flex-1">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_key})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="min-w-0 flex-1">
              <Input
                id="search-issues"
                name="searchIssues"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedProject ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a project</h3>
              <p className="text-gray-600">Choose a project to start sprint planning.</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              {/* Sprint Sections */}
              {sprints.map((sprint) => (
                <div key={sprint.id} className="bg-white rounded-lg border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <h2 className="text-lg font-medium text-gray-900">{sprint.name}</h2>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
                          sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sprint.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {sprint.issues?.length || 0} issues
                        </span>
                        {sprint.status === 'Planning' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartSprint(sprint.id)}
                            disabled={!sprint.issues || sprint.issues.length === 0}
                          >
                            Start Sprint
                          </Button>
                        )}
                      </div>
                    </div>
                    {sprint.goal && (
                      <p className="text-sm text-gray-600 mt-2">{sprint.goal}</p>
                    )}
                  </div>

                  {/* Sprint Issues */}
                  <SortableContext
                    items={sprint.issues?.map(issue => issue.id.toString()) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      id={`sprint-${sprint.id}`}
                      className="p-6 min-h-[100px] bg-gray-50"
                    >
                      {sprint.issues && sprint.issues.length > 0 ? (
                        <div className="space-y-3">
                          {sprint.issues.map((issue) => (
                            <DraggableIssueCard key={issue.id} issue={issue} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Plan a sprint by dragging work items into it, or by dragging the sprint footer.</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              ))}

              {/* Create Sprint Button */}
              {sprints.length === 0 && (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints yet</h3>
                  <p className="text-gray-600 mb-4">Create your first sprint to start planning.</p>
                  <Button onClick={() => setShowSprintModal(true)}>
                    Create Sprint
                  </Button>
                </div>
              )}

              {sprints.length > 0 && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setShowSprintModal(true)}>
                    Create Sprint
                  </Button>
                </div>
              )}

              {/* Backlog Section */}
              <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <h2 className="text-lg font-medium text-gray-900">Backlog</h2>
                      <span className="text-sm text-gray-500">
                        {backlogIssues.length} issues
                      </span>
                    </div>
                    <Button onClick={() => setShowCreateIssueModal(true)}>
                      Create Issue
                    </Button>
                  </div>
                </div>

                {/* Backlog Issues */}
                <SortableContext
                  items={backlogIssues.map(issue => issue.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="p-6">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : backlogIssues.length > 0 ? (
                      <div className="space-y-3">
                        {backlogIssues
                          .filter(issue =>
                            !searchTerm ||
                            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((issue) => (
                            <DraggableIssueCard key={issue.id} issue={issue} />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No issues in backlog</h3>
                        <p className="text-gray-600 mb-4">Create your first issue to get started.</p>
                        <Button onClick={() => setShowCreateIssueModal(true)}>
                          Create Issue
                        </Button>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                <DraggableIssueCard
                  issue={backlogIssues.find(issue => issue.id.toString() === activeId)}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <SprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        boardId={selectedBoard}
        onSprintCreated={(sprint) => {
          setSprints(prev => [...prev, sprint]);
        }}
      />

      <CreateIssueModal
        isOpen={showCreateIssueModal}
        onClose={() => setShowCreateIssueModal(false)}
        boardId={selectedBoard}
        onIssueCreated={(issue) => {
          setBacklogIssues(prev => [...prev, issue]);
        }}
      />
    </div>
  );
};

export default JiraSprintPlanningPage;
