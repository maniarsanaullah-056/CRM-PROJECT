import { useMemo } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Trophy, Percent, CircleDollarSign, Flame, CheckCircle2, Target, Activity as ActivityIcon } from 'lucide-react'
import ChartCard from '../../../components/charts/ChartCard'
import ChartTooltip from '../../../components/charts/ChartTooltip'
import PageHeader from '../../../components/layout/PageHeader'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import {
  visibleDeals, visibleLeads, visibleTasks, visibleCustomers, revenueByMonth, leadStatusBreakdown, dealsByStage,
  salesByMember, teamProductivity, activitiesByUser, customerGrowth, weeklyCompletion, taskStats, winRate,
  leadConversionRate, avgDealSize, totalRevenue, pipelineValue,
} from '../../../utils/selectors'
import { formatCurrency, formatNumber } from '../../../utils/format'

const AXIS = { stroke: 'transparent', tick: { fill: '#64748B', fontSize: 11 }, tickLine: false, axisLine: false }
const GRID = <CartesianGrid stroke="var(--line)" vertical={false} />
const FUNNEL_COLORS = ['#3B82F6', '#F59E0B', '#7C3AED', '#10B981', '#EF4444']

function KpiChip({ icon: Icon, label, value, accent }) {
  const tones = {
    green: 'text-green border-green/25 bg-green/10',
    purple: 'text-[var(--accent-soft)] border-purple/25 bg-purple/10',
    blue: 'text-blue border-blue/25 bg-blue/10',
    orange: 'text-orange border-orange/25 bg-orange/10',
  }
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${tones[accent]}`}>
      <Icon size={18} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-base font-extrabold leading-tight tabular-nums text-ink sm:text-lg">{value}</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-70">{label}</p>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { currentUser, isOwner } = useAuth()
  const { users, customers, leads, deals, tasks, activities } = useCrm()

  const data = useMemo(() => {
    const scopedDeals = visibleDeals(deals, currentUser)
    const scopedLeads = visibleLeads(leads, currentUser)
    const scopedTasks = visibleTasks(tasks, currentUser)
    const scopedCustomers = visibleCustomers(customers, currentUser)
    const scopedActivities = isOwner ? activities : activities.filter((a) => a.userId === currentUser.id)

    return {
      scopedDeals, scopedLeads, scopedTasks, scopedCustomers, scopedActivities,
      stats: taskStats(scopedTasks),
      revenueSeries: revenueByMonth(scopedDeals, 6),
      growthSeries: customerGrowth(scopedCustomers, 6),
      salesPerf: salesByMember(users, deals),
      productivity: teamProductivity(users, tasks),
      stageSeries: dealsByStage(scopedDeals),
      leadBreakdown: leadStatusBreakdown(scopedLeads),
      weekly: weeklyCompletion(scopedTasks),
      activitySeries: activitiesByUser(users.filter((u) => u.role === 'user'), scopedActivities),
      winRate: winRate(scopedDeals),
      conversion: leadConversionRate(scopedLeads),
      avgDeal: avgDealSize(scopedDeals),
      wonRevenue: totalRevenue(scopedDeals),
      pipeline: pipelineValue(scopedDeals),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, customers, leads, deals, tasks, activities, currentUser])

  if (isOwner) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          breadcrumb="Company Intelligence"
          title="Reports & Analytics"
          subtitle="Company-wide performance across revenue, team productivity and pipeline health."
        />

        {/* KPI chips */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiChip icon={Trophy} label="Win rate" value={`${data.winRate}%`} accent="green" />
          <KpiChip icon={Percent} label="Lead conversion" value={`${data.conversion}%`} accent="purple" />
          <KpiChip icon={CircleDollarSign} label="Avg deal size" value={formatCurrency(data.avgDeal, true)} accent="blue" />
          <KpiChip icon={Flame} label="Open pipeline" value={formatCurrency(data.pipeline, true)} accent="orange" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <ChartCard title="Company Revenue Trend" subtitle="Won deal revenue by month" className="col-span-12 lg:col-span-7">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  {GRID}
                  <XAxis dataKey="name" {...AXIS} dy={6} />
                  <YAxis {...AXIS} width={44} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip content={<ChartTooltip currency />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent-solid)" strokeWidth={2.4} fill="var(--accent-solid)" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Customer Growth" subtitle="Cumulative customers over 6 months" className="col-span-12 sm:col-span-6 lg:col-span-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.growthSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  {GRID}
                  <XAxis dataKey="name" {...AXIS} dy={6} />
                  <YAxis {...AXIS} width={30} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="customers" name="Customers" stroke="#3B82F6" strokeWidth={2.4} dot={{ r: 3, fill: '#93C5FD' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Sales Performance by Rep" subtitle="Won revenue per team member" className="col-span-12 sm:col-span-6 lg:col-span-5">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesPerf} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="26%">
                  {GRID}
                  <XAxis dataKey="name" {...AXIS} dy={6} />
                  <YAxis {...AXIS} width={44} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                  <Tooltip content={<ChartTooltip currency />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="won" name="Won" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Team Productivity" subtitle="Task completion % per member" className="col-span-12 lg:col-span-7">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productivity} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
                  {GRID}
                  <XAxis type="number" domain={[0, 100]} {...AXIS} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" {...AXIS} width={52} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="productivity" name="Productivity %" fill="#7C3AED" radius={[0, 6, 6, 0]} maxBarSize={17} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Lead Conversion" subtitle="Pipeline distribution by status" className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="flex h-60 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.leadBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} strokeWidth={2} stroke="#151A2E">
                    {data.leadBreakdown.map((entry, i) => <Cell key={entry.status} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[10px] text-muted">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Deals by Stage" subtitle="Count and value per stage" className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stageSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="18%">
                  {GRID}
                  <XAxis dataKey="name" {...AXIS} dy={6} tick={{ fill: '#64748B', fontSize: 9 }} />
                  <YAxis {...AXIS} width={26} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="deals" name="Deals" fill="#F59E0B" radius={[5, 5, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Activity by Member" subtitle="Logged actions in the last 30 days" className="col-span-12 lg:col-span-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activitySeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="26%">
                  {GRID}
                  <XAxis dataKey="name" {...AXIS} dy={6} />
                  <YAxis {...AXIS} width={28} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="activities" name="Activities" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
          All figures computed live from workspace data · {formatNumber(data.scopedActivities.length)} events logged
        </p>
      </div>
    )
  }

  // ── Personal reports (user role) ─────────────────────────────────────────
  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Personal Insights"
        title="My Reports"
        subtitle="Your personal productivity, task and deal performance — scoped to you only."
      />

      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiChip icon={Trophy} label="My win rate" value={`${data.winRate}%`} accent="green" />
        <KpiChip icon={Percent} label="My conversion" value={`${data.conversion}%`} accent="purple" />
        <KpiChip icon={CircleDollarSign} label="My won revenue" value={formatCurrency(data.wonRevenue, true)} accent="blue" />
        <KpiChip icon={CheckCircle2} label="Tasks completed" value={`${data.stats.completed}/${data.stats.total}`} accent="orange" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <ChartCard title="My Revenue Trend" subtitle="My won deals by month" className="col-span-12 lg:col-span-7">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={44} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip content={<ChartTooltip currency />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent-solid)" strokeWidth={2.4} fill="var(--accent-solid)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="My Task Completion" subtitle="Last 7 days" className="col-span-12 sm:col-span-6 lg:col-span-5">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weekly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="24%">
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} />
                <YAxis {...AXIS} width={26} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Bar dataKey="assigned" name="Due" fill="#F59E0B" radius={[5, 5, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="My Lead Conversion" subtitle="Status of my assigned leads" className="col-span-12 sm:col-span-6 lg:col-span-5">
          <div className="flex h-60 items-center justify-center">
            {data.leadBreakdown.some((l) => l.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.leadBreakdown.filter((l) => l.value > 0)} dataKey="value" nameKey="name" innerRadius={46} outerRadius={68} paddingAngle={3} strokeWidth={2} stroke="#151A2E">
                    {data.leadBreakdown.map((entry, i) => <Cell key={entry.status} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-[10px] text-muted">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-muted">No leads assigned yet.</p>}
          </div>
        </ChartCard>

        <ChartCard title="My Deals by Stage" subtitle="Count per stage" className="col-span-12 lg:col-span-7">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stageSeries} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="18%">
                {GRID}
                <XAxis dataKey="name" {...AXIS} dy={6} tick={{ fill: '#64748B', fontSize: 9 }} />
                <YAxis {...AXIS} width={26} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="deals" name="Deals" fill="#7C3AED" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
