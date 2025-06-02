import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { CreateIssueModal, IssueDetailModal } from '../../components/issues';
import { useSprintPlanning } from '../../context/SprintPlanningContext';
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
const DraggableIssueCard = ({ issue, onClick }) => {

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
    // Debug logging to see what type values we're actually getting
    console.log('🔍 Issue type received:', type, 'Type:', typeof type);

    // Normalize the type to handle different cases and formats
    const normalizedType = type ? type.toString().trim() : '';

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
        console.warn('🚨 Unknown issue type:', type, 'Falling back to default icon');
        return (
          <div className="w-5 h-5 bg-gray-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
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
      className={`group relative bg-white border border-gray-200 rounded-lg transition-all duration-150 hover:shadow-md hover:border-blue-300 ${
        isDragging ? 'shadow-lg border-blue-400 transform rotate-1' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {getIssueTypeIcon(issue.issue_type)}
          <div className="flex-1 min-w-0">
            <h4
              className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-150"
              onClick={handleCardClick}
            >
              {issue.title}
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                {issue.issue_key || `#${issue.id}`}
              </span>

              <div className="flex items-center space-x-2">
                {/* Status Badge */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>

                {/* Story Points */}
                {issue.story_points && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                    {issue.story_points} SP
                  </span>
                )}

                {/* Priority */}
                <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(issue.priority)}`}>
                  {issue.priority}
                </span>
              </div>
            </div>

            {/* Assignee */}
            {issue.assignee && (
              <div className="flex items-center mt-2 text-xs text-gray-600">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-gray-700">
                    {issue.assignee.first_name?.[0]}{issue.assignee.last_name?.[0]}
                  </span>
                </div>
                <span>{issue.assignee.first_name} {issue.assignee.last_name}</span>
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
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 sm:p-6 lg:p-8 min-h-[120px] bg-gray-50 rounded-b-xl transition-colors duration-150 ${
        isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
      }`}
    >
      {children}
    </div>
  );
};

