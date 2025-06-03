import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, ViewBoardsIcon, ProjectIcon,
  SprintIcon, TeamsIcon, SettingsIcon
} from '../common/Icons';

const Sidebar = ({ isMobile, isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location.pathname, isMobile, isOpen, onClose]);

  // Click outside detection for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        onClose();
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMobile, isOpen, onClose]);

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { id: 'projects', path: '/projects', icon: ProjectIcon, label: 'Projects' },
    { id: 'boards', path: '/board', icon: ViewBoardsIcon, label: 'Boards' },
    { id: 'sprints', path: '/sprints', icon: SprintIcon, label: 'Sprints' },
    { id: 'teams', path: '/teams', icon: TeamsIcon, label: 'Teams' },
    { id: 'settings', path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  // Animation variants for mobile sidebar
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const backdropVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={`
          bg-blue-600 text-white shadow-xl
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobile
            ? 'fixed top-0 left-0 h-screen z-40'
            : 'relative h-screen'
          }
        `}
        variants={isMobile ? sidebarVariants : {}}
        initial={isMobile ? "closed" : false}
        animate={isMobile ? (isOpen ? "open" : "closed") : false}
        style={{
          minHeight: '100vh',
          height: '100vh'
        }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-500 bg-blue-600">
          {!isCollapsed && (
            <span className="text-xl font-semibold text-white">SprintFlow</span>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-blue-700 transition-colors duration-150 text-blue-200 hover:text-white"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-blue-700 transition-colors duration-150 text-blue-200 hover:text-white"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ id, path, icon: Icon, label }) => (
              <NavLink
                key={id}
                to={path}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-all duration-150 ease-in-out
                  ${isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? label : ''}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`
                      h-5 w-5 flex-shrink-0 transition-colors duration-150
                      ${isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'}
                      ${isCollapsed ? '' : 'mr-3'}
                    `} />
                    {!isCollapsed && (
                      <span className="truncate">{label}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Profile */}
          <div className="border-t border-blue-500 p-4 bg-blue-600">
            {!isCollapsed ? (
              <div className="flex items-center p-3 rounded-md hover:bg-blue-700 transition-colors duration-150 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                  {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="ml-2">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-sm font-medium text-white shadow-sm hover:bg-blue-900 transition-colors duration-150 cursor-pointer"
                     title={`${user?.first_name} ${user?.last_name}`}>
                  {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            )}
          </div>
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;
