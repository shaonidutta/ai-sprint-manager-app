import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '../../components/common';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ProjectTeamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');

  // Fetch project and team data
  const fetchProjectAndTeam = async () => {
    try {
      setLoading(true);
      const [projectResponse, teamResponse] = await Promise.all([
        api.projects.getById(id),
        api.projects.getTeamMembers(id)
      ]);

      setProject(projectResponse.data.data.project);
      setTeamMembers(teamResponse.data.data.team_members || []);
      setCurrentUserRole(projectResponse.data.data.user_role);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project/team data:', err);
      setError('Failed to load project team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectAndTeam();
    }
  }, [id]);

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.projects.addTeamMember(id, {
        email: inviteEmail,
        role: inviteRole
      });
      
      // Refresh team data
      await fetchProjectAndTeam();
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('Developer');
      setError(null);
    } catch (err) {
      console.error('Failed to invite member:', err);
      setError('Failed to invite team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setSaving(true);
      await api.projects.updateTeamMember(id, userId, { role: newRole });
      
      // Update local state
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === userId
            ? { ...member, role: newRole }
            : member
        )
      );
      setError(null);
    } catch (err) {
      console.error('Failed to update member role:', err);
      setError('Failed to update member role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      setSaving(true);
      await api.projects.removeTeamMember(id, userId);
      
      // Update local state
      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      setError(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError('Failed to remove team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Developer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Helper function to check if current user should see role dropdowns
  const shouldShowRoleDropdown = () => {
    // Hide role dropdown for Admin users as per requirement
    // Show dropdown for Project Manager and Developer roles
    return currentUserRole && currentUserRole !== 'Admin';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <Card className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/projects" className="text-neutral-500 hover:text-neutral-700">
              Projects
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link to={`/projects/${id}`} className="text-neutral-500 hover:text-neutral-700">
              {project?.name}
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-neutral-900 font-medium">Team</span>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Team Management</h1>
          <p className="text-neutral-600">Manage team members and their roles</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
            Back to Project
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            Invite Member
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-error-200 bg-error-50">
          <p className="text-error-700">{error}</p>
        </Card>
      )}

      {/* Team Members */}
      <Card className="p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">
          Team Members ({teamMembers.length})
        </h2>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No team members</h3>
            <p className="text-neutral-600 mb-6">Get started by inviting your first team member.</p>
            <Button onClick={() => setShowInviteModal(true)}>
              Invite Team Member
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-medium">
                    {getInitials(member.first_name, member.last_name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-sm text-neutral-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>

                  {shouldShowRoleDropdown() ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      disabled={saving}
                      className="text-sm border border-neutral-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Developer">Developer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${getRoleColor(member.role)} border`}>
                      {member.role}
                    </span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={saving}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Invite Team Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={saving}
                  disabled={saving}
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamPage;