// Droppable Backlog Area Component
const DroppableBacklogArea = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'backlog',
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 sm:p-6 lg:p-8 bg-gray-50 rounded-b-xl transition-colors duration-150 ${
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
  console.log('🎯 JiraSprintPlanningPage component mounting...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  console.log('🎯 About to call useSprintPlanning...');
  // Use Sprint Planning Context
  const { state, actions, apiActions } = useSprintPlanning();
  console.log('🎯 useSprintPlanning successful, got context:', { state, actions, apiActions });
  const {
    loading,
    error,
    projects,
    boards,
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
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Always reset active ID first to prevent UI issues
    setActiveId(null);

    if (!over) {
      console.log('🎯 Drag ended without valid drop target');
      return;
    }

    // Set loading state for drag operations
    setDragLoading(true);

    const activeId = active.id;
    const overId = over.id;

    // Find the active issue from backlog or any sprint
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

    if (!activeIssue) {
      console.warn('Active issue not found:', activeId);
      return;
    }

    // Handle dropping on sprint
    if (overId.startsWith('sprint-')) {
      const targetSprintId = parseInt(overId.replace('sprint-', ''));

      // Don't move if it's the same sprint
      if (sourceSprintId === targetSprintId) return;

      try {
        // Update issue to assign it to the target sprint
        await api.issues.update(activeIssue.id, { sprint_id: targetSprintId });

        // Create updated issue object
        const updatedIssue = { ...activeIssue, sprint_id: targetSprintId };

        // Use context actions instead of local state setters
        if (sourceSprintId) {
          // Moving from sprint to sprint
          actions.moveIssueToSprint(activeIssue.id, targetSprintId, sourceSprintId);
        } else {
          // Moving from backlog to sprint
          actions.moveIssueToSprint(activeIssue.id, targetSprintId);
        }

        console.log(`Successfully moved issue ${activeIssue.id} to sprint ${targetSprintId}`);

        // Verify the move by refreshing data from backend
        await apiActions.refreshAllData(selectedBoard);

      } catch (err) {
        console.error('Failed to move issue to sprint:', err);
        alert('Failed to move issue to sprint. Please try again.');

        // Revert optimistic updates and refresh from backend
        await apiActions.refreshAllData(selectedBoard);
      }
    }

    // Handle dropping on backlog
    else if (overId === 'backlog') {
      // Only allow moving from sprint to backlog
      if (!sourceSprintId) return;

      try {
        // Update issue to remove sprint assignment
        await api.issues.update(activeIssue.id, { sprint_id: null });

        // Create updated issue object
        const updatedIssue = { ...activeIssue, sprint_id: null };

        // Use context action to move issue to backlog
        actions.moveIssueToBacklog(activeIssue.id, sourceSprintId);

        console.log(`Successfully moved issue ${activeIssue.id} to backlog`);

        // Verify the move by refreshing data from backend
        await apiActions.refreshAllData(selectedBoard);

      } catch (err) {
        console.error('Failed to move issue to backlog:', err);
        alert('Failed to move issue to backlog. Please try again.');

        // Revert optimistic updates and refresh from backend
        await apiActions.refreshAllData(selectedBoard);
      }
    }

    // Always reset loading state
    setDragLoading(false);
  };

  // Start sprint
  const handleStartSprint = async (sprintId) => {
    try {
      console.log('🚀 Starting sprint:', sprintId);

      // Start the sprint
      const response = await api.sprints.start(sprintId);
      console.log('🚀 Sprint start response:', response);

      // Refresh all data to ensure consistency
      await apiActions.refreshAllData(selectedBoard);

      console.log('🚀 Data refreshed after sprint start');

      // Navigate to board view with correct URL pattern
      navigate(`/board?project=${selectedProject}`);
    } catch (err) {
      console.error('Failed to start sprint:', err);
      alert('Failed to start sprint. Please try again.');

      // Refresh data even on error to ensure consistency
      await apiActions.refreshAllData(selectedBoard);
    }
  };

  // Handle issue card click
  const handleIssueClick = (issue) => {
    console.log('🎯 Issue clicked:', issue);
    console.log('🎯 Issue ID:', issue?.id);
    console.log('🎯 Issue ID type:', typeof issue?.id);
    console.log('🎯 Full issue object:', JSON.stringify(issue, null, 2));
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
                onChange={(e) => actions.setSelectedProject(e.target.value)}
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
                      <SortableContext
                        items={sprint.issues.filter(issue => issue?.id).map(issue => issue.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {sprint.issues.filter(issue => issue != null).map((issue) => (
                            <DraggableIssueCard key={issue.id} issue={issue} onClick={handleIssueClick} />
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
                          {backlogIssues.length} issues • {backlogIssues.filter(issue => issue != null).reduce((sum, issue) => sum + (issue.story_points || 0), 0)} story points
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
                            <DraggableIssueCard key={issue.id} issue={issue} onClick={handleIssueClick} />
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
                <DraggableIssueCard
                  issue={backlogIssues.find(issue => issue?.id?.toString() === activeId) ||
                         sprints.flatMap(s => s.issues || []).find(issue => issue?.id?.toString() === activeId)}
                  onClick={() => {}}
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
          actions.addSprint(sprint);
        }}
      />

      <CreateIssueModal
        isOpen={showCreateIssueModal}
        onClose={() => setShowCreateIssueModal(false)}
        boardId={selectedBoard}
        onIssueCreated={async (issue) => {
          console.log('🎯 Issue created, refreshing data...', issue);
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
        onIssueUpdated={async (updatedIssue) => {
          console.log('🔄 Issue updated, refreshing data...', updatedIssue);
          await apiActions.refreshAllData(selectedBoard);
        }}
      />
    </div>
  );
};

export default JiraSprintPlanningPage;
