import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableIssueItem = ({ issue }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{issue.title}</h3>
          <p className="text-sm text-gray-600">
            {issue.issue_key} • {issue.status}
          </p>
        </div>
        {issue.story_points && (
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
            {issue.story_points} SP
          </span>
        )}
      </div>
    </div>
  );
};

export default SortableIssueItem; 