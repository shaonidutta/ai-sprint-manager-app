import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SprintPlanningProvider } from './context/SprintPlanningContext'
import router from './routes'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SprintPlanningProvider>
        <RouterProvider router={router} />
      </SprintPlanningProvider>
    </AuthProvider>
  </StrictMode>,
)
