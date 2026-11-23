import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, Building2, Target, Briefcase, ListTodo, Users, BarChart3, Activity, Settings,
  User, X, LogOut,
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useCrm } from '../../context/CrmContext'
import { visibleTasks } from '../../utils/selectors'
import { cn } from '../../utils/format'

const OWNER_NAV = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/customers', icon: Building2, label: 'Customers' },
  { to: '/owner/leads', icon: Target, label: 'Leads' },
  { to: '/owner/deals', icon: Briefcase, label: 'Deals Pipeline' },
  { to: '/owner/tasks', icon: ListTodo, label: 'Tasks', badge: true },
  { to: '/owner/team', icon: Users, label: 'Team Management' },
  { to: '/owner/reports', icon: BarChart3, label: 'Reports & Analytics' },
  { to: '/owner/activities', icon: Activity, label: 'Activity Log' },
  { to: '/owner/settings', icon: Settings, label: 'Settings' },
]

const USER_NAV = [
  { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/user/my-tasks', icon: ListTodo, label: 'My Tasks', badge: true },
  { to: '/user/my-leads', icon: Target, label: 'My Leads' },
  { to: '/user/my-deals', icon: Briefcase, label: 'My Deals' },
  { to: '/user/my-customers', icon: Building2, label: 'My Customers' },
  { to: '/user/my-activities', icon: Activity, label: 'My Activities' },
  { to: '/user/reports', icon: BarChart3, label: 'My Reports' },
  { to: '/user/profile', icon: User, label: 'My Profile' },
  { to: '/user/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ variant, mobileOpen, onClose }) {
  const { currentUser, logout } = useAuth()
  const { tasks } = useCrm()
  const navigate = useNavigate()

  const nav = variant === 'owner' ? OWNER_NAV : USER_NAV
  const pendingCount = useMemo(
    () => visibleTasks(tasks, currentUser).filter((t) => t.status !== 'completed').length,
    [tasks, currentUser],
  )

  const content = (
    <div className="flex h-full w-[272px] flex-col border-r border-line bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <NavLink to={variant === 'owner' ? '/owner/dashboard' : '/user/dashboard'} onClick={onClose} className="flex items-center gap-3">
          <div className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold tracking-tight text-ink">Vantage<span className="gradient-text"> CRM</span></p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-faint">
              {variant === 'owner' ? 'Owner Console' : 'Personal Workspace'}
            </p>
          </div>
        </NavLink>
        <button onClick={onClose} className="icon-btn lg:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      {/* Section label */}
      <p className="px-5 pb-2 pt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-faint">
        {variant === 'owner' ? 'Company' : 'Menu'}
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-[var(--accent-soft)]' : ''} />
                <span className="flex-1">{label}</span>
                {badge && pendingCount > 0 && (
                  <span className="badge-pop flex h-5 min-w-5 items-center justify-center rounded-md bg-orange/15 px-1.5 text-[10px] font-bold tabular-nums text-orange ring-1 ring-orange/30">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user card + sign out */}
      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-tint p-2.5">
          <Avatar name={currentUser?.name} color={currentUser?.color} size="md" status={currentUser?.status} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{currentUser?.name}</p>
            <p className="truncate text-[10px] font-medium text-muted">{currentUser?.title}</p>
          </div>
          <button
            className="icon-btn h-8 w-8 shrink-0"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => { logout(); navigate('/login', { replace: true }) }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden h-full shrink-0 lg:block">{content}</aside>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? '' : 'pointer-events-none')} aria-hidden={!mobileOpen}>
        <div
          className={cn('absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onClose}
        />
        <div className={cn('absolute left-0 top-0 h-full shadow-2xl transition-transform duration-300 ease-out', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {content}
        </div>
      </div>
    </>
  )
}
