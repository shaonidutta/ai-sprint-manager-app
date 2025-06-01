import React from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Story: '📖',
  Bug: '🐛',
  Task: '📋',
  Epic: '🏆',
};

const IssueCard = ({ issue }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const {
    key,
    title,
    type,
    status,
    priority,
    assignee,
    updatedAt,
  } = issue;

  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{typeIcons[type] || '📄'}</span>
            <span className="text-sm font-mono text-neutral-500">{key}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                priorityColors[priority]
              }`}
            >
              {priority}
            </span>
            {issue.story_points && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {issue.story_points} pts
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
          {title}
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
                {issue.assignee_first_name.charAt(0)}
                {issue.assignee_last_name?.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-neutral-600">
              {issue.assignee_first_name} {issue.assignee_last_name}
            </span>
          </div>
        )}
      </div>

      {issue.status && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge
            label={status}
            className={statusColors[status]}
          />
        </div>
      )}

      {issue.assignee && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar
              src={issue.assignee.avatar}
              alt={issue.assignee.name}
              size="sm"
            />
            <span className="text-xs text-gray-500 truncate">
              {issue.assignee.name}
            </span>
          </div>
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
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    issue_type: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    story_points: PropTypes.number,
    assignee_first_name: PropTypes.string,
    assignee_last_name: PropTypes.string,
    updatedAt: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }).isRequired,
};

export default IssueCard; 