import { useAuth } from '../../context/AuthContext'

/** Component-level access check. Pages are also route-guarded; this is defense-in-depth. */
export default function RoleGuard({ allow = ['owner'], children, fallback = null }) {
  const { currentUser } = useAuth()
  if (!currentUser || !allow.includes(currentUser.role)) return fallback
  return children
}
