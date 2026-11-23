import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ListTodo, CheckCircle2, Clock, AlarmClock, Target, Briefcase, ChevronRight, CalendarClock, AlertCircle, Flame,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatsCard from '../../../components/ui/StatsCard'
import ChartCard from '../../../components/charts/ChartCard'
import ChartTooltip from '../../../components/charts/ChartTooltip'
import ActivityTimeline from '../../../components/common/ActivityTimeline'
import ProductivityCard from '../../../components/common/ProductivityCard'
import PageHeader from '../../../components/layout/PageHeader'
import Avatar from '../../../components/ui/Avatar'
import { StatusBadge } from '../../../components/ui/Badge'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import {
  visibleTasks, visibleLeads, visibleDeals, visibleActivities, taskStats, revenueByMonth, weeklyCompletion,
  leadStatusBreakdown, upcomingTasks,
} from '../../../utils/selectors'
import { formatCurrency, formatDateShort, isOverdue, cn } from '../../../utils/format'

const LEAD_COLORS = { new: '#3B82F6', contacted: '#F59E0B', qualified: '#7C3AED', converted: '#10B981', lost: '#EF4444' }
const AXIS = { stroke: 'transparent', tick: { fill: '#64748B', fontSize: 11 }, tickLine: false, axisLine: false }
const GRID = <CartesianGrid stroke="var(--line)" vertical={false} />

