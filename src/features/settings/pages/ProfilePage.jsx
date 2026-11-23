import { useNavigate, Link } from 'react-router-dom'
import { Mail, Phone, Briefcase, Calendar, LogOut, Pencil, CheckSquare, Target, CircleDollarSign } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Avatar from '../../../components/ui/Avatar'
import { RoleBadge } from '../../../components/ui/Badge'
import ActivityTimeline from '../../../components/common/ActivityTimeline'
import ProductivityCard from '../../../components/common/ProductivityCard'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { visibleTasks, visibleActivities, taskStats } from '../../../utils/selectors'
import { formatCurrency, formatDate } from '../../../utils/format'

export default function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const { users, tasks, deals, activities } = useCrm()
  const navigate = useNavigate()

  const mine = visibleTasks(tasks, currentUser)
  const stats = taskStats(mine)
  const wonValue = deals.filter((d) => d.assignedTo === currentUser?.id && d.stage === 'won').reduce((s, d) => s + Number(d.value || 0), 0)
  const myActivities = visibleActivities(activities, currentUser).slice(0, 6)

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Personal Workspace"
        title="My Profile"
        subtitle="Your identity, workload and recent footprint across the workspace."
        actions={
          <>
            <Link to="/user/settings"><Button variant="secondary" icon={Pencil}>Edit Profile</Button></Link>
            <Button variant="ghost" icon={LogOut} onClick={() => { logout(); navigate('/login', { replace: true }) }}>Sign out</Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Identity card */}
        <div className="card col-span-12 overflow-hidden md:col-span-4">
          <div className="h-28 border-b border-line bg-secondary" />
          <div className="flex flex-col items-center px-6 pb-6 text-center">
            <Avatar name={currentUser?.name} color={currentUser?.color} size="xl" status={currentUser?.status} className="-mt-10" />
            <h2 className="mt-4 text-xl font-extrabold tracking-tight text-ink">{currentUser?.name}</h2>
            <p className="mt-0.5 text-[13px] font-medium text-muted">{currentUser?.title}</p>
            <div className="mt-2 flex items-center gap-2"><RoleBadge role={currentUser?.role} /></div>

            <div className="mt-5 w-full space-y-2 text-left text-[12px]">
              <p className="flex items-center gap-2.5 rounded-xl border border-line bg-tint px-4 py-2.5 text-body"><Mail size={13} className="shrink-0 text-muted" />{currentUser?.email}</p>
              <p className="flex items-center gap-2.5 rounded-xl border border-line bg-tint px-4 py-2.5 text-body"><Phone size={13} className="shrink-0 text-muted" />{currentUser?.phone || 'No phone on file'}</p>
              <p className="flex items-center gap-2.5 rounded-xl border border-line bg-tint px-4 py-2.5 text-body"><Briefcase size={13} className="shrink-0 text-muted" />{currentUser?.title}</p>
              <p className="flex items-center gap-2.5 rounded-xl border border-line bg-tint px-4 py-2.5 text-body"><Calendar size={13} className="shrink-0 text-muted" />Joined {formatDate(currentUser?.joinedAt)}</p>
            </div>
          </div>
        </div>

        {/* Performance + activity */}
        <div className="col-span-12 space-y-4 md:col-span-8">
          <div className="card grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <ProductivityCard pct={stats.pct} completed={stats.completed} total={stats.total} label="Task productivity" />
            <div className="grid grid-cols-2 gap-3 self-center">
              {[
                { Icon: CheckSquare, label: 'Tasks done', value: stats.completed, cls: 'text-green' },
                { Icon: Target, label: 'Overdue', value: stats.overdue, cls: stats.overdue > 0 ? 'text-red' : 'text-muted' },
                { Icon: CircleDollarSign, label: 'Won revenue', value: formatCurrency(wonValue, true), cls: 'text-green' },
                { Icon: Briefcase, label: 'My deals', value: deals.filter((d) => d.assignedTo === currentUser?.id).length, cls: 'text-blue' },
              ].map(({ Icon, label, value, cls }) => (
                <div key={label} className="rounded-xl border border-line bg-tint p-3">
                  <Icon size={15} className={cls} />
                  <p className="mt-1.5 text-lg font-extrabold tabular-nums text-ink">{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-[13px] font-bold tracking-tight text-ink">Recent Activity</h3>
            <div className="mt-2">
              <ActivityTimeline activities={myActivities} users={users} compact emptyMessage="Your recent activity will appear here." />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
