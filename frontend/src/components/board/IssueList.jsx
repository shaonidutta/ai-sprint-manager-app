import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IssueCard } from './';
import { Input, Select } from '../common';

const IssueList = ({ issues, onIssueClick, isLoading, error }) => {
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredAndSortedIssues = () => {
    let filteredIssues = [...issues];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredIssues = filteredIssues.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        (issue.issue_key && issue.issue_key.toLowerCase().includes(query)) ||
        issue.id.toString().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filteredIssues = filteredIssues.filter(issue => issue.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filteredIssues = filteredIssues.filter(issue => issue.priority === filterPriority);
    }

    // Apply sorting
    return filteredIssues.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return a.priority.localeCompare(b.priority);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updatedAt':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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

  const filteredIssues = getFilteredAndSortedIssues();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          id="search-issues"
          name="search"
          type="search"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="col-span-1 md:col-span-2"
        />

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'To Do', label: 'To Do' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Done', label: 'Done' },
            { value: 'Blocked', label: 'Blocked' },
          ]}
        />

        <Select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'P1', label: 'P1 - Highest' },
            { value: 'P2', label: 'P2 - High' },
            { value: 'P3', label: 'P3 - Medium' },
            { value: 'P4', label: 'P4 - Low' },
          ]}
        />
      </div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'updatedAt', label: 'Last Updated' },
              { value: 'priority', label: 'Priority' },
              { value: 'status', label: 'Status' },
              { value: 'title', label: 'Title' },
            ]}
          />
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Get started by creating a new issue'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  );
};

IssueList.propTypes = {
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
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default IssueList; 