import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Button, Input, TextArea } from '../../components/common';
import { CreateIssueModal } from '../../components/issues';
import { api } from '../../api';

const SprintPlanningPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');

  // State management
  const [sprint, setSprint] = useState(null);
  const [sprintForm, setSprintForm] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacityStoryPoints: ''
  });
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [sprintIssues, setSprintIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [board, setBoard] = useState(null);

  // Redirect if no boardId provided
  useEffect(() => {
    if (!boardId) {
      navigate('/boards');
      return;
    }
    fetchBoardData();
    fetchBacklogIssues();
  }, [boardId, navigate]);

  const fetchBoardData = async () => {
    try {
      const response = await api.boards.getById(boardId);
      setBoard(response.data.data.board);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Failed to load board data');
    }
  };

  const fetchBacklogIssues = async () => {
    try {
      setLoading(true);
      const response = await api.issues.getByBoard(boardId, { 
        sprintId: 'null',  // Get unassigned issues
        limit: 100 
      });
      setBacklogIssues(response.data.data.issues || []);
    } catch (err) {
      console.error('Failed to fetch backlog issues:', err);
      setError('Failed to load backlog issues');
    } finally {
      setLoading(false);
    }
  };

  const handleSprintFormChange = (e) => {
    const { name, value } = e.target;
    setSprintForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintForm.name.trim()) {
      setError('Sprint name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const sprintData = {
        name: sprintForm.name,
        goal: sprintForm.goal,
        startDate: sprintForm.startDate || null,
        endDate: sprintForm.endDate || null,
        capacityStoryPoints: sprintForm.capacityStoryPoints ? parseInt(sprintForm.capacityStoryPoints) : null
      };

      const response = await api.sprints.create(boardId, sprintData);
      setSprint(response.data.data.sprint);
    } catch (err) {
      console.error('Failed to create sprint:', err);
      setError(err.response?.data?.message || 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async () => {
    if (!sprint || sprintIssues.length === 0) {
      setError('Please add at least one issue to the sprint before starting');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.sprints.start(sprint.id);
      
      // Navigate to the board view
      navigate(`/boards/${boardId}`);
    } catch (err) {
      console.error('Failed to start sprint:', err);
      setError(err.response?.data?.message || 'Failed to start sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    // If dropped in the same location, do nothing
    if (sourceDroppableId === destinationDroppableId && source.index === destination.index) {
      return;
    }

    const issueId = parseInt(draggableId);
    const issue = [...backlogIssues, ...sprintIssues].find(i => i.id === issueId);

    if (!issue) return;

    try {
      setLoading(true);
      
      if (destinationDroppableId === 'sprint' && sourceDroppableId === 'backlog') {
        // Moving from backlog to sprint
        if (!sprint) {
          setError('Please create a sprint first');
          return;
        }

        await api.issues.update(issueId, { sprintId: sprint.id });
        
        // Update local state
        setBacklogIssues(prev => prev.filter(i => i.id !== issueId));
        setSprintIssues(prev => [...prev, { ...issue, sprint_id: sprint.id }]);
        
      } else if (destinationDroppableId === 'backlog' && sourceDroppableId === 'sprint') {
        // Moving from sprint to backlog
        await api.issues.update(issueId, { sprintId: null });
        
        // Update local state
        setSprintIssues(prev => prev.filter(i => i.id !== issueId));
        setBacklogIssues(prev => [...prev, { ...issue, sprint_id: null }]);
      }
    } catch (err) {
      console.error('Failed to move issue:', err);
      setError('Failed to move issue');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCreated = (newIssue) => {
    setBacklogIssues(prev => [newIssue, ...prev]);
    setShowCreateIssueModal(false);
  };

  if (!boardId) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create New Sprint</h1>
            <p className="text-neutral-600 mt-1">
              {board ? `Board: ${board.name}` : 'Loading board...'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateIssueModal(true)}
              className="bg-primary-500 text-white hover:bg-primary-600"
            >
              + Add Issue
            </Button>
            <Button
              onClick={handleStartSprint}
              disabled={!sprint || sprintIssues.length === 0 || loading}
              className={`${
                !sprint || sprintIssues.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'bg-success-500 hover:bg-success-600'
              } text-white transition-all duration-200`}
            >
              {loading ? 'Starting...' : 'Start Sprint'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 border-error-200 bg-error-50">
            <p className="text-error-700">{error}</p>
          </Card>
        )}

        {/* Sprint Configuration Panel */}
        {!sprint ? (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Sprint Configuration</h2>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Sprint Name *
                  </label>
                  <Input
                    name="name"
                    value={sprintForm.name}
                    onChange={handleSprintFormChange}
                    placeholder="e.g., Sprint 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Capacity (Story Points)
                  </label>
                  <Input
                    name="capacityStoryPoints"
                    type="number"
                    value={sprintForm.capacityStoryPoints}
                    onChange={handleSprintFormChange}
                    placeholder="40"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sprint Goal
                </label>
                <TextArea
                  name="goal"
                  value={sprintForm.goal}
                  onChange={handleSprintFormChange}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    name="startDate"
                    type="date"
                    value={sprintForm.startDate}
                    onChange={handleSprintFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    End Date
                  </label>
                  <Input
                    name="endDate"
                    type="date"
                    value={sprintForm.endDate}
                    onChange={handleSprintFormChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Sprint'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-6 bg-success-50 border-success-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-success-800">{sprint.name}</h2>
                {sprint.goal && <p className="text-success-700 mt-1">{sprint.goal}</p>}
              </div>
              <div className="text-sm text-success-600">
                Status: {sprint.status} | Issues: {sprintIssues.length}
              </div>
            </div>
          </Card>
        )}

        {/* Drag and Drop Planning Area */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backlog Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Backlog ({backlogIssues.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateIssueModal(true)}
                >
                  + Add Issue
                </Button>
              </div>

              <Droppable droppableId="backlog">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    {backlogIssues.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No backlog issues</h3>
                        <p className="text-neutral-600 mb-4">Create issues to start planning your sprint</p>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateIssueModal(true)}
                        >
                          Create First Issue
                        </Button>
                      </div>
                    ) : (
                      backlogIssues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white rounded-lg border shadow-sm transition-all duration-200 ${
                                snapshot.isDragging
                                  ? 'shadow-lg rotate-2 scale-105'
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <IssueCard issue={issue} />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>

            {/* Sprint Planning Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Sprint Planning ({sprintIssues.length})
                </h2>
                {sprintIssues.length > 0 && (
                  <div className="text-sm text-neutral-600">
                    {sprintIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)} story points
                  </div>
                )}
              </div>

              <Droppable droppableId="sprint">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-success-300 bg-success-50'
                        : sprint
                          ? 'border-success-200 bg-success-25'
                          : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    {!sprint ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Create a sprint first</h3>
                        <p className="text-neutral-600">Fill out the sprint configuration form above to get started</p>
                      </div>
                    ) : sprintIssues.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">Ready for planning</h3>
                        <p className="text-neutral-600">Drag issues from the backlog to plan your sprint</p>
                      </div>
                    ) : (
                      sprintIssues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white rounded-lg border shadow-sm transition-all duration-200 ${
                                snapshot.isDragging
                                  ? 'shadow-lg rotate-2 scale-105'
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <IssueCard issue={issue} />
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>
        </DragDropContext>

        {/* Create Issue Modal */}
        <CreateIssueModal
          isOpen={showCreateIssueModal}
          onClose={() => setShowCreateIssueModal(false)}
          boardId={boardId}
          onIssueCreated={handleIssueCreated}
        />
      </div>
    </div>
  );
};

// Issue Card Component
const IssueCard = ({ issue }) => {
  const priorityColors = {
    P1: 'bg-red-100 text-red-800',
    P2: 'bg-orange-100 text-orange-800',
    P3: 'bg-yellow-100 text-yellow-800',
    P4: 'bg-green-100 text-green-800',
  };

  const typeIcons = {
    Story: '📖',
    Bug: '🐛',
    Task: '📋',
    Epic: '🏆',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{typeIcons[issue.issue_type] || '📄'}</span>
          <span className="text-sm font-mono text-neutral-500">#{issue.id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[issue.priority]}`}>
            {issue.priority}
          </span>
          {issue.story_points && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {issue.story_points} pts
            </span>
          )}
        </div>
      </div>

      <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
        {issue.title}
      </h3>

      {issue.description && (
        <p className="text-xs text-neutral-600 line-clamp-2">
          {issue.description}
        </p>
      )}

      {issue.assignee_first_name && (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary-600">
              {issue.assignee_first_name.charAt(0)}{issue.assignee_last_name?.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-neutral-600">
            {issue.assignee_first_name} {issue.assignee_last_name}
          </span>
        </div>
      )}
    </div>
  );
};

export default SprintPlanningPage;
