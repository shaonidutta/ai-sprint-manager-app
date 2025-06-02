import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleProjectClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getProjectInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-150 cursor-pointer group hover:scale-[1.02]"
      onClick={handleProjectClick}
    >
      <div className="p-6">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Project Avatar */}
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">
                {getProjectInitials(project.name)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-150 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                {project.project_key}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)} flex-shrink-0`}>
            {project.status || 'Active'}
          </span>
        </div>

        {/* Project Description */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">
              {project.total_issues || 0}
            </div>
            <div className="text-xs text-gray-500 font-medium">Issues</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">
              {project.active_sprints || 0}
            </div>
            <div className="text-xs text-gray-500 font-medium">Sprints</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">
              {project.team_size || 1}
            </div>
            <div className="text-xs text-gray-500 font-medium">Members</div>
          </div>
        </div>

        {/* Project Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* Team Avatars */}
            <div className="flex -space-x-2">
              {project.team_members?.slice(0, 3).map((member, index) => (
                <div
                  key={member.id || `member-${index}`}
                  className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                  title={`${member.first_name} ${member.last_name}`}
                >
                  <span className="text-xs font-semibold text-gray-600">
                    {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                  </span>
                </div>
              ))}
              {project.team_size > 3 && (
                <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-500">
                    +{project.team_size - 3}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Updated {formatDate(project.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
