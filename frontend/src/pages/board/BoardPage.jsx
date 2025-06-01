import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Tabs } from '../../components/common';
import { CreateIssueModal, IssueDetailModal } from '../../components/issues';
import { SprintModal } from '../../components/sprints';
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-neutral-900 text-sm line-clamp-2">
            {issue.title}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            issue.priority === 'P1' ? 'bg-red-100 text-red-800' :
            issue.priority === 'P2' ? 'bg-orange-100 text-orange-800' :
            issue.priority === 'P3' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {issue.priority}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono">ISSUE-{issue.id}</span>
          <span className={`px-2 py-1 rounded-full ${
            issue.issue_type === 'Story' ? 'bg-blue-100 text-blue-800' :
            issue.issue_type === 'Bug' ? 'bg-red-100 text-red-800' :
            issue.issue_type === 'Task' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {issue.issue_type}
          </span>
        </div>

        {issue.assignee_name && (
          <div className="flex items-center space-x-2 text-xs text-neutral-600">
            <div className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {issue.assignee_name.charAt(0).toUpperCase()}
            </div>
            <span>{issue.assignee_name}</span>
          </div>
        )}

        {issue.story_points && (
          <div className="flex justify-end">
            <span className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded">
              {issue.story_points} pts
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

const BoardPage = () => {
  const { id } = useParams(); // Board ID
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('board'); // 'board' or 'list'
  const [swimlaneView, setSwimlaneView] = useState('none'); // 'none', 'priority', 'assignee'
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showIssueDetailModal, setShowIssueDetailModal] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch board details
  const fetchBoard = async () => {
    try {
      setLoading(true);
      console.log('[BoardPage] Fetching board with ID:', id);
      const response = await api.boards.getById(id);
      console.log('[BoardPage] Board API response:', response);

      if (response.data && response.data.data && response.data.data.board) {
        setBoard(response.data.data.board);
        setError(null);
        console.log('[BoardPage] Board loaded successfully:', response.data.data.board);
      } else {
        console.error('[BoardPage] Invalid board response structure:', response);
        setError('Invalid board data received from server.');
      }
    } catch (err) {
      console.error('[BoardPage] Failed to fetch board:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load board details. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch board issues
  const fetchIssues = async () => {
    try {
      const response = await api.issues.getAll(id);
      setIssues(response.data.data.issues || []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  };

  // Fetch board sprints
  const fetchSprints = async () => {
    try {
      const response = await api.sprints.getAll(board.project_id);
      const sprintData = response.data.data.sprints || [];
      setSprints(sprintData);

      // Find active sprint
      const active = sprintData.find(sprint => sprint.status === 'active');
      setActiveSprint(active || null);
    } catch (err) {
      console.error('Failed to fetch sprints:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBoard();
      fetchIssues();
    }
  }, [id]);

  // Fetch sprints after board is loaded
  useEffect(() => {
    if (board && board.project_id) {
      fetchSprints();
    }
  }, [board]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  const handleIssueClick = (issue) => {
    setSelectedIssueId(issue.id);
    setShowIssueDetailModal(true);
  };

  const handleIssueCreated = (newIssue) => {
    setIssues(prev => [...prev, newIssue]);
  };

  const handleSprintUpdated = () => {
    fetchSprints();
    fetchIssues(); // Refresh issues as sprint changes might affect them
  };

  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prev => prev.map(issue =>
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
  };

  const handleIssueDeleted = (deletedIssueId) => {
    setIssues(prev => prev.filter(issue => issue.id !== deletedIssueId));
    setShowIssueDetailModal(false);
    setSelectedIssueId(null);
  };

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

    // Check WIP limits before moving
    const targetColumnIssues = issues.filter(issue => issue.status === newStatus);
    const column = columns.find(col => col.id === newStatus);
    if (column?.wipLimit && targetColumnIssues.length >= column.wipLimit) {
      alert(`Cannot move issue. WIP limit of ${column.wipLimit} reached for ${newStatus} column.`);
      return;
    }

    try {
      // Update issue status via API
      await api.issues.update(activeIssue.id, { status: newStatus });

      // Update local state
      setIssues(prev => prev.map(issue =>
        issue.id === activeIssue.id
          ? { ...issue, status: newStatus }
          : issue
      ));
    } catch (err) {
      console.error('Failed to update issue status:', err);
      alert('Failed to update issue status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              </div>
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
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Board not found</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={fetchBoard}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!board) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium text-neutral-900">Board not found</h3>
        <p className="text-neutral-600 mt-2">The board you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Card>
    );
  }

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'bg-neutral-100', wipLimit: null },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100', wipLimit: 5 },
    { id: 'Done', title: 'Done', color: 'bg-green-100', wipLimit: null }
  ];

  const isWipLimitExceeded = (columnId, issueCount) => {
    const column = columns.find(col => col.id === columnId);
    return column?.wipLimit && issueCount > column.wipLimit;
  };

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
            <Link to={`/projects/${board.project_id}`} className="text-neutral-500 hover:text-neutral-700">
              {board.project_name || 'Project'}
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-neutral-900 font-medium">{board.name}</span>
          </li>
        </ol>
      </nav>

      {/* Sprint Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {activeSprint ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-neutral-900">Active Sprint:</span>
                  <span className="text-neutral-700">{activeSprint.name}</span>
                </div>
                <div className="text-sm text-neutral-600">
                  {activeSprint.start_date && activeSprint.end_date && (
                    <>
                      {formatDate(activeSprint.start_date)} - {formatDate(activeSprint.end_date)}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                <span className="text-neutral-600">No active sprint</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowSprintModal(true)}>
              {activeSprint ? 'Manage Sprint' : 'Start Sprint'}
            </Button>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-neutral-600">View:</label>
              <select
                value={swimlaneView}
                onChange={(e) => setSwimlaneView(e.target.value)}
                className="text-sm border border-neutral-300 rounded px-2 py-1"
              >
                <option value="none">Default</option>
                <option value="priority">By Priority</option>
                <option value="assignee">By Assignee</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{board.name}</h1>
          {board.description && (
            <p className="text-neutral-600 mt-1">{board.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowCreateIssueModal(true)}>
            Create Issue
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);
          return (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} rounded-t-lg px-4 py-3 border-b ${
                isWipLimitExceeded(column.id, columnIssues.length) ? 'border-red-300' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-neutral-900">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      isWipLimitExceeded(column.id, columnIssues.length)
                        ? 'bg-red-100 text-red-800'
                        : 'bg-white text-neutral-600'
                    }`}>
                      {columnIssues.length}
                      {column.wipLimit && ` / ${column.wipLimit}`}
                    </span>
                    {isWipLimitExceeded(column.id, columnIssues.length) && (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <SortableContext
                items={columnIssues.map(issue => issue.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                <div
                  id={`column-${column.id}`}
                  className="flex-1 bg-neutral-50 rounded-b-lg p-4 min-h-96"
                >
                  <div className="space-y-3">
                    {columnIssues.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <svg className="w-8 h-8 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No issues</p>
                        <p className="text-xs text-neutral-400 mt-1">Drop issues here</p>
                      </div>
                    ) : (
                      columnIssues.map((issue) => (
                        <DraggableIssueCard
                          key={issue.id}
                          issue={issue}
                          onClick={() => handleIssueClick(issue)}
                        />
                      ))
                    )}
                  </div>
                </div>
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
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={showCreateIssueModal}
        onClose={() => setShowCreateIssueModal(false)}
        boardId={id}
        onIssueCreated={handleIssueCreated}
      />

      {/* Sprint Modal */}
      <SprintModal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        projectId={board?.project_id}
        activeSprint={activeSprint}
        onSprintUpdated={handleSprintUpdated}
      />

      {/* Issue Detail Modal */}
      <IssueDetailModal
        isOpen={showIssueDetailModal}
        onClose={() => {
          setShowIssueDetailModal(false);
          setSelectedIssueId(null);
        }}
        issueId={selectedIssueId}
        onIssueUpdated={handleIssueUpdated}
        onIssueDeleted={handleIssueDeleted}
      />
    </div>
  );
};

export default BoardPage;