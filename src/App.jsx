import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { CrmProvider, useCrm } from './context/CrmContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute, { roleHome } from './routes/ProtectedRoute'
import OwnerLayout from './components/layout/OwnerLayout'
import UserLayout from './components/layout/UserLayout'

// Auth pages
import Login from './features/auth/pages/Login'
import Signup from './features/auth/pages/Signup'
import ForgotPassword from './features/auth/pages/ForgotPassword'

// Dashboards
import OwnerDashboard from './features/dashboard/pages/OwnerDashboard'
import UserDashboard from './features/dashboard/pages/UserDashboard'

// Feature pages
import CustomersPage from './features/customers/pages/CustomersPage'
import LeadsPage from './features/leads/pages/LeadsPage'
import DealsPage from './features/deals/pages/DealsPage'
import TasksPage from './features/tasks/pages/TasksPage'
import TeamManagementPage from './features/team/pages/TeamManagementPage'
import ReportsPage from './features/reports/pages/ReportsPage'
import ActivitiesPage from './features/activities/pages/ActivitiesPage'
import SettingsPage from './features/settings/pages/SettingsPage'
import ProfilePage from './features/settings/pages/ProfilePage'

const ACCENTS = {
  violet: '#6366F1',
  ocean: '#2563EB',
  emerald: '#059669',
  sunset: '#D97706',
}

/** Applies the persisted theme (data-theme on <html>) and optional accent override. */
function ThemeSync() {
  const { settings } = useCrm()
  const theme = settings?.appearance?.theme || 'porcelain'
  const accent = settings?.appearance?.accent || 'auto'
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    if (accent === 'auto') {
      root.style.removeProperty('--accent-from')
      root.style.removeProperty('--accent-to')
      root.style.removeProperty('--accent-solid')
    } else {
      const solid = ACCENTS[accent] || ACCENTS.violet
      root.style.setProperty('--accent-from', solid)
      root.style.setProperty('--accent-to', solid)
      root.style.setProperty('--accent-solid', solid)
    }
  }, [theme, accent])
  return null
}

/** Sends / and unknown paths to the correct home for the session role. */
function RoleRedirect() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to={roleHome(currentUser.role)} replace />
}

/** Logged-in users hitting /login bounce to their dashboard. */
function PublicOnly({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  if (currentUser) return <Navigate to={roleHome(currentUser.role)} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CrmProvider>
          <AuthProvider>
            <ThemeSync />
            <Routes>
              {/* Public */}
              <Route path="/" element={<RoleRedirect />} />
              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Owner tree */}
              <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/owner/dashboard" replace />} />
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="deals" element={<DealsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="team" element={<TeamManagementPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="activities" element={<ActivitiesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
              </Route>

              {/* Team user tree */}
              <Route path="/user" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/user/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="my-tasks" element={<TasksPage />} />
                <Route path="my-leads" element={<LeadsPage />} />
                <Route path="my-deals" element={<DealsPage />} />
                <Route path="my-customers" element={<CustomersPage />} />
                <Route path="my-activities" element={<ActivitiesPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
              </Route>

              {/* Unknown paths → role home */}
              <Route path="*" element={<RoleRedirect />} />
            </Routes>
          </AuthProvider>
        </CrmProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
