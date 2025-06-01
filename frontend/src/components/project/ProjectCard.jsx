import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: 'bg-green-100 text-green-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      Planning: 'bg-blue-100 text-blue-800',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block hover:bg-gray-50 transition duration-150"
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            </div>
            <span className={getStatusBadge(project.status)}>
              {project.status}
            </span>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {project.memberCount} members
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {project.activeSprintCount} active sprints
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {project.totalIssues} issues
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <div className="flex -space-x-2">
              {project.recentMembers?.slice(0, 3).map((member, index) => (
                <img
                  key={member.id}
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
              ))}
            </div>
            {project.recentMembers?.length > 3 && (
              <span className="ml-2 text-sm text-gray-500">
                +{project.recentMembers.length - 3} more
              </span>
            )}
            <span className="ml-auto text-sm text-gray-500">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    memberCount: PropTypes.number.isRequired,
    activeSprintCount: PropTypes.number.isRequired,
    totalIssues: PropTypes.number.isRequired,
    recentMembers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatarUrl: PropTypes.string,
      })
    ),
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProjectCard; 