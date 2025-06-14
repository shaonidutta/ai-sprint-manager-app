import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, BlockedBadge } from '../../components/common';
import ScopeCreepBanner from '../../components/common/ScopeCreepBanner'; // Import ScopeCreepBanner
import { IssueDetailModal } from '../../components/issues';
import { api } from '../../api'; // Assuming api.sprints.getStatus(sprintId) will be available
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

// Droppable Column Component
const DroppableColumn = ({ column, issues, children, isOver, isDragging }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
  });

  const getColumnStyles = () => {
    let baseStyles = `flex-1 rounded-b-lg p-4 min-h-96 transition-all duration-200 `;

    if (isOver && isDragging) {
      baseStyles += 'bg-blue-50 border-2 border-blue-300 border-dashed ';
    } else if (isDragging) {
      baseStyles += 'bg-gray-50 border-2 border-transparent ';
    } else {
      baseStyles += 'bg-gray-50 ';
    }

    return baseStyles;
  };

  return (
    <div
      ref={setNodeRef}
      className={getColumnStyles()}
    >
      {children}
    </div>
  );
};

// Draggable Issue Card Component
const DraggableIssueCard = ({ issue, onClick, isDragOverlay = false }) => {
  // Check if issue is blocked
  const isBlocked = issue.blocked_reason && issue.blocked_reason.trim() !== '';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id.toString(),
    disabled: isBlocked // Only disable dragging for blocked issues
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragOverlay ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Story':
        return (
          <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">US</span>
          </div>
        );
      case 'Bug':
        return (
          <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Task':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
      case 'Epic':
        return (
          <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center">
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
      className={`group relative bg-white rounded-lg transition-all duration-150 ${
        isBlocked
          ? 'border-2 border-red-300 bg-red-50 opacity-80'
          : 'border border-gray-200 hover:shadow-md hover:border-blue-300'
      } ${
        isDragging ? 'shadow-lg border-blue-400 transform rotate-1' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
          isBlocked
            ? 'cursor-not-allowed text-gray-300'
            : 'cursor-grab active:cursor-grabbing text-gray-400'
        }`}
      >
        {isBlocked ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3">
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
                {/* Blocked Badge */}
                {isBlocked && (
                  <BlockedBadge
                    blocked_reason={issue.blocked_reason}
                    size="sm"
                    showIcon={true}
                  />
                )}

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
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center mr-2">
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

const BoardKanbanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');
  
  const [projects, setProjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [issues, setIssues] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('board'); // 'board' or 'backlog'
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isUpdatingIssue, setIsUpdatingIssue] = useState(false);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // State for Scope Creep Banner
  const [sprintStatus, setSprintStatus] = useState({
    baselinePoints: 0,
    currentPoints: 0,
    thresholdPct: 0.1, // Default, will be overwritten by API
    scopeAlerted: false,
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enhanced Kanban columns configuration
  const columns = [
    {
      id: 'To Do',
      title: 'TO DO',
      color: 'bg-gradient-to-r from-gray-100 to-gray-200',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300'
    },
    {
      id: 'In Progress',
      title: 'IN PROGRESS',
      color: 'bg-gradient-to-r from-blue-100 to-blue-200',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300'
    },
    {
      id: 'Done',
      title: 'DONE',
      color: 'bg-gradient-to-r from-green-100 to-green-200',
      textColor: 'text-green-800',
      borderColor: 'border-green-300'
    }
  ];

  // Fetch projects with auto-selection
  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll({ limit: 100 });
      const projectsData = response.data.data.projects || [];
      setProjects(projectsData);

      // Auto-select first project if no project is selected and projects are available
      if (!selectedProject && projectsData.length > 0) {
        const firstProject = projectsData[0];
        setSelectedProject(firstProject.id.toString());
        navigate(`/board?project=${firstProject.id}`, { replace: true });
      }
    } catch (err) {
      // Error handled by global toast
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
      if (boardsData.length > 0) {
        setSelectedBoard(boardsData[0].id.toString());
      }
    } catch (err) {
      setError('Failed to load boards. Please try again.');
    }
  };

  // Fetch active sprint for selected board
  const fetchActiveSprint = async (boardId) => {
    if (!boardId) {
      setActiveSprint(null);
      return;
    }

    try {
      const response = await api.sprints.getAll(boardId);
      const sprints = response.data.data.sprints || [];

      // Find the active sprint
      const activeSprintData = sprints.find(sprint => sprint.status === 'Active');
      setActiveSprint(activeSprintData || null);
    } catch (err) {
      setActiveSprint(null);
    }
  };

  // Fetch issues for selected board
  const fetchIssues = async (boardId) => {
    if (!boardId) {
      setIssues([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get all sprints and find all active ones
      const sprintResponse = await api.sprints.getAll(boardId);
      const sprints = sprintResponse.data.data.sprints || [];
      const activeSprints = sprints.filter(sprint => sprint.status === 'Active');
      
      // Set the most recently created active sprint as the active sprint
      const mostRecentActiveSprint = activeSprints.length > 0 
        ? activeSprints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;
      setActiveSprint(mostRecentActiveSprint);

      // Fetch all issues for the board
      const response = await api.issues.getAll(boardId);
      const allIssues = response.data.data.issues || [];
      
      // Filter issues based on sprint status:
      // - For active sprints: show issues from those sprints
      // - For backlog: show issues with no sprint_id
      const activeSprintIds = activeSprints.map(sprint => sprint.id);
      const displayedIssues = allIssues.filter(issue => {
        if (activeSprints.length > 0) {
          // If there are active sprints, show only issues from those sprints
          return activeSprintIds.includes(issue.sprint_id);
        } else {
          // If no active sprints, show only backlog issues (no sprint_id)
          return !issue.sprint_id;
        }
      });
      
      setIssues(displayedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setError('Failed to load issues. Please try again.');
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
      setSelectedBoard('');
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedBoard) {
      fetchIssues(selectedBoard);
      fetchActiveSprint(selectedBoard);
    } else {
      setIssues([]);
      setActiveSprint(null);
      setLoading(false);
    }
  }, [selectedBoard]);

  // Fetch sprint status for scope creep banner
  const fetchSprintStatus = useCallback(async (sprintId) => {
    if (!sprintId) return;
    try {
      // Ensure your api object has a method like api.sprints.getStatus(sprintId)
      // This might require adding it to frontend/src/api/endpoints/index.js and frontend/src/services/sprint/sprintService.js
      const response = await api.sprints.getStatus(sprintId);
      if (response.data && response.data.success) {
        setSprintStatus(response.data.data);
        // If alert is active and banner was previously dismissed for this session,
        // but now the alert is active again (e.g. page reload), we might want to show it again.
        // For simplicity, if API says alerted, we reset dismissed state unless it's a new alert for an already dismissed session.
        // This logic might need refinement based on desired UX for re-alerting.
        if(response.data.data.scopeAlerted) {
            // setBannerDismissed(false); // Re-show if API says alerted, could be annoying if dismissed intentionally.
                                      // Let's keep it simple: banner shows if API says alerted AND not dismissed in current session.
        }
      }
    } catch (err) {
      console.error('Failed to fetch sprint status:', err);
      // Optionally set some error state for sprint status
    }
  }, []); // No dependencies, relies on sprintId passed as argument

  useEffect(() => {
    if (activeSprint && activeSprint.id) {
      fetchSprintStatus(activeSprint.id); // Initial fetch

      const intervalId = setInterval(() => {
        fetchSprintStatus(activeSprint.id);
      }, 60000); // Re-fetch every 60 seconds

      return () => clearInterval(intervalId); // Cleanup interval on component unmount or when activeSprint changes
    }
  }, [activeSprint, fetchSprintStatus]);


  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProject(newProjectId);
    setSelectedBoard('');
    
    if (newProjectId) {
      navigate(`/board?project=${newProjectId}`, { replace: true });
    } else {
      navigate('/board', { replace: true });
    }
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue && issue.status === status);
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    // Check if sprint is active before allowing drag
    if (!activeSprint || activeSprint.status !== 'Active') {
      return;
    }

    setActiveId(event.active.id);
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    const { over } = event;

    if (over && over.id.startsWith('column-')) {
      const columnId = over.id.replace('column-', '');
      setDragOverColumn(columnId);
    } else {
      setDragOverColumn(null);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Reset drag state
    setActiveId(null);
    setIsDragging(false);
    setDragOverColumn(null);

    // Check if sprint is active before allowing drop
    if (!activeSprint || activeSprint.status !== 'Active') {
      return;
    }

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active issue
    const activeIssue = issues.find(issue => issue.id.toString() === activeId);
    if (!activeIssue) return;

    // Determine the new status based on the drop target
    let newStatus;
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '');
    } else {
      // Dropped on another issue, find its column
      const overIssue = issues.find(issue => issue.id.toString() === overId);
      if (overIssue) {
        newStatus = overIssue.status;
      } else {
        return;
      }
    }

    // Don't update if status hasn't changed
    if (activeIssue.status === newStatus) return;

    // Set loading state
    setIsUpdatingIssue(true);

    try {
      // Optimistically update local state
      const originalIssues = [...issues];
      setIssues(prev => prev.map(issue =>
        issue.id === activeIssue.id
          ? { ...issue, status: newStatus }
          : issue
      ));

      // Update issue status via API
      await api.issues.update(activeIssue.id, { status: newStatus });
    } catch (err) {

      // Rollback optimistic update
      setIssues(originalIssues);
{/* Scope Creep Banner */}
      {activeSprint && sprintStatus.scopeAlerted && !bannerDismissed && (
        <ScopeCreepBanner
          baselinePoints={sprintStatus.baselinePoints}
          currentPoints={sprintStatus.currentPoints}
          thresholdPct={sprintStatus.thresholdPct}
          scopeAlerted={sprintStatus.scopeAlerted}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      // Show user-friendly error message
      const errorMessage = err.response?.data?.message || 'Failed to update issue status. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdatingIssue(false);
    }
  };

  // Handle issue card click
  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetailModal(true);
  };

  // Handle issue update from modal
  const handleIssueUpdated = (updatedIssue) => {
    if (!updatedIssue || !updatedIssue.id) {
      return;
    }

    setIssues(prev => {
      const newIssues = prev.map(issue => {
        if (!issue || !issue.id) {
          return issue; // Keep invalid issues as-is to prevent crashes
        }

        if (issue.id === updatedIssue.id) {
          // Ensure the updated issue has all required fields
          const mergedIssue = {
            ...issue, // Keep existing fields
            ...updatedIssue, // Override with updated fields
            issue_key: updatedIssue.issue_key || issue.issue_key || `#${updatedIssue.id}` // Ensure issue_key exists
          };
          return mergedIssue;
        }

        return issue;
      }).filter(issue => issue && issue.id); // Filter out any null/undefined issues

      return newIssues;
    });
  };

  // Helper functions for backlog view
  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Story':
        return (
          <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">US</span>
          </div>
        );
      case 'Bug':
        return (
          <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'Task':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
      case 'Epic':
        return (
          <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800';
      case 'P2': return 'bg-orange-100 text-orange-800';
      case 'P3': return 'bg-yellow-100 text-yellow-800';
      case 'P4': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);
  const selectedBoardData = boards.find(b => b.id.toString() === selectedBoard);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Project Selector */}
            <div className="min-w-0 flex-1">
              <select
                value={selectedProject}
                onChange={handleProjectChange}
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

          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setView('board')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  view === 'board' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setView('backlog')}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  view === 'backlog' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Issues
              </button>
            </div>
          </div>
        </div>

        {/* Project Info Only */}
        {selectedProjectData && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-medium">
                {selectedProjectData.project_key}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedProjectData.name}
                </h1>
              </div>
            </div>

            {/* Enhanced Sprint Status Indicator */}
            <div className="flex items-center space-x-2">
              {activeSprint ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300 shadow-sm">
                    Active Sprint
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm">
                    No Active Sprint
                  </span>
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedProject ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a project</h3>
              <p className="text-gray-600">Choose a project to view its boards and issues.</p>
            </div>
          </div>
        ) : view === 'board' ? (
          // Enhanced Kanban Board View with Drag and Drop
          <div className="h-full p-6">
            {/* No Active Sprint Warning */}
            {!activeSprint && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">No Active Sprint</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Issues cannot be moved between columns when no sprint is active. Start a sprint from the Sprint Planning page to enable drag-and-drop functionality.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-3 gap-6 h-full">
                {columns.map((column) => {
                  const columnIssues = getIssuesByStatus(column.id);
                  const isOver = dragOverColumn === column.id;

                  return (
                    <div key={column.id} className="flex flex-col">
                      {/* Enhanced Column Header */}
                      <div className={`${column.color} px-4 py-4 rounded-t-xl border-b-2 ${column.borderColor} transition-all duration-300 shadow-sm ${
                        isOver && isDragging ? 'bg-gradient-to-r from-blue-200 to-blue-300 scale-105 shadow-md' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold tracking-wide ${column.textColor} ${isOver && isDragging ? 'text-blue-900' : ''}`}>
                            {column.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-300 shadow-sm ${
                              isOver && isDragging
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'text-gray-600 bg-white border border-gray-200'
                            }`}>
                              {columnIssues.length}
                            </span>
                            {isUpdatingIssue && (
                              <div className="w-5 h-5">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column Content */}
                      <SortableContext
                        items={columnIssues.filter(issue => issue && issue.id).map(issue => issue.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <DroppableColumn
                          column={column}
                          issues={columnIssues}
                          isOver={isOver}
                          isDragging={isDragging}
                        >
                          <div className="space-y-3 overflow-y-auto">
                            {columnIssues.length === 0 ? (
                              <div className={`text-center py-8 transition-all duration-200 ${
                                isOver && isDragging
                                  ? 'text-blue-600'
                                  : 'text-gray-500'
                              }`}>
                                <svg className={`w-8 h-8 mx-auto mb-2 transition-colors duration-200 ${
                                  isOver && isDragging
                                    ? 'text-blue-400'
                                    : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-sm">
                                  {isOver && isDragging ? 'Drop issue here' : 'No issues'}
                                </p>
                                {!isOver && (
                                  <p className="text-xs text-gray-400 mt-1">Drop issues here</p>
                                )}
                              </div>
                            ) : (
                              columnIssues.filter(issue => issue && issue.id).map((issue) => (
                                <DraggableIssueCard
                                  key={issue.id}
                                  issue={issue}
                                  onClick={handleIssueClick}
                                />
                              ))
                            )}
                          </div>
                        </DroppableColumn>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>

              <DragOverlay>
                {activeId ? (
                  (() => {
                    const draggedIssue = issues.find(issue => issue && issue.id && issue.id.toString() === activeId);
                    return draggedIssue ? (
                      <DraggableIssueCard
                        issue={draggedIssue}
                        onClick={() => {}}
                        isDragOverlay={true}
                      />
                    ) : null;
                  })()
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          // Backlog View
          <div className="h-full p-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">All Issues</h2>
                <p className="text-sm text-gray-600">All issues for this board</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {issues.filter(issue => issue && issue.id).map((issue) => (
                  <div
                    key={issue.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <div className="flex items-center space-x-3">
                      {getIssueTypeIcon(issue.issue_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {issue.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {issue.issue_key || `#${issue.id}`} • {issue.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {issue.story_points && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {issue.story_points} SP
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        isOpen={showIssueDetailModal}
        onClose={() => {
          setShowIssueDetailModal(false);
          setSelectedIssue(null);
        }}
        issueId={selectedIssue?.id}
        onIssueUpdated={handleIssueUpdated}
      />
    </div>
  );
};

export default BoardKanbanPage;
