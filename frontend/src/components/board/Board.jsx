import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IssueCard } from './';

const COLUMN_COLORS = {
  'To Do': 'bg-gray-50',
  'In Progress': 'bg-blue-50',
  'Done': 'bg-green-50',
  'Blocked': 'bg-red-50',
};

const Board = ({ issues, onIssueClick, onIssueMove, isLoading, error }) => {
  const [columns] = useState([
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
    { id: 'blocked', title: 'Blocked' },
  ]);

  const getIssuesByStatus = () => {
    const issuesByStatus = {
      'To Do': [],
      'In Progress': [],
      'Done': [],
      'Blocked': [],
    };

    issues.forEach(issue => {
      if (issuesByStatus[issue.status]) {
        issuesByStatus[issue.status].push(issue);
      }
    });

    return issuesByStatus;
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = columns.find(col => col.id === source.droppableId)?.title;
    const destinationStatus = columns.find(col => col.id === destination.droppableId)?.title;
    const issue = issues.find(i => i.id === draggableId);

    if (issue && sourceStatus && destinationStatus) {
      onIssueMove(issue, sourceStatus, destinationStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`
              p-4 rounded-lg ${COLUMN_COLORS[column.title]}
              flex flex-col h-full min-h-[500px]
            `}
          >
            <h3 className="font-medium text-gray-900 mb-4">{column.title}</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-white rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  const issuesByStatus = getIssuesByStatus();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  p-4 rounded-lg ${COLUMN_COLORS[column.title]}
                  flex flex-col h-full min-h-[500px]
                  ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">
                    {column.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {issuesByStatus[column.title].length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {issuesByStatus[column.title].map((issue, index) => (
                    <Draggable
                      key={issue.id}
                      draggableId={issue.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            ${snapshot.isDragging ? 'shadow-lg' : ''}
                          `}
                        >
                          <IssueCard
                            issue={issue}
                            onClick={() => onIssueClick(issue)}
                            view="board"
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

Board.propTypes = {
  issues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    type: PropTypes.string,
    assignee: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    updatedAt: PropTypes.string.isRequired,
  })).isRequired,
  onIssueClick: PropTypes.func.isRequired,
  onIssueMove: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default Board; 