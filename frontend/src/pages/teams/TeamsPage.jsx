import React, { useState, useEffect } from 'react';
import { SearchIcon } from '../../components/common/Icons';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

const TeamsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all team members from user's projects
  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');

      // First get all projects user has access to
      const projectsResponse = await api.projects.getAll();
      const userProjects = projectsResponse.data.data.projects || [];
      setProjects(userProjects);

      // Then get team members from all projects
      const allTeamMembers = new Map(); // Use Map to avoid duplicates

      for (const project of userProjects) {
        try {
          const teamResponse = await api.projects.getTeamMembers(project.id);
          const projectTeamMembers = teamResponse.data.data.team_members || [];

          projectTeamMembers.forEach(member => {
            const key = member.id;
            if (!allTeamMembers.has(key)) {
              allTeamMembers.set(key, {
                id: member.id,
                name: `${member.first_name} ${member.last_name}`,
                initials: `${member.first_name?.charAt(0) || ''}${member.last_name?.charAt(0) || ''}`.toUpperCase(),
                email: member.email,
                role: member.role,
                avatar: member.avatar_url,
                projects: [project.name]
              });
            } else {
              // Add project to existing member
              const existingMember = allTeamMembers.get(key);
              if (!existingMember.projects.includes(project.name)) {
                existingMember.projects.push(project.name);
              }
            }
          });
        } catch (projectError) {
          console.warn(`Failed to fetch team for project ${project.id}:`, projectError);
        }
      }

      setTeamMembers(Array.from(allTeamMembers.values()));
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to load team data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-600 mt-1">Manage your team members and collaboration</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search team members"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-10 pr-10 py-3
                  border border-gray-300 rounded-lg
                  text-sm text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all duration-200 ease-in-out
                  hover:border-gray-400
                "
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="
                    absolute right-3 top-1/2 transform -translate-y-1/2
                    w-4 h-4 text-gray-500 hover:text-gray-700
                    transition-colors duration-200
                  "
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''} across {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
              <button
                onClick={fetchTeamData}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* People you work with Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">People you work with</h2>
          
          {loading ? (
            <div className="flex items-center space-x-4">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              </div>
              <div className="animate-pulse flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2 w-1/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:bg-blue-700 transition-colors duration-200">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Role:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        member.role === 'Project Manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500">Projects:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {member.projects.slice(0, 2).map((project, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {project}
                          </span>
                        ))}
                        {member.projects.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            +{member.projects.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No team members match your search criteria.' : 'Start by adding team members to collaborate.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
