import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Badge, Avatar } from '../common';

const BoardList = ({ boards, isLoading, error }) => {
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterType, setFilterType] = useState('all');

  const getSortedBoards = () => {
    let filteredBoards = boards;
    
    // Apply type filter
    if (filterType !== 'all') {
      filteredBoards = boards.filter(b => b.type === filterType);
    }

    // Apply sorting
    return [...filteredBoards].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'issueCount':
          return b.issueCount - a.issueCount;
        case 'updatedAt':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
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

  const sortedBoards = getSortedBoards();

  return (
    <div className="space-y-6">
      {/* Filters and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Boards</option>
            <option value="scrum">Scrum</option>
            <option value="kanban">Kanban</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-500">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="name">Name</option>
            <option value="issueCount">Issue Count</option>
          </select>
        </div>
      </div>

      {/* Boards Grid */}
      {sortedBoards.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No boards found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterType === 'all'
              ? 'No boards available'
              : `No ${filterType} boards found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBoards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="block hover:bg-gray-50 transition duration-150"
            >
              <Card className="h-full">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{board.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{board.description}</p>
                    </div>
                    <Badge variant={board.type === 'scrum' ? 'blue' : 'green'}>
                      {board.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {board.issueCount} issues
                      </div>
                      {board.type === 'scrum' && board.activeSprint && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Sprint {board.activeSprint.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <div className="flex -space-x-2">
                      {board.recentMembers?.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.id}
                          src={member.avatarUrl}
                          alt={member.name}
                          size="small"
                          className="border-2 border-white"
                        />
                      ))}
                    </div>
                    {board.recentMembers?.length > 3 && (
                      <span className="ml-2 text-sm text-gray-500">
                        +{board.recentMembers.length - 3} more
                      </span>
                    )}
                    <span className="ml-auto text-sm text-gray-500">
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

BoardList.propTypes = {
  boards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.oneOf(['scrum', 'kanban']).isRequired,
    issueCount: PropTypes.number.isRequired,
    activeSprint: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
    recentMembers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        avatarUrl: PropTypes.string,
      })
    ),
    updatedAt: PropTypes.string.isRequired,
  })).isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default BoardList; 