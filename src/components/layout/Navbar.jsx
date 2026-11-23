import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu, Search, Bell, ChevronDown, LogOut, Settings, User, Building2, Target, Briefcase, ListTodo,
  AlarmClock, CalendarClock, Handshake, Sun, Moon,
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { RoleBadge } from '../ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useCrm } from '../../context/CrmContext'
import { visibleTasks, visibleDeals, isDueSoon, closingSoonDeals } from '../../utils/selectors'
import { isOverdue, formatCurrency, formatDateShort } from '../../utils/format'
import { cn } from '../../utils/format'

export default function Navbar({ onMenuToggle, variant }) {
  const { currentUser, logout, isOwner } = useAuth()
  const { customers, leads, deals, tasks, settings, updateAppearance } = useCrm()
  const LIGHT_THEMES = ['porcelain', 'mist', 'sage']
  const isLight = LIGHT_THEMES.includes(settings?.appearance?.theme)
  const toggleTheme = () => updateAppearance({ theme: isLight ? 'midnight' : 'porcelain' })
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)

  const tasksPath = isOwner ? '/owner/tasks' : '/user/my-tasks'
  const dealsPath = isOwner ? '/owner/deals' : '/user/my-deals'
  const profilePath = isOwner ? '/owner/settings' : '/user/profile'
  const settingsPath = isOwner ? '/owner/settings' : '/user/settings'

  // ── Global search (scoped by role) ─────────────────────────────────────
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return null
    const scope = (list) => (isOwner ? list : list.filter((r) => r.assignedTo === currentUser?.id))
    const hits = []
    scope(customers).forEach((c) => {
      if ([c.name, c.company, c.email].some((v) => String(v).toLowerCase().includes(q))) {
        hits.push({ icon: Building2, label: c.name, sub: c.company, to: `${isOwner ? '/owner/customers' : '/user/my-customers'}?q=${encodeURIComponent(c.name)}` })
      }
    })
    scope(leads).forEach((l) => {
      if ([l.name, l.company, l.email].some((v) => String(v).toLowerCase().includes(q))) {
        hits.push({ icon: Target, label: l.name, sub: l.company, to: `${isOwner ? '/owner/leads' : '/user/my-leads'}?q=${encodeURIComponent(l.name)}` })
      }
    })
    scope(deals).forEach((d) => {
      if ([d.title, d.customerName].some((v) => String(v).toLowerCase().includes(q))) {
        hits.push({ icon: Briefcase, label: d.title, sub: formatCurrency(d.value), to: `${dealsPath}?q=${encodeURIComponent(d.customerName || d.title)}` })
      }
    })
    scope(tasks).forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        hits.push({ icon: ListTodo, label: t.title, sub: `Due ${formatDateShort(t.dueDate)}`, to: `${tasksPath}?q=${encodeURIComponent(t.title)}` })
      }
    })
    return hits.slice(0, 6)
  }, [query, customers, leads, deals, tasks, isOwner, currentUser, dealsPath, tasksPath])

  // ── Notifications from live data ───────────────────────────────────────
  const notifications = useMemo(() => {
    const mine = visibleTasks(tasks, currentUser)
    const myDeals = visibleDeals(deals, currentUser)
    const items = []
    mine.filter(isOverdue).slice(0, 3).forEach((t) =>
      items.push({ icon: AlarmClock, tone: 'text-red border-red/30 bg-red/10', title: `Overdue: ${t.title}`, sub: `Due ${formatDateShort(t.dueDate)}`, to: tasksPath }))
    mine.filter((t) => isDueSoon(t, 2)).slice(0, 3).forEach((t) =>
      items.push({ icon: CalendarClock, tone: 'text-orange border-orange/30 bg-orange/10', title: `Due soon: ${t.title}`, sub: `Due ${formatDateShort(t.dueDate)}`, to: tasksPath }))
    closingSoonDeals(myDeals, 7).slice(0, 2).forEach((d) =>
      items.push({ icon: Handshake, tone: 'text-blue border-blue/30 bg-blue/10', title: `Closing: ${d.title}`, sub: `${formatCurrency(d.value)} · ${formatDateShort(d.expectedClose)}`, to: dealsPath }))
    return items.slice(0, 6)
  }, [tasks, deals, currentUser, tasksPath, dealsPath])

  const notifCount = notifications.length

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-sidebar/80 px-3 backdrop-blur-xl sm:gap-4 sm:px-5">
      {/* Mobile hamburger */}
      <button onClick={onMenuToggle} className="icon-btn lg:hidden" aria-label="Toggle navigation">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => window.setTimeout(() => setSearchFocus(false), 150)}
          placeholder={isOwner ? 'Search customers, leads, deals, tasks…' : 'Search my records…'}
          aria-label="Global search"
          className="input h-10 rounded-xl border-line bg-tint pl-10 text-[13px]"
        />
        {searchFocus && results && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-secondary p-1.5 shadow-2xl shadow-black/60">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted">No matches for “{query.trim()}”</p>
            ) : (
              results.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={() => { navigate(r.to); setQuery('') }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-tint"
                >
                  <r.icon size={15} className="shrink-0 text-muted" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink">{r.label}</span>
                    <span className="block truncate text-[10px] text-muted">{r.sub}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
          title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {isLight ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        {/* Notifications */}
        <Dropdown
          align="right"
          panelClassName="w-80 max-w-[92vw] p-0"
          trigger={(
            <button className="icon-btn relative" aria-label={`Notifications, ${notifCount} unread`}>
              <Bell size={19} />
              {notifCount > 0 && (
                <span className="badge-pop absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[8px] font-extrabold text-white ring-2 ring-sidebar">
                  {notifCount}
                </span>
              )}
            </button>
          )}
        >
          {() => (
            <>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Notifications</p>
                {notifCount > 0 && <span className="rounded-md bg-red/15 px-1.5 py-0.5 text-[10px] font-bold text-red">{notifCount} new</span>}
              </div>
              <div className="max-h-96 overflow-y-auto p-1.5">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-muted">All caught up — nothing needs attention.</p>
                ) : (
                  notifications.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(n.to)}
                      className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-tint"
                    >
                      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border', n.tone)}>
                        <n.icon size={13} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-medium text-ink">{n.title}</span>
                        <span className="block text-[10px] text-muted">{n.sub}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Dropdown>

        <div className="hidden h-6 w-px bg-tint sm:block" />

        {/* Profile menu */}
        <Dropdown
          align="right"
          panelClassName="w-64"
          trigger={(
            <button className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-tint" aria-label="Account menu">
              <Avatar name={currentUser?.name} color={currentUser?.color} size="sm" />
              <span className="hidden text-left md:block">
                <span className="block text-[12px] font-bold leading-tight text-ink">{currentUser?.name.split(' ')[0]}</span>
                <span className="block text-[9px] font-semibold uppercase tracking-wider text-muted">{isOwner ? 'Owner' : 'Team User'}</span>
              </span>
              <ChevronDown size={14} className="hidden text-muted md:block" />
            </button>
          )}
        >
          {(close) => (
            <>
              <div className="border-b border-line px-3 py-2.5">
                <p className="truncate text-[13px] font-bold text-ink">{currentUser?.name}</p>
                <p className="truncate text-[11px] text-muted">{currentUser?.email}</p>
                <div className="mt-1.5"><RoleBadge role={currentUser?.role} /></div>
              </div>
              <div className="p-1">
                <DropdownItem icon={User} label={isOwner ? 'Company Settings' : 'My Profile'} onClick={() => { close(); navigate(profilePath) }} />
                <DropdownItem icon={Settings} label="Settings" onClick={() => { close(); navigate(settingsPath) }} />
              </div>
              <div className="border-t border-line p-1">
                <DropdownItem icon={LogOut} label="Sign out" danger onClick={() => { close(); logout(); navigate('/login', { replace: true }) }} />
              </div>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  )
}
