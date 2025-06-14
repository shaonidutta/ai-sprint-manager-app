import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input, BlockedBadge } from '../../components/common';
import { CreateIssueModal, IssueDetailModal } from '../../components/issues';
import { useSprintPlanning } from '../../context/SprintPlanningContext';
import { api } from '../../api';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Custom collision detection that prioritizes droppable areas over sortable items
const customCollisionDetection = (args) => {
  // First, try to find droppable containers using pointerWithin
  const pointerCollisions = pointerWithin(args);

  // Filter for droppable containers (sprint areas and backlog)
  const droppableCollisions = pointerCollisions.filter(collision => {
    const id = collision.id;
    return typeof id === 'string' && (id.startsWith('sprint-') || id === 'backlog');
  });

  // If we found droppable containers, prioritize them
  if (droppableCollisions.length > 0) {
    return droppableCollisions;
  }

  // Otherwise, fall back to closest center for sortable items
  return closestCenter(args);
};

// Draggable Issue Card Component
const DraggableIssueCard = ({ issue, onClick, sprintStatus = null, isInSprint = false }) => {
  // Determine if dragging should be disabled
  // Disable dragging if the issue is in an active sprint OR if the issue is blocked
  const isBlocked = issue.blocked_reason && issue.blocked_reason.trim() !== '';
  const shouldDisableDragging = (isInSprint && sprintStatus === 'Active') || isBlocked;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id.toString(),
    disabled: shouldDisableDragging,
    data: {
      type: 'issue',
      issue: issue,
      isInSprint: isInSprint,
      sprintStatus: sprintStatus
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : shouldDisableDragging ? 0.7 : 1,
  };

  const getIssueTypeIcon = (type) => {
    // Normalize the type to handle different cases and formats
    // Default to 'Task' if type is undefined or null
    const normalizedType = type ? type.toString().trim() : 'Task';

    switch (normalizedType) {
      case 'Story':
      case 'story':
      case 'User Story':
        return (
          <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">US</span>
          </div>
        );
      case 'Bug':
      case 'bug':
        return (
          <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Task':
      case 'task':
        return (
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
      case 'Epic':
      case 'epic':
        return (
          <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        );
      default:
        // Default to Task icon for unknown types
        return (
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-200';
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P3': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'P4': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = (e) => {
    // Prevent click when dragging
    if (isDragging) return;

    // Stop propagation to prevent drag handlers
    e.stopPropagation();

    if (onClick) {
      onClick(issue);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative bg-white rounded-xl transition-all duration-300 ${
        isBlocked
          ? 'border-2 border-red-300 bg-red-50 shadow-red-100/50'
          : 'border border-gray-200 shadow-sm'
      } ${
        shouldDisableDragging
          ? 'opacity-70'
          : 'hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5'
      } ${
        isDragging ? 'shadow-xl border-blue-400 transform rotate-1 scale-105' : ''
      }`}
    >
      {/* Enhanced Drag Handle */}
      <div
        {...listeners}
        className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-150 ${
          shouldDisableDragging
            ? 'cursor-not-allowed text-gray-300'
            : 'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:scale-110'
        }`}
      >
        <div className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-150">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Enhanced Active Sprint Indicator */}
      {shouldDisableDragging && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-150">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Enhanced Card Content */}
      <div className="p-5">
        <div className="flex items-start space-x-3">
          {getIssueTypeIcon(issue.issue_type)}
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-medium text-gray-900 line-clamp-2 mb-3 cursor-pointer hover:text-blue-600 transition-colors duration-150 leading-relaxed"
              onClick={handleCardClick}
            >
              {issue.title}
            </h4>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md">
                {issue.issue_key || `#${issue.id}`}
              </span>

              <div className="flex items-center space-x-1.5">
                {/* Blocked Badge */}
                {isBlocked && (
                  <BlockedBadge
                    blocked_reason={issue.blocked_reason}
                    size="sm"
                    showIcon={true}
                  />
                )}

                {/* Status Badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>

                {/* Story Points */}
                {issue.story_points && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200">
                    {issue.story_points} SP
                  </span>
                )}

                {/* Priority */}
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shadow-sm ${getPriorityColor(issue.priority)}`}>
                  {issue.priority}
                </span>
              </div>
            </div>

            {/* Enhanced Assignee */}
            {issue.assignee && (
              <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <span className="text-xs font-medium text-white">
                    {issue.assignee.first_name?.[0]}{issue.assignee.last_name?.[0]}
                  </span>
                </div>
                <span className="font-medium">{issue.assignee.first_name} {issue.assignee.last_name}</span>
              </div>
            )}
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
    data: {
      type: 'sprint',
      sprint: sprint,
      accepts: ['issue']
    }
  });

  const isActive = sprint.status === 'Active';



  return (
    <div
      ref={setNodeRef}
      className={`p-4 sm:p-6 lg:p-8 min-h-[300px] rounded-b-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-b from-green-50 to-emerald-50'
          : 'bg-gradient-to-b from-gray-50 to-gray-100'
      } ${
        isOver ? 'bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-dashed border-blue-400 shadow-xl scale-[1.02]' : 'border-2 border-transparent'
      }`}
      style={{
        position: 'relative'
      }}
    >
      {/* Enhanced Drop zone overlay */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-xl border border-blue-400 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Drop issue here</span>
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Enhanced Empty state */}
      {(!children || (Array.isArray(children) && children.length === 0)) && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">Drag issues here to add to sprint</p>
            <p className="text-gray-400 text-xs mt-1">Drop work items from the backlog below</p>
          </div>
        </div>
      )}

      {/* Additional drop zone padding - ensures there's always droppable space */}
      <div className="h-16 w-full" />
    </div>
  );
};

// Droppable Backlog Area Component
const DroppableBacklogArea = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'backlog',
    data: {
      type: 'backlog',
      accepts: ['issue']
    }
  });



  return (
    <div
      ref={setNodeRef}
      className={`p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-b-xl transition-all duration-300 min-h-[200px] ${
        isOver ? 'bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-dashed border-blue-400 shadow-xl scale-[1.01]' : 'border-2 border-transparent'
      }`}
      style={{
        position: 'relative'
      }}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-xl border border-blue-400 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8" />
              </svg>
              <span>Drop issue here to return to backlog</span>
            </div>
          </div>
        </div>
      )}
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

  // Use Sprint Planning Context
  const { state, actions, apiActions } = useSprintPlanning();
  const {
    loading,
    projects,
    selectedProject,
    selectedBoard,
    sprints,
    backlogIssues
  } = state;

  // Local state for UI interactions
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [dragLoading, setDragLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize project ID from URL
  useEffect(() => {
    if (projectId && projectId !== selectedProject) {
      actions.setSelectedProject(projectId);
    }
  }, [projectId, selectedProject, actions]);

  // Handle drag and drop
  const handleDragStart = (event) => {
    const { active } = event;
    
    // Find the issue being dragged
    const draggedIssue = backlogIssues.find(issue => issue?.id?.toString() === active.id) ||
      sprints.flatMap(sprint => sprint.issues || []).find(issue => issue?.id?.toString() === active.id);

    // Check if issue is blocked
    if (draggedIssue?.blocked_reason) {
      // Prevent dragging by not setting activeId
      alert('This issue is blocked and cannot be moved. Please unblock it first.');
      return;
    }

    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    // Reset drag state
    setActiveId(null);
    setDragLoading(false);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // Find the active issue from backlog or sprints
    let activeIssue = backlogIssues.find(issue => issue?.id?.toString() === activeId);
    let sourceSprintId = null;

    // If not found in backlog, search in sprints
    if (!activeIssue) {
      for (const sprint of sprints) {
        const foundIssue = sprint.issues?.find(issue => issue?.id?.toString() === activeId);
        if (foundIssue) {
          activeIssue = foundIssue;
          sourceSprintId = sprint.id;
          break;
        }
      }
    }

    if (!activeIssue) return;

    // Double-check if issue is blocked
    if (activeIssue.blocked_reason) {
      alert('This issue is blocked and cannot be moved. Please unblock it first.');
      return;
    }

    try {
      setDragLoading(true);

      if (overId === 'backlog') {
        // Moving to backlog
        await api.issues.update(activeIssue.id, {
          sprint_id: null,  // Set sprint_id to null for backlog items
          status: 'To Do'  // Reset status when moving to backlog
        });
      } else if (overId.startsWith('sprint-')) {
        // Moving to a sprint
        const targetSprintId = parseInt(overId.replace('sprint-', ''));
        
        // Don't move if it's the same sprint
        if (sourceSprintId === targetSprintId) return;

        // Get the target sprint to check its status
        const targetSprint = sprints.find(sprint => sprint.id === targetSprintId);
        
        await api.issues.update(activeIssue.id, {
          sprint_id: targetSprintId,
          status: 'To Do'  // Reset status when moving to a new sprint
        });
      }

      // Refresh the data
      await apiActions.refreshAllData(selectedBoard);
    } catch (error) {
      console.error('Error updating issue:', error);
      setError('Failed to update issue. Please try again.');
    } finally {
      setDragLoading(false);
    }
  };

  // Handle start sprint
  const handleStartSprint = async (sprintId) => {
    try {
      // Get the sprint's issues before starting
      const sprintToStart = sprints.find(sprint => sprint.id === sprintId);
      const sprintIssues = sprintToStart?.issues || [];

      // Start the sprint
      await api.sprints.start(sprintId);

      // Update all issues in the sprint to "To Do" status
      const updatePromises = sprintIssues.map(issue => 
        api.issues.update(issue.id, { 
          status: 'To Do',
          sprint_id: sprintId // Ensure sprint_id is set
        })
      );
      
      await Promise.all(updatePromises);

      // Refresh all data to ensure consistency
      await apiActions.refreshAllData(selectedBoard);

      // Navigate to board view
      navigate(`/board?project=${selectedProject}`);
    } catch (err) {
      console.error('Failed to start sprint:', err);
      alert('Failed to start sprint. Please try again.');
      await apiActions.refreshAllData(selectedBoard);
    }
  };

  // Handle issue card click
  const handleIssueClick = (issue) => {
    // console.log('🎯 Issue clicked:', issue); // Disabled for drag-drop debugging
    // console.log('🎯 Issue ID:', issue?.id); // Disabled for drag-drop debugging
    // console.log('🎯 Issue ID type:', typeof issue?.id); // Disabled for drag-drop debugging
    // console.log('🎯 Full issue object:', JSON.stringify(issue, null, 2)); // Disabled for drag-drop debugging
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };



  // Load initial data
  useEffect(() => {
    apiActions.fetchProjects();
  }, [apiActions]);

  // Handle project selection
  useEffect(() => {
    if (selectedProject) {
      apiActions.fetchBoards(selectedProject);
    }
  }, [selectedProject, apiActions]);

  // Handle board selection
  useEffect(() => {
    if (selectedBoard) {
      apiActions.fetchSprints(selectedBoard);
      apiActions.fetchBacklogIssues(selectedBoard);
    }
  }, [selectedBoard, apiActions]);

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Button
                variant="outline"
                onClick={() => navigate('/sprints')}
                className="flex items-center justify-center w-10 h-10 p-0 transition-all duration-150 hover:bg-gray-50 hover:shadow-sm border-gray-300 hover:border-gray-400"
                aria-label="Back to Sprints"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Sprint Planning</h1>
                <p className="text-sm text-gray-600 mt-1 hidden sm:block">Plan and organize your sprint backlog with modern tools</p>
              </div>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 lg:space-x-6">
              {/* Custom Project Selector */}
              <div className="w-full sm:min-w-[200px] lg:min-w-[280px]">
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => actions.setSelectedProject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-150 appearance-none cursor-pointer"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.project_key})
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Search */}
              <div className="w-full sm:min-w-[200px] lg:min-w-[280px]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-150"
                  />
                </div>
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
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Loading overlay for drag operations */}
            {dragLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-700 font-medium">Updating sprint...</span>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-8">
              {/* Enhanced Sprint Sections */}
              {sprints.map((sprint) => (
                <div key={sprint.id} className={`rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 ${
                  sprint.status === 'Active'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100/50'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b transition-colors duration-300 ${
                    sprint.status === 'Active' ? 'border-green-200/60' : 'border-gray-200'
                  }`}>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-all duration-150 hover:scale-110">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate tracking-tight">
                              {sprint.status === 'Active' ? 'Active Sprint' : sprint.name}
                            </h2>
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                              <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                                sprint.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm' :
                                sprint.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm' :
                                'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm'
                              }`}>
                                {sprint.status}
                              </span>
                              {sprint.status === 'Active' && (
                                <div className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                  Locked
                                </div>
                              )}
                            </div>
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
                              {sprint.issues.filter(issue => issue != null).reduce((sum, issue) => sum + (issue.story_points || 0), 0)} story points
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
                      <div className="space-y-4 pb-4">
                        <SortableContext
                          items={sprint.issues.filter(issue => issue?.id).map(issue => issue.id.toString())}
                          strategy={verticalListSortingStrategy}
                        >
                          {sprint.issues.filter(issue => issue != null).map((issue) => (
                            <DraggableIssueCard
                              key={`sprint-${sprint.id}-${issue.id}`} // Unique key to prevent React reconciliation issues
                              issue={issue}
                              onClick={handleIssueClick}
                              sprintStatus={sprint.status}
                              isInSprint={true}
                            />
                          ))}
                        </SortableContext>
                      </div>
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

              {/* Enhanced Backlog Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-400 hover:text-gray-600 transition-all duration-150 hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">Backlog</h2>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{backlogIssues.length}</span> issues • <span className="font-medium">{backlogIssues.filter(issue => issue != null).reduce((sum, issue) => sum + (issue.story_points || 0), 0)}</span> story points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => setShowCreateIssueModal(true)}
                        className="transition-all duration-150 hover:shadow-md hover:scale-105"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Issue
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Backlog Issues */}
                <SortableContext
                  items={backlogIssues.filter(issue => issue?.id).map(issue => issue.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableBacklogArea>
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
                          .filter(issue => issue != null)
                          .filter(issue =>
                            !searchTerm ||
                            issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
                          )
                          .map((issue) => (
                            <DraggableIssueCard
                              key={`backlog-${issue.id}`} // Unique key to prevent React reconciliation issues
                              issue={issue}
                              onClick={handleIssueClick}
                              sprintStatus={null}
                              isInSprint={false}
                            />
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
                  </DroppableBacklogArea>
                </SortableContext>
              </div>
            </div>

            <DragOverlay>
              {activeId ? (
                (() => {
                  // Find the issue and determine its context
                  let issue = backlogIssues.find(issue => issue?.id?.toString() === activeId);
                  let sprintStatus = null;
                  let isInSprint = false;

                  if (!issue) {
                    // Look in sprints
                    for (const sprint of sprints) {
                      const foundIssue = sprint.issues?.find(issue => issue?.id?.toString() === activeId);
                      if (foundIssue) {
                        issue = foundIssue;
                        sprintStatus = sprint.status;
                        isInSprint = true;
                        break;
                      }
                    }
                  }

                  return issue ? (
                    <DraggableIssueCard
                      issue={issue}
                      onClick={() => {}}
                      sprintStatus={sprintStatus}
                      isInSprint={isInSprint}
                    />
                  ) : null;
                })()
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
          actions.addSprint(sprint);
        }}
      />

      <CreateIssueModal
        isOpen={showCreateIssueModal}
        onClose={() => setShowCreateIssueModal(false)}
        boardId={selectedBoard}
        onIssueCreated={async () => {
          // console.log('🎯 Issue created, refreshing data...', issue); // Disabled for drag-drop debugging
          // Refresh data to ensure consistency
          await apiActions.refreshAllData(selectedBoard);
        }}
      />

      <IssueDetailModal
        isOpen={showIssueDetailModal}
        onClose={() => {
          setShowIssueDetailModal(false);
          setSelectedIssue(null);
        }}
        issueId={selectedIssue?.id}
        onIssueUpdated={async () => {
          // console.log('🔄 Issue updated, refreshing data...', updatedIssue); // Disabled for drag-drop debugging
          await apiActions.refreshAllData(selectedBoard);
        }}
      />
    </div>
  );
};

export default JiraSprintPlanningPage;
