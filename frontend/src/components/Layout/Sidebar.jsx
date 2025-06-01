import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/constants';
import { 
  HomeIcon, ViewBoardsIcon, ProjectIcon, 
  SprintIcon, SettingsIcon, AIIcon,
  MenuIcon
} from '../common/Icons';

const Sidebar = ({ isMobile, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { projectId } = useParams();

  const getNavItems = (currentProjectId) => [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/projects', icon: ProjectIcon, label: 'Projects' },
    { path: '/board', icon: ViewBoardsIcon, label: 'Board' },
    { path: '/boards', icon: ViewBoardsIcon, label: 'Boards List' },
    { path: '/sprints', icon: SprintIcon, label: 'Sprints' },
    {
      path: currentProjectId ? `/projects/${currentProjectId}/ai-features` : '/ai-features',
      icon: AIIcon,
      label: 'AI Features',
      disabled: !currentProjectId
    },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const navItems = getNavItems(projectId);

  const sidebarClasses = `
    fixed md:relative bg-gray-900 text-white transition-all duration-300 ease-in-out h-full
    ${isCollapsed ? 'w-16' : 'w-64'}
    ${isMobile ? (isCollapsed ? '-left-16' : 'left-0') : ''}
    z-50
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!isCollapsed && (
            <span className="text-xl font-semibold">Sprint Manager</span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded hover:bg-gray-800"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-1">
            {navItems.map(({ path, icon: Icon, label, disabled }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm
                  ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  transition-colors duration-200
                `}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                  }
                }}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-800 p-4">
            {!isCollapsed ? (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
