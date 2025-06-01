import React from 'react';
import { Card } from '../common';

const BoardKanbanPreview = ({ board, issues = [], onClick, className = '' }) => {
  // Group issues by status
  const issuesByStatus = {
    'To Do': issues.filter(issue => issue.status === 'To Do'),
    'In Progress': issues.filter(issue => issue.status === 'In Progress'),
    'Done': issues.filter(issue => issue.status === 'Done')
  };

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'bg-neutral-100', issues: issuesByStatus['To Do'] },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100', issues: issuesByStatus['In Progress'] },
    { id: 'Done', title: 'Done', color: 'bg-green-100', issues: issuesByStatus['Done'] }
  ];

  const getBoardInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border border-neutral-200 hover:border-neutral-300 ${className}`}
      onClick={onClick}
    >
      {/* Board Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center font-medium">
          {getBoardInitials(board.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {board.name}
          </h3>
          <p className="text-sm text-neutral-500">
            Board
          </p>
        </div>
      </div>

      {/* Board Description */}
      {board.description && (
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {board.description}
        </p>
      )}

      {/* Mini Kanban Board */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} rounded-t-lg px-2 py-2 border-b border-neutral-200`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-neutral-700 truncate">{column.title}</h4>
                  <span className="text-xs bg-white text-neutral-600 px-1.5 py-0.5 rounded-full">
                    {column.issues.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="bg-neutral-50 rounded-b-lg p-2 min-h-[80px] flex flex-col">
                {column.issues.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-4 h-4 mx-auto mb-1 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs text-neutral-400">Empty</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {column.issues.slice(0, 3).map((issue) => (
                      <div
                        key={issue.id}
                        className="bg-white border border-neutral-200 rounded p-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h5 className="text-xs font-medium text-neutral-900 line-clamp-1">
                            {issue.title}
                          </h5>
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            issue.priority === 'P1' ? 'bg-red-100 text-red-700' :
                            issue.priority === 'P2' ? 'bg-orange-100 text-orange-700' :
                            issue.priority === 'P3' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {issue.priority || 'P4'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-mono">ISSUE-{issue.id}</span>
                          {issue.assignee_name && (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {issue.assignee_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {column.issues.length > 3 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-neutral-500">
                          +{column.issues.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board Footer */}
      <div className="flex items-center justify-between text-sm text-neutral-500 pt-2 border-t border-neutral-100">
        <span>Updated {formatDate(board.updated_at)}</span>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          <span>Kanban</span>
          <span>•</span>
          <span>{issues.length} issues</span>
        </div>
      </div>
    </Card>
  );
};

export default BoardKanbanPreview;
