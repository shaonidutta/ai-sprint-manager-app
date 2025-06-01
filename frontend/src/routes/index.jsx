import { createBrowserRouter } from 'react-router-dom';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import LandingPage from '../pages/landing/LandingPage';
import RootLayout from '../components/Layout/RootLayout';
import AppLayout from '../components/Layout/AppLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import SprintsListPage from '../pages/sprints/SprintsListPage';
import SprintPlanningPage from '../pages/sprints/SprintPlanningPage';
import JiraSprintPlanningPage from '../pages/sprints/JiraSprintPlanningPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import ProjectSettingsPage from '../pages/projects/ProjectSettingsPage';
import ProjectTeamPage from '../pages/projects/ProjectTeamPage';
import BoardKanbanPage from '../pages/board/BoardKanbanPage';
import ProfilePage from '../pages/profile/ProfilePage';
import OTPVerification from '../pages/auth/OTPVerification';
import AIFeaturesPage from '../pages/ai/AIFeaturesPage';
import ProtectedRoute from './ProtectedRoute';
import SprintPlanningPage from '../pages/ai/SprintPlanningPage';
import ScopeCreepPage from '../pages/ai/ScopeCreepPage';
import RiskAssessmentPage from '../pages/ai/RiskAssessmentPage';
import RetrospectivePage from '../pages/ai/RetrospectivePage';

export const routes = [
  {
    element: <RootLayout />,
    children: [
      // Public Routes
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/verify-otp',
        element: <OTPVerification />,
      },
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/dashboard',
                element: <Dashboard />,
              },
              {
                path: '/projects',
                element: <ProjectsListPage />,
              },
              {
                path: '/projects/:id',
                element: <ProjectDetailPage />,
              },
              {
                path: '/projects/:id/settings',
                element: <ProjectSettingsPage />,
              },
              {
                path: '/projects/:id/team',
                element: <ProjectTeamPage />,
              },
              {
                path: '/board',
                element: <BoardKanbanPage />,
              },
              {
                path: '/sprints',
                element: <SprintsListPage />,
              },
              {
                path: '/sprints/planning',
                element: <JiraSprintPlanningPage />,
              },
              {
                path: '/sprints/new',
                element: <SprintPlanningPage />,
              },
              {
                path: '/profile',
                element: <ProfilePage />,
              },
              {
                path: '/ai/dashboard/:projectId',
                element: <AIFeaturesPage />,
              },
              {
                path: '/ai/sprint-planning/:projectId',
                element: <SprintPlanningPage />,
              },
              {
                path: '/ai/scope-creep/:projectId',
                element: <ScopeCreepPage />,
              },
              {
                path: '/ai/risk-assessment/:projectId',
                element: <RiskAssessmentPage />,
              },
              {
                path: '/ai/retrospective/:projectId',
                element: <RetrospectivePage />,
              },
            ]
          }
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes);

export default router;