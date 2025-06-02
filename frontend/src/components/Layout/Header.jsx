import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  SearchIcon, BellIcon, QuestionIcon,
  CreateIcon, MenuIcon
} from '../common/Icons/index.jsx';
import CreateProjectModal from '../dashboard/CreateProjectModal';
import { CreateIssueModal } from '../issues';
import { api } from '../../api';

const Header = ({ onMenuClick, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Refs for click outside detection
  const createMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setIsCreateMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsCreateMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isCreateMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCreateMenuOpen, isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate(result.redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreateProject = async (projectData) => {
    setCreateLoading(true);
    try {
      const response = await api.projects.create(projectData);
      const newProject = response.data.data.project;
      setShowCreateProjectModal(false);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateIssue = (issueData) => {
    // Issue creation will be handled by the modal
    setShowCreateIssueModal(false);
    // Optionally refresh the current page or update the issue list
  };

  const userMenuItems = [
    { label: 'Profile', path: '/profile', action: null },
    { label: 'Account settings', path: '/settings/account', action: null },
    { label: 'Sign out', path: null, action: handleLogout },
  ];

  const createMenuItems = [
    {
      label: 'Create project',
      action: () => {
        setIsCreateMenuOpen(false);
        setShowCreateProjectModal(true);
      }
    },
    {
      label: 'Create issue',
      action: () => {
        setIsCreateMenuOpen(false);
        setShowCreateIssueModal(true);
      }
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-50 relative">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left section with menu button */}
          <div className="flex items-center min-w-0">
            {isMobile && (
              <button
                onClick={onMenuClick}
                className="p-2 mr-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-150"
                aria-label="Open sidebar"
              >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" />
              </button>
            )}
            {/* Logo/Title */}
            <div className="flex-shrink-0 font-semibold text-lg text-gray-900 truncate">
              <span className="hidden sm:inline">Sprint Manager</span>
              <span className="sm:hidden">Sprint</span>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {/* Create button */}
            <div className="relative" ref={createMenuRef}>
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 shadow-sm min-w-0"
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
              >
                <CreateIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create</span>
              </button>

              {/* Create dropdown menu */}
              {isCreateMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {createMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Help - Hidden on small screens */}
            <button className="hidden sm:flex p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-150">
              <QuestionIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors duration-150 relative">
              <BellIcon className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-150 shadow-sm">
                  {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  {userMenuItems.map((item, index) => (
                    item.path ? (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        key={index}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          item.action();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSubmit={handleCreateProject}
        loading={createLoading}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={showCreateIssueModal}
        onClose={() => setShowCreateIssueModal(false)}
        boardId={null} // Will need to be passed from context or current board
        onIssueCreated={handleCreateIssue}
      />
    </header>
  );
};

export default Header;
