// ── Simulated frontend authentication ─────────────────────────────────────────
// NOTE: This is a demo-only gate. LocalStorage sessions and client-side role
// checks are NOT production-grade authorization — see the login page notice.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useCrm } from './CrmContext'
import { loadSession, removeSession, saveSession } from '../services/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { users, logActivity, createSignupUser } = useCrm()
  const [session, setSession] = useState(() => loadSession())

  const currentUser = session ? users.find((u) => u.id === session.userId) ?? null : null

  // If the account vanished or was deactivated elsewhere, force sign-out.
  useEffect(() => {
    if (session && (!currentUser || currentUser.status !== 'active')) {
      removeSession()
      setSession(null)
    }
  }, [session, currentUser])

  const login = useCallback((email, password, remember) => {
    const normalized = email.trim().toLowerCase()
    const user = users.find((u) => u.email.toLowerCase() === normalized)
    if (!user) return { ok: false, message: 'No account found for that email.' }
    if (user.status !== 'active') return { ok: false, message: 'This account is deactivated. Contact your administrator.' }
    if (user.password !== password) return { ok: false, message: 'Incorrect password. Please try again.' }
    const next = { userId: user.id, role: user.role }
    saveSession(next, remember)
    setSession(next)
    logActivity('login', `${user.name} signed in to Vantage CRM`, null)
    return { ok: true, role: user.role }
  }, [users, logActivity])

  const signup = useCallback(({ name, email, password }) => {
    const result = createSignupUser({ name, email, password })
    if (!result.ok) return result
    const next = { userId: result.user.id, role: 'user' }
    saveSession(next, true)
    setSession(next)
    logActivity('signup', `${result.user.name} created an account`, result.user.id)
    return { ok: true, role: 'user' }
  }, [createSignupUser, logActivity])

  const logout = useCallback(() => {
    if (currentUser) logActivity('logout', `${currentUser.name} signed out`, null)
    removeSession()
    setSession(null)
  }, [currentUser, logActivity])

  const value = { currentUser, session, login, signup, logout, isOwner: currentUser?.role === 'owner' }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
