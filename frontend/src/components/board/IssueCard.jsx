import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Badge } from '../common';

const priorityColors = {
  P1: 'bg-red-100 text-red-800',
  P2: 'bg-orange-100 text-orange-800',
  P3: 'bg-yellow-100 text-yellow-800',
  P4: 'bg-green-100 text-green-800',
};

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Done': 'bg-green-100 text-green-800',
  'Blocked': 'bg-red-100 text-red-800',
};

const typeIcons = {
  bug: '🐛',
  task: '📋',
  story: '📖',
  epic: '🏆',
};

const IssueCard = ({ issue, onClick, view = 'list' }) => {
  const {
    key,
    title,
    type,
    status,
    priority,
    assignee,
    updatedAt,
  } = issue;

  const cardClasses = `
    bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow
    ${view === 'board' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
  `;

  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {type && (
              <span title={`Type: ${type}`} className="text-lg">
                {typeIcons[type.toLowerCase()] || '📄'}
              </span>
            )}
            <span className="text-sm font-mono text-gray-500">{key}</span>
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 truncate mb-2">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              label={status}
              className={statusColors[status]}
            />
            <Badge
              label={priority}
              className={priorityColors[priority]}
            />
          </div>
        </div>

        {view === 'list' && (
          <div className="flex flex-col items-end gap-2">
            {assignee && (
              <Avatar
                src={assignee.avatar}
                alt={assignee.name}
                size="sm"
                title={`Assigned to ${assignee.name}`}
              />
            )}
            <time
              dateTime={updatedAt}
              className="text-xs text-gray-500"
              title="Last updated"
            >
              {formattedDate}
            </time>
          </div>
        )}
      </div>

      {view === 'board' && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {assignee && (
            <div className="flex items-center gap-2">
              <Avatar
                src={assignee.avatar}
                alt={assignee.name}
                size="sm"
              />
              <span className="text-xs text-gray-500 truncate">
                {assignee.name}
              </span>
            </div>
          )}
          <time
            dateTime={updatedAt}
            className="text-xs text-gray-500"
            title="Last updated"
          >
            {formattedDate}
          </time>
        </div>
      )}
    </div>
  );
};

IssueCard.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['list', 'board']),
};

export default IssueCard; 