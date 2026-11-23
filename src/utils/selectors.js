// ── Role-based data scoping & analytics ─────────────────────────────────────
// EVERY page reads through these selectors so a normal user can never see
// company-wide or other users' records — not even by crafting the render.
import { isOverdue } from './format'

export const isOwner = (user) => user?.role === 'owner'

export const scopeRecords = (records, user) => {
  if (!user) return []
  if (isOwner(user)) return records
  return records.filter((r) => r.assignedTo === user.id)
}

export const scopeActivities = (activities, user) => {
  if (!user) return []
  if (isOwner(user)) return activities
  return activities.filter((a) => a.userId === user.id)
}

export const visibleActivities = scopeActivities

export const visibleCustomers = (customers, user) => scopeRecords(customers, user)
export const visibleLeads = (leads, user) => scopeRecords(leads, user)
export const visibleDeals = (deals, user) => scopeRecords(deals, user)
export const visibleTasks = (tasks, user) => scopeRecords(tasks, user)

// ── Task / productivity metrics ─────────────────────────────────────────────
export const taskStats = (tasks) => {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const overdue = tasks.filter(isOverdue).length
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, inProgress, pending, overdue, pct }
}

export const productivityPct = (tasks, userId) => {
  const mine = userId ? tasks.filter((t) => t.assignedTo === userId) : tasks
  return taskStats(mine).pct
}

export const isDueSoon = (task, days = 3) => {
  if (task.status === 'completed' || !task.dueDate) return false
  const due = new Date(task.dueDate)
  const now = new Date()
  const limit = new Date(now.getTime() + days * 86400000)
  return due >= now && due <= limit
}

// ── Chart datasets ──────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const lastMonths = (n) => {
  const out = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push({ key: `${m.getFullYear()}-${m.getMonth()}`, label: MONTHS[m.getMonth()], year: m.getFullYear(), month: m.getMonth() })
  }
  return out
}

export const revenueByMonth = (deals, monthsBack = 6) => {
  const buckets = lastMonths(monthsBack)
  return buckets.map(({ key, label, year, month }) => ({
    name: label,
    revenue: deals
      .filter((d) => d.stage === 'won' && d.expectedClose && new Date(d.expectedClose).getFullYear() === year && new Date(d.expectedClose).getMonth() === month)
      .reduce((sum, d) => sum + Number(d.value || 0), 0),
  })).map((row, i) => ({ ...row, key: buckets[i].key }))
}

export const customerGrowth = (customers, monthsBack = 6) => {
  const buckets = lastMonths(monthsBack)
  return buckets.map(({ label, year, month }) => ({
    name: label,
    customers: customers.filter((c) => {
      if (!c.createdAt) return false
      const d = new Date(c.createdAt)
      return d.getFullYear() < year || (d.getFullYear() === year && d.getMonth() <= month)
    }).length,
  }))
}

export const weeklyCompletion = (tasks) => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayKey: d.toDateString(),
      completed: 0,
      assigned: 0,
    })
  }
  tasks.forEach((t) => {
    if (t.completedAt) {
      const key = new Date(t.completedAt).toDateString()
      const slot = days.find((d) => d.dayKey === key)
      if (slot) slot.completed += 1
    }
    if (t.dueDate) {
      const key = new Date(t.dueDate).toDateString()
      const slot = days.find((d) => d.dayKey === key)
      if (slot) slot.assigned += 1
    }
  })
  return days.map(({ name, completed, assigned }) => ({ name, completed, assigned }))
}

export const leadStatusBreakdown = (leads) => {
  const counts = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 }
  leads.forEach((l) => { if (counts[l.status] !== undefined) counts[l.status] += 1 })
  const label = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost' }
  return Object.entries(counts).map(([status, value]) => ({ status, name: label[status], value }))
}

export const dealsByStage = (deals) => {
  const order = ['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost']
  const label = { new: 'New', contacted: 'Contacted', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' }
  return order.map((stage) => ({
    name: label[stage],
    stage,
    deals: deals.filter((d) => d.stage === stage).length,
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + Number(d.value || 0), 0),
  }))
}

export const salesByMember = (users, deals) =>
  users
    .filter((u) => u.role === 'user')
    .map((u) => ({
      name: u.name.split(' ')[0],
      fullName: u.name,
      won: deals.filter((d) => d.assignedTo === u.id && d.stage === 'won').reduce((s, d) => s + Number(d.value || 0), 0),
      deals: deals.filter((d) => d.assignedTo === u.id && d.stage === 'won').length,
    }))

export const teamProductivity = (users, tasks) =>
  users
    .filter((u) => u.role === 'user')
    .map((u) => ({
      name: u.name.split(' ')[0],
      fullName: u.name,
      productivity: productivityPct(tasks, u.id),
      completed: tasks.filter((t) => t.assignedTo === u.id && t.status === 'completed').length,
      total: tasks.filter((t) => t.assignedTo === u.id).length,
    }))

export const activitiesByUser = (users, activities) =>
  users.map((u) => ({
    name: u.name.split(' ')[0],
    fullName: u.name,
    activities: activities.filter((a) => a.userId === u.id).length,
  }))

// ── KPI helpers ─────────────────────────────────────────────────────────────
export const winRate = (deals) => {
  const closed = deals.filter((d) => d.stage === 'won' || d.stage === 'lost').length
  if (!closed) return 0
  return Math.round((deals.filter((d) => d.stage === 'won').length / closed) * 100)
}

export const leadConversionRate = (leads) => {
  if (!leads.length) return 0
  return Math.round((leads.filter((l) => l.status === 'converted').length / leads.length) * 100)
}

export const avgDealSize = (deals) => {
  const won = deals.filter((d) => d.stage === 'won')
  if (!won.length) return 0
  return Math.round(won.reduce((s, d) => s + Number(d.value || 0), 0) / won.length)
}

export const totalRevenue = (deals) =>
  deals.filter((d) => d.stage === 'won').reduce((s, d) => s + Number(d.value || 0), 0)

export const pipelineValue = (deals) =>
  deals.filter((d) => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + Number(d.value || 0), 0)

export const upcomingTasks = (tasks, n = 5) =>
  [...tasks]
    .filter((t) => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, n)

export const closingSoonDeals = (deals, days = 7) => {
  const now = new Date()
  const limit = new Date(now.getTime() + days * 86400000)
  return deals.filter((d) => !['won', 'lost'].includes(d.stage) && d.expectedClose && new Date(d.expectedClose) >= now && new Date(d.expectedClose) <= limit)
}
