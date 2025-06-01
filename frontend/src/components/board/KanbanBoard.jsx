import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import { Card } from '../common';

const KanbanBoard = ({
  board,
  onIssueMove,
  onIssueClick,
  isLoading = false,
  error = null,
  className = '',
}) => {
  const [swimlaneView, setSwimlaneView] = useState('none'); // none, assignee, priority

  // Group issues by status
  const issuesByStatus = {
    'To Do': board?.issues?.filter(issue => issue.status === 'To Do') || [],
    'In Progress': board?.issues?.filter(issue => issue.status === 'In Progress') || [],
    'Done': board?.issues?.filter(issue => issue.status === 'Done') || [],
  };

  // Group issues by swimlane
  const groupIssuesBySwimlane = () => {
    if (swimlaneView === 'none') {
      return { default: issuesByStatus };
    }

    const grouped = {};
    if (swimlaneView === 'assignee') {
      board?.issues?.forEach(issue => {
        const assignee = issue.assignee?.id || 'Unassigned';
        if (!grouped[assignee]) {
          grouped[assignee] = {
            'To Do': [],
            'In Progress': [],
            'Done': [],
          };
        }
        grouped[assignee][issue.status].push(issue);
      });
    } else if (swimlaneView === 'priority') {
      board?.issues?.forEach(issue => {
        const priority = issue.priority || 'No Priority';
        if (!grouped[priority]) {
          grouped[priority] = {
            'To Do': [],
            'In Progress': [],
            'Done': [],
          };
        }
        grouped[priority][issue.status].push(issue);
      });
    }
    return grouped;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId.split('-')[0];
    const destinationStatus = result.destination.droppableId.split('-')[0];
    const issueId = result.draggableId;

    if (sourceStatus !== destinationStatus) {
      onIssueMove(issueId, destinationStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" className="m-4">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  const swimlanes = groupIssuesBySwimlane();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Board Controls */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {board?.name || 'Board'}
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={swimlaneView}
            onChange={(e) => setSwimlaneView(e.target.value)}
            className="form-select text-sm"
          >
            <option value="none">No Swimlanes</option>
            <option value="assignee">By Assignee</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      {/* Swimlanes */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-flex h-full p-4 space-x-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {Object.entries(swimlanes).map(([swimlaneId, columns]) => (
              <div key={swimlaneId} className="flex flex-col">
                {swimlaneView !== 'none' && (
                  <div className="mb-2 px-4 py-2 bg-gray-100 rounded-t font-medium">
                    {swimlaneId}
                  </div>
                )}
                <div className="flex space-x-4">
                  {Object.entries(columns).map(([status, issues]) => (
                    <Droppable
                      key={`${swimlaneId}-${status}`}
                      droppableId={`${status}-${swimlaneId}`}
                    >
                      {(provided) => (
                        <KanbanColumn
                          title={status}
                          issues={issues}
                          onIssueClick={onIssueClick}
                          provided={provided}
                        />
                      )}
                    </Droppable>
                  ))}
                </div>
              </div>
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

KanbanBoard.propTypes = {
  board: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    issues: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        priority: PropTypes.string,
        assignee: PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
      })
    ),
  }),
  onIssueMove: PropTypes.func.isRequired,
  onIssueClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default KanbanBoard; 