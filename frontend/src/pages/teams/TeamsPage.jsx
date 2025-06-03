import React, { useState, useEffect } from 'react';
import { SearchIcon } from '../../components/common/Icons';
import { Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

const TeamsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration - in real app this would come from API
  useEffect(() => {
    // Simulate loading team members
    setLoading(true);
    setTimeout(() => {
      setTeamMembers([
        {
          id: 1,
          name: 'Shaoni Dutta',
          initials: 'SD',
          email: 'shaoni@example.com',
          role: 'Project Manager',
          avatar: null
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

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
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <span>Manage users</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <span>Create team</span>
              </Button>
              <Button
                className="min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add people
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search teams"
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
        </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 group-hover:bg-blue-700 transition-colors duration-200">
                    {member.initials}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-200">
                    {member.name}
                  </h3>
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

        {/* Teams Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Teams</h2>
          
          {/* Empty State - matching the reference image */}
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Activate Windows</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Go to Settings to activate Windows.
              </p>
              <Button
                variant="outline"
                className="min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                Go to Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
