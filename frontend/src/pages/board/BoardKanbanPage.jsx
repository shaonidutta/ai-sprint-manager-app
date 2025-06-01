import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/common';
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
const DraggableIssueCard = ({ issue, onClick, isDragOverlay = false, getPriorityColor, getIssueTypeIcon, navigate }) => {
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
    transition: isDragOverlay ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const cardClasses = `
    p-3 cursor-grab active:cursor-grabbing
    hover:shadow-md transition-all duration-200 border-l-4
    ${isDragging ? 'shadow-xl rotate-2 scale-105' : ''}
    ${isDragOverlay ? 'shadow-2xl rotate-3 scale-110' : ''}
    ${isDragging || isDragOverlay ? 'bg-white border-blue-300' : 'bg-white border-gray-200'}
    ${getPriorityColor(issue.priority)}
  `;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardClasses}
      onClick={onClick}
    >
      <div className="flex items-start space-x-2 mb-2">
        {getIssueTypeIcon(issue.issue_type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {issue.title}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{issue.issue_key || `#${issue.id}`}</span>
        {issue.story_points && (
          <span className="bg-gray-200 px-2 py-1 rounded">
            {issue.story_points} SP
          </span>
        )}
      </div>

      {issue.assignee && (
        <div className="mt-2 flex items-center space-x-1">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
            {issue.assignee.firstName?.charAt(0)}{issue.assignee.lastName?.charAt(0)}
          </div>
          <span className="text-xs text-gray-600">
            {issue.assignee.firstName} {issue.assignee.lastName}
          </span>
        </div>
      )}
    </Card>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('board'); // 'board' or 'backlog'
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isUpdatingIssue, setIsUpdatingIssue] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Kanban columns configuration
  const columns = [
    { id: 'To Do', title: 'TO DO', color: 'bg-gray-100' },
    { id: 'In Progress', title: 'IN PROGRESS', color: 'bg-blue-100' },
    { id: 'Done', title: 'DONE', color: 'bg-green-100' }
  ];

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

  // Fetch issues for selected board
  const fetchIssues = async (boardId) => {
    if (!boardId) {
      setIssues([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.issues.getAll(boardId);
      setIssues(response.data.data.issues || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setError('Failed to load issues. Please try again.');
      setIssues([]);
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
    } else {
      setIssues([]);
      setLoading(false);
    }
  }, [selectedBoard]);

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

  const handleBoardChange = (e) => {
    setSelectedBoard(e.target.value);
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
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

      console.log(`Successfully moved issue ${activeIssue.id} to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update issue status:', err);

      // Rollback optimistic update
      setIssues(originalIssues);

      // Show user-friendly error message
      const errorMessage = err.response?.data?.message || 'Failed to update issue status. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdatingIssue(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'border-l-red-500';
      case 'P2': return 'border-l-orange-500';
      case 'P3': return 'border-l-yellow-500';
      case 'P4': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'Story':
        return (
          <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        );
      case 'Bug':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
        );
      case 'Task':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        );
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

            {/* Board Selector */}
            {boards.length > 0 && (
              <div className="min-w-0 flex-1">
                <select
                  value={selectedBoard}
                  onChange={handleBoardChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Board...</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                Backlog
              </button>
            </div>
          </div>
        </div>

        {/* Project/Board Info */}
        {selectedProjectData && selectedBoardData && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-medium">
              {selectedProjectData.project_key}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {selectedBoardData.name}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedProjectData.name}
              </p>
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
        ) : !selectedBoard ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a board</h3>
              <p className="text-gray-600">Choose a board to view its issues.</p>
            </div>
          </div>
        ) : view === 'board' ? (
          // Enhanced Kanban Board View with Drag and Drop
          <div className="h-full p-6">
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
                      {/* Column Header */}
                      <div className={`${column.color} px-4 py-3 rounded-t-lg border-b transition-all duration-200 ${
                        isOver && isDragging ? 'bg-blue-200' : ''
                      }`}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{column.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-2 py-1 rounded transition-colors duration-200 ${
                              isOver && isDragging
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 bg-white'
                            }`}>
                              {columnIssues.length}
                            </span>
                            {isUpdatingIssue && (
                              <div className="w-4 h-4">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column Content */}
                      <SortableContext
                        items={columnIssues.map(issue => issue.id.toString())}
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
                              columnIssues.map((issue) => (
                                <DraggableIssueCard
                                  key={issue.id}
                                  issue={issue}
                                  onClick={() => navigate(`/issues/${issue.id}`)}
                                  getPriorityColor={getPriorityColor}
                                  getIssueTypeIcon={getIssueTypeIcon}
                                  navigate={navigate}
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
                  <DraggableIssueCard
                    issue={issues.find(issue => issue.id.toString() === activeId)}
                    onClick={() => {}}
                    isDragOverlay={true}
                    getPriorityColor={getPriorityColor}
                    getIssueTypeIcon={getIssueTypeIcon}
                    navigate={navigate}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          // Backlog View
          <div className="h-full p-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Backlog</h2>
                <p className="text-sm text-gray-600">All issues for this board</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/issues/${issue.id}`)}
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
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(issue.priority).replace('border-l-', 'bg-').replace('-500', '-100')} text-gray-800`}>
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
    </div>
  );
};

export default BoardKanbanPage;
