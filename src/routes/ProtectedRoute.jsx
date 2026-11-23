import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui/LoadingSpinner'

export const roleHome = (role) => (role === 'owner' ? '/owner/dashboard' : '/user/dashboard')

/** Route-level permission gate. Unauthorized direct navigation bounces to the user's own home. */
export default function ProtectedRoute({ children, role }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (role && currentUser.role !== role) {
    return <Navigate to={roleHome(currentUser.role)} replace />
  }
  return children ?? <PageLoader />
}