export default function UserDashboard() {
  const { currentUser } = useAuth()
  const { users, leads, deals, tasks, activities } = useCrm()
  const navigate = useNavigate()

  const data = useMemo(() => {
    const mine = visibleTasks(tasks, currentUser)
    const myLeads = visibleLeads(leads, currentUser)
    const myDeals = visibleDeals(deals, currentUser)
    const myActivities = visibleActivities(activities, currentUser)
    const stats = taskStats(mine)
    return {
      mine, myLeads, myDeals, myActivities, stats,
      salesSeries: revenueByMonth(myDeals, 6),
      weekSeries: weeklyCompletion(mine),
      leadBreakdown: leadStatusBreakdown(myLeads).filter((l) => l.value > 0),
      upcoming: upcomingTasks(mine, 5),
      openDealsValue: myDeals.filter((d) => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + Number(d.value || 0), 0),
      wonValue: myDeals.filter((d) => d.stage === 'won').reduce((s, d) => s + Number(d.value || 0), 0),
    }
  }, [tasks, leads, deals, activities, currentUser])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Personal Workspace"
        title={`${greeting}, ${currentUser?.name.split(' ')[0]} 👋`}
        subtitle="Your assigned work at a glance — only your records are shown."
        actions={(
          <Link to="/user/my-tasks" className="hidden text-[12px] font-semibold text-[var(--accent-link)] hover:text-ink sm:block">
            View my tasks <ChevronRight size={12} className="inline" />
          </Link>
        )}
      />

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard label="My Tasks" value={data.stats.total} icon={ListTodo} accent="purple" sub="Assigned to me" />
        <StatsCard label="Completed" value={data.stats.completed} icon={CheckCircle2} accent="green" sub={`${data.stats.pct}% completion rate`} />
        <StatsCard label="Pending" value={data.stats.pending + data.stats.inProgress} icon={Clock} accent="orange" sub="Awaiting your action" />
        <StatsCard label="Overdue" value={data.stats.overdue} icon={AlarmClock} accent="red" sub={data.stats.overdue > 0 ? 'Needs attention now' : 'Nothing overdue'} />
        <StatsCard label="My Leads" value={data.myLeads.length} icon={Target} accent="blue" sub="Assigned to me" />
        <StatsCard label="My Deals" value={data.myDeals.length} icon={Briefcase} accent="orange" sub={`${formatCurrency(data.openDealsValue, true)} open`} />
      </div>

      {/* ── Personal charts ────────────────────────────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <ChartCard title="My Sales Performance" subtitle="My won revenue by month" className="col-span-12 md:col-span-6 xl:col-span-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={40} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip content={<ChartTooltip currency />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent-solid)" strokeWidth={2.5} fill="var(--accent-solid)" fillOpacity={0.12} dot={{ r: 3, fill: '#93C5FD', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Task Completion" subtitle="Completed vs due, last 7 days" className="col-span-12 sm:col-span-6 md:col-span-6 xl:col-span-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="24%">
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={30} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Bar dataKey="assigned" name="Due" fill="#F59E0B" radius={[5, 5, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="My Lead Conversion" subtitle="Status of leads assigned to me" className="col-span-12 sm:col-span-6 xl:col-span-4">
          <div className="flex h-56 flex-col justify-center">
            {data.leadBreakdown.length === 0 ? (
              <p className="text-center text-xs text-muted">No leads assigned yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.leadBreakdown} dataKey="value" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={3} strokeWidth={2} stroke="#151A2E">
                    {data.leadBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={LEAD_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[11px] text-muted">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* ── Productivity + deadlines ───────────────────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <div className="card col-span-12 p-5 sm:col-span-6 md:col-span-5 xl:col-span-4">
          <ProductivityCard pct={data.stats.pct} completed={data.stats.completed} total={data.stats.total} label="My Productivity" />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Won revenue</p>
              <p className="mt-1 text-lg font-extrabold tabular-nums text-green">{formatCurrency(data.wonValue, true)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Open pipeline</p>
              <p className="mt-1 text-lg font-extrabold tabular-nums text-ink">{formatCurrency(data.openDealsValue, true)}</p>
            </div>
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="card col-span-12 p-5 sm:col-span-6 md:col-span-7 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13px] font-bold tracking-tight text-ink">
              <CalendarClock size={15} className="text-orange" /> Upcoming Deadlines
            </h3>
            <Link to="/user/my-tasks" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">My tasks <ChevronRight size={12} /></Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.upcoming.length === 0 && <li className="py-5 text-center text-xs text-muted">Nothing due — inbox zero. 🎉</li>}
            {data.upcoming.map((t) => {
              const overdue = isOverdue(t)
              return (
                <li key={t.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-tint p-2.5">
                  {overdue ? <AlarmClock size={14} className="shrink-0 text-red" /> : <span className="h-2 w-2 shrink-0 rounded-full bg-orange" />}
                  <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">{t.title}</p>
                  <span className={cn('shrink-0 text-[10px] font-bold', overdue ? 'text-red' : 'text-muted')}>{formatDateShort(t.dueDate)}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Assigned deals */}
        <div className="card col-span-12 p-5 md:col-span-12 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">My Active Deals</h3>
            <Link to="/user/my-deals" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">Board <ChevronRight size={12} /></Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.myDeals.filter((d) => !['won', 'lost'].includes(d.stage)).slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl border border-line bg-tint p-2.5">
                <Avatar name={d.customerName || d.title} color={['blue', 'purple', 'orange', 'green'][d.title.length % 4]} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink">{d.customerName || d.title}</p>
                  <p className="text-[9px] tabular-nums text-muted">{formatCurrency(d.value)} · close {formatDateShort(d.expectedClose)}</p>
                </div>
                <StatusBadge status={d.stage} />
              </li>
            ))}
            {data.myDeals.filter((d) => !['won', 'lost'].includes(d.stage)).length === 0 && (
              <li className="py-5 text-center text-xs text-muted">No open deals right now.</li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Assigned leads + activity feed ─────────────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <div className="card col-span-12 overflow-hidden md:col-span-5">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">My Assigned Leads</h3>
            <Link to="/user/my-leads" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">All <ChevronRight size={12} /></Link>
          </div>
          <ul className="divide-y divide-line">
            {data.myLeads.slice(0, 5).map((lead) => (
              <li key={lead.id} className="flex items-center gap-3 px-5 py-3">
                <Flame size={15} className="shrink-0 text-orange/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">{lead.name}</p>
                  <p className="truncate text-[10px] text-muted">{lead.company} · {lead.source}</p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
            {data.myLeads.length === 0 && <li className="px-5 py-6 text-center text-xs text-muted">No leads assigned yet.</li>}
          </ul>
        </div>

        <div className="card col-span-12 p-5 md:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">My Recent Activities</h3>
            <Link to="/user/my-activities" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">Full history <ChevronRight size={12} /></Link>
          </div>
          <div className="mt-2">
            <ActivityTimeline activities={data.myActivities.slice(0, 6)} users={users} compact emptyMessage="Your activity will appear here as you work." />
          </div>
        </div>
      </div>
    </div>
  )
}
