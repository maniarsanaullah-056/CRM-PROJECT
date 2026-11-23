import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users, Target, Briefcase, DollarSign, UserCheck, ListTodo, ChevronRight, CalendarClock, AlertCircle, CheckCircle2,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatsCard from '../../../components/ui/StatsCard'
import ChartCard from '../../../components/charts/ChartCard'
import ChartTooltip from '../../../components/charts/ChartTooltip'
import ActivityTimeline from '../../../components/common/ActivityTimeline'
import PageHeader from '../../../components/layout/PageHeader'
import Avatar from '../../../components/ui/Avatar'
import { StatusBadge } from '../../../components/ui/Badge'
import { Select } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import {
  revenueByMonth, leadStatusBreakdown, salesByMember, teamProductivity, dealsByStage, upcomingTasks, totalRevenue,
} from '../../../utils/selectors'
import { formatCurrency, formatDateShort, isOverdue, cn } from '../../../utils/format'

const FUNNEL_COLORS = { new: '#3B82F6', contacted: '#F59E0B', qualified: '#7C3AED', converted: '#10B981', lost: '#EF4444' }
const STAGE_DOT = { new: '#3B82F6', contacted: '#F59E0B', proposal: '#7C3AED', negotiation: '#F59E0B', won: '#10B981', lost: '#EF4444' }

const AXIS = { stroke: 'transparent', tick: { fill: '#64748B', fontSize: 11 }, tickLine: false, axisLine: false }
const GRID = <CartesianGrid stroke="var(--line)" vertical={false} />

