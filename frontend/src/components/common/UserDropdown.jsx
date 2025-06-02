import React, { useState, useRef, useEffect } from 'react';

const UserDropdown = ({ 
  value, 
  onChange, 
  users = [], 
  placeholder = "Select assignee...",
  includeUnassigned = true,
  disabled = false,
  error = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const email = user.email || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Find selected user
  const selectedUser = users.find(user => user.id === value);

  // Get user display name
  const getUserDisplayName = (user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const handleSelect = (userId) => {
    onChange(userId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border rounded-lg transition-all duration-150
          ${disabled 
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedUser ? (
              <>
                {/* User Avatar */}
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {getUserInitials(selectedUser)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(selectedUser)}
                  </span>
                  {selectedUser.email && (
                    <span className="text-xs text-gray-500">{selectedUser.email}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Unassigned Avatar */}
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">{placeholder}</span>
              </>
            )}
          </div>
          
          {/* Dropdown Arrow */}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {/* Unassigned Option */}
            {includeUnassigned && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                  ${!value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Unassigned</span>
                </div>
              </button>
            )}

            {/* User Options */}
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                  ${value === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {getUserInitials(user)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getUserDisplayName(user)}
                    </span>
                    {user.email && (
                      <span className="text-xs text-gray-500">{user.email}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* No Results */}
            {filteredUsers.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default UserDropdown;
