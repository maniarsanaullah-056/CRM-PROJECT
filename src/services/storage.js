// ── LocalStorage persistence layer ───────────────────────────────────────────
const PREFIX = 'vantage-crm::'
const VERSION = '1.0.0'
const VERSION_KEY = PREFIX + 'version'

const KEYS = {
  users: PREFIX + 'users',
  customers: PREFIX + 'customers',
  leads: PREFIX + 'leads',
  deals: PREFIX + 'deals',
  tasks: PREFIX + 'tasks',
  activities: PREFIX + 'activities',
  settings: PREFIX + 'settings',
  session: PREFIX + 'session',
}

export const loadSlice = (key, fallback) => {
  try {
    const raw = localStorage.getItem(KEYS[key])
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const saveSlice = (key, value) => {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch (err) {
    console.error('Failed to persist', key, err)
  }
}

export const removeSession = () => {
  try { localStorage.removeItem(KEYS.session); sessionStorage.removeItem(KEYS.session) } catch { /* noop */ }
}

export const loadSession = () => {
  try {
    const raw = localStorage.getItem(KEYS.session) || sessionStorage.getItem(KEYS.session)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const saveSession = (session, remember) => {
  try {
    removeSession()
    const store = remember ? localStorage : sessionStorage
    store.setItem(KEYS.session, JSON.stringify(session))
  } catch { /* noop */ }
}

export const getVersion = () => {
  try { return localStorage.getItem(VERSION_KEY) } catch { return null }
}

export const setVersion = () => {
  try { localStorage.setItem(VERSION_KEY, VERSION) } catch { /* noop */ }
}

export const applySeed = (seed) => {
  saveSlice('users', seed.users)
  saveSlice('customers', seed.customers)
  saveSlice('leads', seed.leads)
  saveSlice('deals', seed.deals)
  saveSlice('tasks', seed.tasks)
  saveSlice('activities', seed.activities)
  saveSlice('settings', seed.settings)
  setVersion()
}

export const isSeeded = () => getVersion() === VERSION
