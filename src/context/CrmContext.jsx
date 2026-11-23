// ── Central CRM store: data slices, CRUD, permissions, activity log ─────────
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { buildSeed } from '../data/seedData'
import { applySeed, isSeeded, loadSession, loadSlice, saveSlice } from '../services/storage'
import { uid } from '../utils/format'

const CrmContext = createContext(null)

let seedCache = null
const getSeed = () => (seedCache ||= buildSeed())

const initSlice = (key) => {
  if (!isSeeded()) applySeed(getSeed())
  return loadSlice(key, getSeed()[key])
}

export const LEAD_STATUS_LABELS = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost' }
export const DEAL_STAGE_LABELS = { new: 'New', contacted: 'Contacted', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' }
export const TASK_STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }

export function CrmProvider({ children }) {
  const [users, setUsers] = useState(() => initSlice('users'))
  const [customers, setCustomers] = useState(() => initSlice('customers'))
  const [leads, setLeads] = useState(() => initSlice('leads'))
  const [deals, setDeals] = useState(() => initSlice('deals'))
  const [tasks, setTasks] = useState(() => initSlice('tasks'))
  const [activities, setActivities] = useState(() => initSlice('activities'))
  const [settings, setSettings] = useState(() => initSlice('settings'))

  useEffect(() => { saveSlice('users', users) }, [users])
  useEffect(() => { saveSlice('customers', customers) }, [customers])
  useEffect(() => { saveSlice('leads', leads) }, [leads])
  useEffect(() => { saveSlice('deals', deals) }, [deals])
  useEffect(() => { saveSlice('tasks', tasks) }, [tasks])
  useEffect(() => { saveSlice('activities', activities) }, [activities])
  useEffect(() => { saveSlice('settings', settings) }, [settings])

  // Keep a fresh lookup of users for activity-log actor resolution
  const usersRef = useRef(users)
  useEffect(() => { usersRef.current = users }, [users])

  const sessionActor = () => {
    const s = loadSession()
    if (!s) return { id: 'system', name: 'System', role: 'system' }
    const u = usersRef.current.find((x) => x.id === s.userId)
    return { id: u?.id || s.userId, name: u?.name || 'Unknown User', role: u?.role || s.role }
  }

  /** Data-layer permission check — UI guards alone are never trusted. */
  const canTouch = useCallback((assignedTo) => {
    const s = loadSession()
    if (!s) return false
    if (s.role === 'owner') return true
    return assignedTo === s.userId
  }, [])

  const isOwnerSession = useCallback(() => loadSession()?.role === 'owner', [])

  const logActivity = useCallback((action, description, record = null) => {
    const actor = sessionActor()
    const entry = {
      id: uid(),
      userId: actor.id,
      userName: actor.name,
      action,
      description,
      record,
      timestamp: new Date().toISOString(),
    }
    setActivities((prev) => [entry, ...prev].slice(0, 300))
    return entry
  }, [])

  const ok = (data) => ({ ok: true, ...data })
  const fail = (message) => ({ ok: false, message })

  // ── Team users ────────────────────────────────────────────────────────────
  const addUser = useCallback((data) => {
    if (!isOwnerSession()) return fail('Only the owner can add team members.')
    const email = data.email.trim().toLowerCase()
    if (usersRef.current.some((u) => u.email.toLowerCase() === email)) return fail('An account with this email already exists.')
    const user = {
      id: uid(),
      name: data.name.trim(),
      email,
      password: data.password,
      role: 'user', // team members are always Team Users — owner role is never assignable
      title: data.title || 'Team Member',
      phone: data.phone || '',
      status: data.status || 'active',
      color: ['blue', 'green', 'orange', 'purple'][Math.floor(Math.random() * 4)],
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, user])
    logActivity('team.created', `Added team member ${user.name} (${user.title})`, user.id)
    return ok({ user })
  }, [isOwnerSession, logActivity])

  const createSignupUser = useCallback(({ name, email, password }) => {
    const normalized = email.trim().toLowerCase()
    if (usersRef.current.some((u) => u.email.toLowerCase() === normalized)) {
      return fail('An account with this email already exists.')
    }
    const user = {
      id: uid(),
      name: name.trim(),
      email: normalized,
      password,
      role: 'user',
      title: 'Team Member',
      phone: '',
      status: 'active',
      color: 'green',
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, user])
    return ok({ user })
  }, [])

  const updateUser = useCallback((id, patch) => {
    if (!isOwnerSession()) return fail('Only the owner can edit team members.')
    setUsers((prev) => prev.map((u) => {
      if (u.id !== id) return u
      const { role, password, id: _ignore, ...safe } = patch // never patch role/password/id here
      return { ...u, ...safe }
    }))
    const target = usersRef.current.find((u) => u.id === id)
    logActivity('team.updated', `Updated team member ${target?.name || id}`, id)
    return ok({})
  }, [isOwnerSession, logActivity])

  const toggleUserStatus = useCallback((id) => {
    if (!isOwnerSession()) return fail('Only the owner can activate or deactivate accounts.')
    const target = usersRef.current.find((u) => u.id === id)
    if (!target) return fail('User not found.')
    if (target.role === 'owner') return fail('The owner account cannot be deactivated.')
    const next = target.status === 'active' ? 'inactive' : 'active'
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: next } : u)))
    logActivity('team.updated', `${next === 'active' ? 'Activated' : 'Deactivated'} account for ${target.name}`, id)
    return ok({ status: next })
  }, [isOwnerSession, logActivity])

  // ── Customers ─────────────────────────────────────────────────────────────
  const addCustomer = useCallback((data) => {
    const actor = sessionActor()
    const customer = {
      id: uid(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '',
      company: data.company.trim(),
      location: data.location || '',
      assignedTo: data.assignedTo || actor.id,
      status: data.status || 'active',
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
    }
    setCustomers((prev) => [customer, ...prev])
    logActivity('customer.created', `Created customer ${customer.name} (${customer.company})`, customer.id)
    return ok({ customer })
  }, [logActivity])

  const updateCustomer = useCallback((id, patch) => {
    const target = customers.find((c) => c.id === id)
    if (!target) return fail('Customer not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only edit records assigned to you.')
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    logActivity('customer.updated', `Updated customer ${patch.name || target.name}`, id)
    return ok({})
  }, [customers, canTouch, logActivity])

  const deleteCustomer = useCallback((id) => {
    if (!isOwnerSession()) return fail('Only the owner can delete customers.')
    const target = customers.find((c) => c.id === id)
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    logActivity('customer.deleted', `Deleted customer ${target?.name || id}`, id)
    return ok({})
  }, [customers, isOwnerSession, logActivity])

  // ── Leads ─────────────────────────────────────────────────────────────────
  const addLead = useCallback((data) => {
    const actor = sessionActor()
    const lead = {
      id: uid(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '',
      company: data.company.trim(),
      source: data.source || 'Website',
      status: data.status || 'new',
      value: Number(data.value) || 0,
      assignedTo: data.assignedTo || actor.id,
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
    }
    setLeads((prev) => [lead, ...prev])
    logActivity('lead.created', `Added lead ${lead.name} (${lead.company})`, lead.id)
    return ok({ lead })
  }, [logActivity])

  const updateLead = useCallback((id, patch) => {
    const target = leads.find((l) => l.id === id)
    if (!target) return fail('Lead not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only edit leads assigned to you.')
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
    logActivity('lead.updated', `Updated lead ${patch.name || target.name}`, id)
    return ok({})
  }, [leads, canTouch, logActivity])

  const setLeadStatus = useCallback((id, status) => {
    const target = leads.find((l) => l.id === id)
    if (!target) return fail('Lead not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only update leads assigned to you.')
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    logActivity('lead.status', `Moved lead ${target.name} (${target.company}) to ${LEAD_STATUS_LABELS[status] || status}`, id)
    return ok({})
  }, [leads, canTouch, logActivity])

  const deleteLead = useCallback((id) => {
    if (!isOwnerSession()) return fail('Only the owner can delete leads.')
    const target = leads.find((l) => l.id === id)
    setLeads((prev) => prev.filter((l) => l.id !== id))
    logActivity('lead.deleted', `Deleted lead ${target?.name || id}`, id)
    return ok({})
  }, [leads, isOwnerSession, logActivity])

  // ── Deals ─────────────────────────────────────────────────────────────────
  const addDeal = useCallback((data) => {
    const actor = sessionActor()
    const deal = {
      id: uid(),
      title: data.title.trim(),
      customerName: data.customerName?.trim() || '',
      value: Number(data.value) || 0,
      stage: data.stage || 'new',
      assignedTo: data.assignedTo || actor.id,
      expectedClose: data.expectedClose || new Date(Date.now() + 14 * 86400000).toISOString(),
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
    }
    setDeals((prev) => [deal, ...prev])
    logActivity('deal.created', `Created deal “${deal.title}” (${DEAL_STAGE_LABELS[deal.stage]})`, deal.id)
    return ok({ deal })
  }, [logActivity])

  const updateDeal = useCallback((id, patch) => {
    const target = deals.find((d) => d.id === id)
    if (!target) return fail('Deal not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only edit deals assigned to you.')
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, value: patch.value !== undefined ? Number(patch.value) : d.value } : d)))
    logActivity('deal.updated', `Updated deal “${patch.title || target.title}”`, id)
    return ok({})
  }, [deals, canTouch, logActivity])

  const moveDealStage = useCallback((id, stage) => {
    const target = deals.find((d) => d.id === id)
    if (!target) return fail('Deal not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only move deals assigned to you.')
    if (target.stage === stage) return ok({})
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)))
    logActivity('deal.stage', `Moved deal “${target.title}” to ${DEAL_STAGE_LABELS[stage]}`, id)
    return ok({})
  }, [deals, canTouch, logActivity])

  const deleteDeal = useCallback((id) => {
    if (!isOwnerSession()) return fail('Only the owner can delete deals.')
    const target = deals.find((d) => d.id === id)
    setDeals((prev) => prev.filter((d) => d.id !== id))
    logActivity('deal.deleted', `Deleted deal “${target?.title || id}”`, id)
    return ok({})
  }, [deals, isOwnerSession, logActivity])

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = useCallback((data) => {
    if (!isOwnerSession()) return fail('Only the owner can create and assign tasks.')
    const assignee = usersRef.current.find((u) => u.id === data.assignedTo)
    const task = {
      id: uid(),
      title: data.title.trim(),
      description: data.description?.trim() || '',
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      assignedTo: data.assignedTo,
      assignedBy: sessionActor().id,
      dueDate: data.dueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: data.status === 'completed' ? new Date().toISOString() : null,
    }
    setTasks((prev) => [task, ...prev])
    logActivity('task.created', `Assigned “${task.title}” to ${assignee?.name || 'team member'}`, task.id)
    return ok({ task })
  }, [isOwnerSession, logActivity])

  const updateTask = useCallback((id, patch) => {
    const target = tasks.find((t) => t.id === id)
    if (!target) return fail('Task not found.')
    if (!isOwnerSession()) return fail('Only the owner can edit task details. Use status updates instead.')
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    logActivity('task.updated', `Updated task “${patch.title || target.title}”`, id)
    return ok({})
  }, [tasks, isOwnerSession, logActivity])

  const setTaskStatus = useCallback((id, status) => {
    const target = tasks.find((t) => t.id === id)
    if (!target) return fail('Task not found.')
    if (!canTouch(target.assignedTo)) return fail('You can only update tasks assigned to you.')
    const completedAt = status === 'completed' ? new Date().toISOString() : null
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, completedAt } : t)))
    logActivity(
      status === 'completed' ? 'task.completed' : 'task.updated',
      `${status === 'completed' ? 'Completed' : 'Updated'} task “${target.title}”${status !== 'completed' ? ` → ${TASK_STATUS_LABELS[status]}` : ''}`,
      id,
    )
    return ok({})
  }, [tasks, canTouch, logActivity])

  const deleteTask = useCallback((id) => {
    if (!isOwnerSession()) return fail('Only the owner can delete tasks.')
    const target = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    logActivity('task.deleted', `Deleted task “${target?.title || id}”`, id)
    return ok({})
  }, [tasks, isOwnerSession, logActivity])

  // ── Profile & settings ────────────────────────────────────────────────────
  const updateProfile = useCallback((id, patch) => {
    const s = loadSession()
    if (!s) return fail('Not signed in.')
    if (s.role !== 'owner' && s.userId !== id) return fail('You can only edit your own profile.')
    const { role, password, id: _ignore, status, ...safe } = patch
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...safe } : u)))
    const isSelf = s.userId === id
    logActivity('profile.updated', isSelf ? 'Updated personal profile' : 'Updated a team member profile', id)
    return ok({})
  }, [logActivity])

  const changePassword = useCallback((id, current, next) => {
    const s = loadSession()
    if (!s || (s.role !== 'owner' && s.userId !== id)) return fail('You can only change your own password.')
    const target = usersRef.current.find((u) => u.id === id)
    if (!target) return fail('Account not found.')
    if (target.password !== current) return fail('Current password is incorrect.')
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(next)) {
      return fail('New password must be at least 8 characters with one uppercase letter and one number.')
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: next } : u)))
    logActivity('profile.updated', 'Changed account password (demo)', id)
    return ok({})
  }, [logActivity])

  const updateCompany = useCallback((patch) => {
    if (!isOwnerSession()) return fail('Only the owner can edit company settings.')
    setSettings((prev) => ({ ...prev, company: { ...prev.company, ...patch } }))
    logActivity('settings.updated', 'Updated company profile settings', null)
    return ok({})
  }, [isOwnerSession, logActivity])

  const updateNotifications = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, ...patch } }))
    return ok({})
  }, [])

  const updateAppearance = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, appearance: { ...prev.appearance, ...patch } }))
    return ok({})
  }, [])

  // ── Reset demo data ───────────────────────────────────────────────────────
  const resetDemoData = useCallback(() => {
    if (!isOwnerSession()) return fail('Only the owner can reset demo data.')
    const seed = buildSeed()
    const actor = sessionActor()
    seed.activities = [
      { id: uid(), userId: actor.id, userName: actor.name, action: 'system.reset', description: 'Reset all demo data to defaults', record: null, timestamp: new Date().toISOString() },
      ...seed.activities,
    ]
    applySeed(seed)
    setUsers(seed.users)
    setCustomers(seed.customers)
    setLeads(seed.leads)
    setDeals(seed.deals)
    setTasks(seed.tasks)
    setActivities(seed.activities)
    setSettings(seed.settings)
    return ok({})
  }, [isOwnerSession])

  const value = {
    users, customers, leads, deals, tasks, activities, settings,
    logActivity,
    addUser, createSignupUser, updateUser, toggleUserStatus,
    addCustomer, updateCustomer, deleteCustomer,
    addLead, updateLead, setLeadStatus, deleteLead,
    addDeal, updateDeal, moveDealStage, deleteDeal,
    addTask, updateTask, setTaskStatus, deleteTask,
    updateProfile, changePassword, updateCompany, updateNotifications, updateAppearance,
    resetDemoData,
  }

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export const useCrm = () => {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm must be used within CrmProvider')
  return ctx
}
