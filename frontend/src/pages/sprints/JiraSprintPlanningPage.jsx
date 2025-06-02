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
  useDroppable,
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
      className={`p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md hover:border-blue-300 ${
        isDragging ? 'shadow-lg border-blue-400 transform rotate-1' : ''
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
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {issue.story_points} SP
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Droppable Sprint Area Component
const DroppableSprintArea = ({ sprint, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `sprint-${sprint.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-8 min-h-[120px] bg-gray-50 rounded-b-xl transition-colors duration-150 ${
        isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
      }`}
    >
      {children}
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
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Button
              variant="outline"
              onClick={() => navigate('/sprints')}
              className="flex items-center justify-center w-10 h-10 p-0 transition-all duration-150 hover:bg-gray-50"
              aria-label="Back to Sprints"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sprint Planning</h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">Plan and organize your sprint backlog</p>
            </div>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 lg:space-x-6">
            {/* Project Selector */}
            <div className="w-full sm:min-w-[200px] lg:min-w-[250px]">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 bg-white hover:border-gray-400"
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
            <div className="w-full sm:min-w-[200px] lg:min-w-[250px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  id="search-issues"
                  name="searchIssues"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
        {!selectedProject ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center bg-white p-12 rounded-xl shadow-sm border">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a project</h3>
              <p className="text-gray-600 max-w-md">Choose a project from the dropdown above to start planning your sprint and organizing your backlog.</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-8">
              {/* Sprint Sections */}
              {sprints.map((sprint) => (
                <div key={sprint.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150">
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{sprint.name}</h2>
                            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full mt-2 sm:mt-0 ${
                              sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
                              sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sprint.status}
                            </span>
                          </div>
                          {sprint.goal && (
                            <p className="text-sm text-gray-600 mt-1 truncate">{sprint.goal}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="text-left sm:text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {sprint.issues?.length || 0} issues
                          </span>
                          {sprint.issues?.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {sprint.issues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)} story points
                            </p>
                          )}
                        </div>
                        {sprint.status === 'Planning' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartSprint(sprint.id)}
                            disabled={!sprint.issues || sprint.issues.length === 0}
                            className="transition-all duration-150 w-full sm:w-auto"
                          >
                            Start Sprint
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sprint Issues */}
                  <DroppableSprintArea sprint={sprint}>
                    {sprint.issues && sprint.issues.length > 0 ? (
                      <SortableContext
                        items={sprint.issues.map(issue => issue.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {sprint.issues.map((issue) => (
                            <DraggableIssueCard key={issue.id} issue={issue} />
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">Drop issues here to plan your sprint</p>
                        <p className="text-sm text-gray-400 mt-1">Drag work items from the backlog below</p>
                      </div>
                    )}
                  </DroppableSprintArea>
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
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Backlog</h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {backlogIssues.length} issues • {backlogIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)} story points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => setShowCreateIssueModal(true)}
                        className="transition-all duration-150"
                      >
                        Create Issue
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Backlog Issues */}
                <SortableContext
                  items={backlogIssues.map(issue => issue.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 rounded-b-xl">
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : backlogIssues.length > 0 ? (
                      <div className="space-y-4">
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
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No issues in backlog</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first issue to start planning your sprint and organizing your work.</p>
                        <Button
                          onClick={() => setShowCreateIssueModal(true)}
                          className="transition-all duration-150"
                        >
                          Create First Issue
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
