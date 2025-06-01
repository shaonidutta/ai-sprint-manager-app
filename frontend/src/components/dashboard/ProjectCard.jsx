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
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleProjectClick}>
      <div className="p-6">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Project Avatar */}
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {getProjectInitials(project.name)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm text-neutral-500 uppercase tracking-wide">
                {project.project_key}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status || 'Active'}
          </span>
        </div>

        {/* Project Description */}
        {project.description && (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-neutral-900">
              {project.total_issues || 0}
            </div>
            <div className="text-xs text-neutral-500">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-neutral-900">
              {project.active_sprints || 0}
            </div>
            <div className="text-xs text-neutral-500">Sprints</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-neutral-900">
              {project.team_size || 1}
            </div>
            <div className="text-xs text-neutral-500">Members</div>
          </div>
        </div>

        {/* Project Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center space-x-2">
            {/* Team Avatars */}
            <div className="flex -space-x-1">
              {project.team_members?.slice(0, 3).map((member, index) => (
                <div
                  key={member.id || index}
                  className="w-6 h-6 bg-neutral-200 rounded-full border-2 border-white flex items-center justify-center"
                  title={`${member.first_name} ${member.last_name}`}
                >
                  <span className="text-xs font-medium text-neutral-600">
                    {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                  </span>
                </div>
              ))}
              {project.team_size > 3 && (
                <div className="w-6 h-6 bg-neutral-100 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-neutral-500">
                    +{project.team_size - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-neutral-500">
            Updated {formatDate(project.updated_at)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
