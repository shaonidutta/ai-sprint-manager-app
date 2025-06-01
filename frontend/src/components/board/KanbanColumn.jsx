import React from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { Card, Badge, Avatar, Tooltip } from '../common';

const KanbanColumn = ({
  title,
  issues,
  onIssueClick,
  provided,
  className = '',
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100';
      case 'In Progress':
        return 'bg-blue-100';
      case 'Done':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'P1':
        return <Badge variant="priority-p1" size="small">P1</Badge>;
      case 'P2':
        return <Badge variant="priority-p2" size="small">P2</Badge>;
      case 'P3':
        return <Badge variant="priority-p3" size="small">P3</Badge>;
      case 'P4':
        return <Badge variant="priority-p4" size="small">P4</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        flex flex-col w-80 rounded-lg
        ${getStatusColor(title)}
        ${className}
      `}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <Badge variant="default" size="small">
            {issues.length}
          </Badge>
        </div>
      </div>

      {/* Issues List */}
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className="flex-1 p-2 space-y-2 min-h-[200px]"
      >
        {issues.map((issue, index) => (
          <Draggable
            key={issue.id}
            draggableId={issue.id}
            index={index}
          >
            {(dragProvided, dragSnapshot) => (
              <div
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
                className={`
                  transform transition-transform duration-100
                  ${dragSnapshot.isDragging ? 'rotate-2' : ''}
                `}
              >
                <Card
                  variant="default"
                  elevation={dragSnapshot.isDragging ? 'high' : 'low'}
                  interactive
                  onClick={() => onIssueClick(issue)}
                  className="hover:border-blue-300"
                >
                  {/* Issue Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {issue.type && (
                        <Tooltip content={issue.type}>
                          <span className="text-gray-500">
                            {issue.type === 'bug' ? '🐛' : '✨'}
                          </span>
                        </Tooltip>
                      )}
                      <span className="text-xs text-gray-500">
                        {issue.key}
                      </span>
                    </div>
                    {getPriorityBadge(issue.priority)}
                  </div>

                  {/* Issue Title */}
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    {issue.title}
                  </h4>

                  {/* Issue Footer */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {issue.assignee && (
                        <Tooltip content={issue.assignee.name}>
                          <div>
                            <Avatar
                              src={issue.assignee.avatar}
                              alt={issue.assignee.name}
                              size="tiny"
                            />
                          </div>
                        </Tooltip>
                      )}
                      {issue.storyPoints && (
                        <span className="text-xs text-gray-500">
                          {issue.storyPoints} pts
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {issue.dueDate && (
                        <Tooltip content={new Date(issue.dueDate).toLocaleDateString()}>
                          <span className="text-xs text-gray-500">
                            📅
                          </span>
                        </Tooltip>
                      )}
                      {issue.comments > 0 && (
                        <Tooltip content={`${issue.comments} comments`}>
                          <span className="text-xs text-gray-500">
                            💬 {issue.comments}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
};

KanbanColumn.propTypes = {
  title: PropTypes.string.isRequired,
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.string,
      priority: PropTypes.string,
      assignee: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      }),
      storyPoints: PropTypes.number,
      dueDate: PropTypes.string,
      comments: PropTypes.number,
    })
  ).isRequired,
  onIssueClick: PropTypes.func.isRequired,
  provided: PropTypes.shape({
    innerRef: PropTypes.func.isRequired,
    droppableProps: PropTypes.object.isRequired,
    placeholder: PropTypes.node,
  }).isRequired,
  className: PropTypes.string,
};

export default KanbanColumn; 