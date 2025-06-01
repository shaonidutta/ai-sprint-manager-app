import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  DndContext,
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
import { IssueCard } from "./";

const COLUMN_COLORS = {
  TODO: "bg-neutral-100",
  IN_PROGRESS: "bg-blue-50",
  IN_REVIEW: "bg-yellow-50",
  DONE: "bg-green-50",
};

const COLUMN_TITLES = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const Board = ({ issues, onIssueMove }) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeIssue = issues.find(issue => issue.id === active.id);
    const overIssue = issues.find(issue => issue.id === over.id);

    if (activeIssue && overIssue && activeIssue.status !== overIssue.status) {
      onIssueMove(activeIssue.id, overIssue.status);
    }
    
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Group issues by status
  const issuesByStatus = issues.reduce((acc, issue) => {
    if (!acc[issue.status]) {
      acc[issue.status] = [];
    }
    acc[issue.status].push(issue);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {Object.keys(COLUMN_TITLES).map((status) => (
        <div
          key={status}
          className={`rounded-lg p-4 ${COLUMN_COLORS[status]} min-h-[200px]`}
        >
          <h3 className="font-semibold mb-4 text-neutral-700">
            {COLUMN_TITLES[status]} ({issuesByStatus[status]?.length || 0})
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={(issuesByStatus[status] || []).map(issue => issue.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {(issuesByStatus[status] || []).map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    isDragging={activeId === issue.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ))}
    </div>
  );
};

Board.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  onIssueMove: PropTypes.func.isRequired,
};

export default Board; 