import { useMemo, useState } from 'react'
import { Search, X, Activity, ShieldCheck } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Pagination from '../../../components/tables/Pagination'
import ActivityTimeline from '../../../components/common/ActivityTimeline'
import EmptyState from '../../../components/ui/EmptyState'
import { Select } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { visibleActivities } from '../../../utils/selectors'
import { cn } from '../../../utils/format'

const CATEGORIES = [
  { id: 'all', label: 'All activity' },
  { id: 'login', label: 'Sign-ins', match: ['login', 'logout', 'signup'] },
  { id: 'customer', label: 'Customers', match: ['customer'] },
  { id: 'lead', label: 'Leads', match: ['lead'] },
  { id: 'deal', label: 'Deals', match: ['deal'] },
  { id: 'task', label: 'Tasks', match: ['task'] },
  { id: 'team', label: 'Team', match: ['team'] },
  { id: 'settings', label: 'Settings & System', match: ['settings', 'system', 'profile'] },
]

export default function ActivitiesPage() {
  const { currentUser, isOwner } = useAuth()
  const { users, activities } = useCrm()

  const [category, setCategory] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const scoped = useMemo(() => {
    let list = visibleActivities(activities, currentUser)
    const cat = CATEGORIES.find((c) => c.id === category)
    if (cat?.match) list = list.filter((a) => cat.match.some((m) => a.action.startsWith(m)))
    if (isOwner && userFilter !== 'all') list = list.filter((a) => a.userId === userFilter)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((a) => [a.description, a.userName, a.action].some((v) => String(v).toLowerCase().includes(q)))
    return list
  }, [activities, currentUser, category, userFilter, query, isOwner])

  const totalPages = Math.max(1, Math.ceil(scoped.length / PAGE_SIZE))
  const pageItems = scoped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const teamUsers = users.filter((u) => u.role === 'user' || u.role === 'owner')

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Audit Trail"
        title={isOwner ? 'Company Activity Log' : 'My Activity'}
        subtitle={isOwner
          ? 'Every recorded action across the company — authored by whom, and when.'
          : 'Your personal history. Other members’ activity is private to them and the owner.'}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategory(c.id); setPage(1) }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all',
                category === c.id ? 'gradient-brand text-white' : 'bg-secondary/60 text-muted hover:bg-secondary hover:text-ink',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1) }} className="h-9 w-40 text-xs" aria-label="Filter by member">
              <option value="all">All members</option>
              {teamUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          )}
          <div className="relative w-44 sm:w-56">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              placeholder="Search activity…"
              className="input h-9 pl-9 text-[13px]"
              aria-label="Search activity"
            />
            {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Clear"><X size={14} /></button>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted">
            {isOwner ? <ShieldCheck size={14} className="text-green" /> : <Activity size={14} className="text-blue" />}
            {scoped.length} events{isOwner ? ' across the company' : ' in your history'}
          </p>
        </div>

        {pageItems.length === 0 ? (
          <EmptyState icon={Activity} title="No activity found" description="Try a different category or search term." />
        ) : (
          <ActivityTimeline activities={pageItems} users={users} />
        )}

        <div className="mt-4 flex justify-center border-t border-line pt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
