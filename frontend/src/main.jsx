import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SprintPlanningProvider } from './context/SprintPlanningContext'
import { ToastProvider, useToast } from './components/common/Toast'
import router from './routes'
import './index.css'

// Import and setup global toast for error interceptor
import { setGlobalToast } from './api/interceptors/errorInterceptor'

// Component to set up global toast
const ToastSetup = () => {
  const { toast } = useToast();

  // Set global toast for error interceptor
  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  return null;
};

// Create a wrapper component to access toast context
const AppWithToast = () => {
  return (
    <ToastProvider>
      <ToastSetup />
      <RouterProvider router={router} />
    </ToastProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SprintPlanningProvider>
        <AppWithToast />
      </SprintPlanningProvider>
    </AuthProvider>
  </StrictMode>,
)