export default function OwnerDashboard() {
  const { currentUser } = useAuth()
  const { users, customers, leads, deals, tasks, activities, setTaskStatus } = useCrm()
  const toast = useToast()
  const navigate = useNavigate()
  const [range, setRange] = useState(6)

  const thirtyDaysAgo = Date.now() - 30 * 86400000
  const isRecent = (iso) => iso && new Date(iso).getTime() >= thirtyDaysAgo

  const data = useMemo(() => {
    const revenue = totalRevenue(deals)
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
    const revenueMTD = deals.filter((d) => d.stage === 'won' && new Date(d.expectedClose) >= monthStart)
      .reduce((s, d) => s + Number(d.value || 0), 0)
    const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    const revenuePrev = deals.filter((d) => d.stage === 'won' && new Date(d.expectedClose) >= prevMonthStart && new Date(d.expectedClose) < monthStart)
      .reduce((s, d) => s + Number(d.value || 0), 0)
    const revDelta = revenuePrev === 0 ? (revenueMTD > 0 ? 100 : 0) : Math.round(((revenueMTD - revenuePrev) / revenuePrev) * 100)

    return {
      revenue,
      revDelta,
      revenueSeries: revenueByMonth(deals, range),
      leadBreakdown: leadStatusBreakdown(leads),
      salesPerf: salesByMember(users, deals),
      productivity: teamProductivity(users, tasks),
      pipeline: dealsByStage(deals),
      recentActivities: activities.slice(0, 6),
      recentCustomers: [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      topPerformers: salesByMember(users, deals).sort((a, b) => b.won - a.won),
      upcoming: upcomingTasks(tasks, 5),
      totalCustomers: customers.length,
      totalLeads: leads.length,
      totalDeals: deals.length,
      activeTeam: users.filter((u) => u.role === 'user' && u.status === 'active').length,
      pendingTasks: tasks.filter((t) => t.status !== 'completed').length,
      overdueTasks: tasks.filter(isOverdue).length,
      newCustomers30: customers.filter((c) => isRecent(c.createdAt)).length,
      newLeads30: leads.filter((l) => isRecent(l.createdAt)).length,
      wonDeals30: deals.filter((d) => d.stage === 'won' && isRecent(d.expectedClose)).length,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, customers, leads, deals, tasks, activities, range])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const maxPipeline = Math.max(...data.pipeline.map((p) => p.deals), 1)

  const memberName = (id) => users.find((u) => u.id === id)?.name || 'Unassigned'

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Owner Console"
        title={`${greeting}, ${currentUser?.name.split(' ')[0]} 👋`}
        subtitle={`Here’s the company pulse for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`}
        actions={(
          <Select value={range} onChange={(e) => setRange(Number(e.target.value))} className="h-9 w-44 text-xs" aria-label="Chart date range">
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </Select>
        )}
      />

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard label="Total Customers" value={data.totalCustomers} icon={Users} accent="purple" delta={`+${data.newCustomers30} this month`} />
        <StatsCard label="Total Leads" value={data.totalLeads} icon={Target} accent="blue" delta={`+${data.newLeads30} this month`} />
        <StatsCard label="Total Deals" value={data.totalDeals} icon={Briefcase} accent="orange" delta={`+${data.wonDeals30} won (30d)`} />
        <StatsCard label="Total Revenue" value={data.revenue} format={(v) => formatCurrency(v, true)} icon={DollarSign} accent="green" delta={`${data.revDelta >= 0 ? '+' : ''}${data.revDelta}% vs last month`} deltaTone={data.revDelta >= 0 ? 'green' : 'red'} />
        <StatsCard label="Active Team" value={data.activeTeam} icon={UserCheck} accent="blue" sub={`${users.filter((u) => u.role === 'user').length} total members`} />
        <StatsCard label="Pending Tasks" value={data.pendingTasks} icon={ListTodo} accent="red" delta={data.overdueTasks > 0 ? `${data.overdueTasks} overdue` : 'None overdue'} deltaTone={data.overdueTasks > 0 ? 'red' : 'green'} />
      </div>

      {/* ── Revenue + lead conversion ──────────────────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <ChartCard title="Monthly Revenue" subtitle="Won deals by closing month" className="col-span-12 xl:col-span-8">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={44} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip content={<ChartTooltip currency />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent-solid)" strokeWidth={2.5} fill="var(--accent-solid)" fillOpacity={0.12} dot={{ r: 3, fill: 'var(--accent-link)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Lead Conversion" subtitle="Distribution across pipeline stages" className="col-span-12 sm:col-span-6 xl:col-span-4">
          <div className="flex h-64 flex-col items-center justify-center sm:h-72">
            <ResponsiveContainer width="100%" height="78%">
              <PieChart>
                <Pie data={data.leadBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={2} stroke="#151A2E">
                  {data.leadBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={FUNNEL_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[11px] text-muted">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Sales performance + team productivity ──────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <ChartCard title="Sales Performance" subtitle="Won revenue by team member" className="col-span-12 md:col-span-7">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesPerf} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={44} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip content={<ChartTooltip currency />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="won" name="Won revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Team Productivity" subtitle="Task completion rate per member" className="col-span-12 md:col-span-5">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productivity} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
                {GRID}
                <XAxis type="number" domain={[0, 100]} {...AXIS} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" {...AXIS} width={52} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="productivity" name="Productivity %" fill="#7C3AED" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Pipeline + upcoming tasks + top performers ─────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        {/* Pipeline */}
        <div className="card col-span-12 p-5 md:col-span-6 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">Sales Pipeline</h3>
            <Link to="/owner/deals" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">
              Open board <ChevronRight size={12} />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {data.pipeline.map((stage) => (
              <button
                key={stage.stage}
                onClick={() => navigate('/owner/deals')}
                className="group flex w-full items-center gap-3 rounded-xl border border-line bg-tint px-3 py-2.5 text-left transition-all hover:border-line hover:bg-tint"
              >
                <span className="h-8 w-1.5 rounded-full" style={{ background: STAGE_DOT[stage.stage] }} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-body">{stage.name}</span>
                    <span className="text-[10px] font-bold tabular-nums text-muted">{stage.deals} deal{stage.deals === 1 ? '' : 's'}</span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{ width: `${(stage.deals / maxPipeline) * 100}%`, background: STAGE_DOT[stage.stage] }}
                    />
                  </span>
                </span>
                <span className="w-16 shrink-0 text-right text-[11px] font-bold tabular-nums text-body">{formatCurrency(stage.value, true)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div className="card col-span-12 p-5 sm:col-span-6 md:col-span-6 xl:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13px] font-bold tracking-tight text-ink">
              <CalendarClock size={15} className="text-orange" /> Upcoming Tasks
            </h3>
            <Link to="/owner/tasks" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {data.upcoming.length === 0 && <li className="py-6 text-center text-xs text-muted">No open tasks with due dates.</li>}
            {data.upcoming.map((task) => {
              const overdue = isOverdue(task)
              return (
                <li key={task.id} className="flex items-start gap-2.5 rounded-xl border border-line bg-tint p-2.5">
                  <button
                    onClick={() => { setTaskStatus(task.id, 'completed'); toast.success('Task marked complete.') }}
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-line text-transparent transition-all hover:border-green hover:bg-green/20 hover:text-green"
                    aria-label="Mark task complete"
                  >
                    <CheckCircle2 size={13} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium leading-snug text-ink">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide">
                      <span className="text-muted">{memberName(task.assignedTo)}</span>
                      <span className={cn('flex items-center gap-1', overdue ? 'text-red' : 'text-muted')}>
                        {overdue && <AlertCircle size={9} />}
                        {overdue ? 'Overdue' : 'Due'} {formatDateShort(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Top performers */}
        <div className="card col-span-12 p-5 sm:col-span-6 xl:col-span-4">
          <h3 className="text-[13px] font-bold tracking-tight text-ink">Top Performing Members</h3>
          <ul className="mt-4 space-y-3.5">
            {data.topPerformers.map((p, i) => {
              const max = Math.max(...data.topPerformers.map((x) => x.won), 1)
              return (
                <li key={p.fullName} className="flex items-center gap-3">
                  <span className="w-4 text-center text-[11px] font-extrabold text-faint">{i + 1}</span>
                  <Avatar name={p.fullName} color={users.find((u) => u.name === p.fullName)?.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[12px] font-semibold text-ink">{p.fullName}</p>
                      <p className="shrink-0 text-[11px] font-bold tabular-nums text-green">{formatCurrency(p.won, true)}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-green/80 transition-all duration-700" style={{ width: `${(p.won / max) * 100}%` }} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* ── Recent customers + activities ──────────────────────────── */}
      <div className="stagger mt-4 grid grid-cols-12 gap-4">
        <div className="card col-span-12 overflow-hidden md:col-span-5">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">Recent Customers</h3>
            <Link to="/owner/customers" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {data.recentCustomers.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-tint">
                <Avatar name={c.name} color={['purple', 'blue', 'green', 'orange'][c.name.length % 4]} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-[10px] text-muted">{c.company}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={c.status} />
                  <p className="mt-1 text-[9px] font-medium text-faint">{formatDateShort(c.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card col-span-12 p-5 md:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">Recent Company Activities</h3>
            <Link to="/owner/activities" className="flex items-center gap-0.5 text-[11px] font-semibold text-[var(--accent-link)] hover:text-ink">
              Full log <ChevronRight size={12} />
            </Link>
          </div>
          <div className="mt-2">
            <ActivityTimeline activities={data.recentActivities} users={users} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
