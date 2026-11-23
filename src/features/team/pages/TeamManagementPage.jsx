import { useMemo, useState } from 'react'
import {
  Users, UserPlus, Pencil, Eye, ShieldCheck, Mail, Phone, Calendar, TrendingUp, CheckCircle2, Briefcase, Target,
} from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Drawer from '../../../components/ui/Drawer'
import RoleGuard from '../../../components/common/RoleGuard'
import DataTable from '../../../components/tables/DataTable'
import Avatar from '../../../components/ui/Avatar'
import { RoleBadge } from '../../../components/ui/Badge'
import ActivityTimeline from '../../../components/common/ActivityTimeline'
import ProductivityCard from '../../../components/common/ProductivityCard'
import { FormField, Input, Select } from '../../../components/ui/Form'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { taskStats, productivityPct } from '../../../utils/selectors'
import { formatCurrency, formatDate, cn } from '../../../utils/format'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/
const EMPTY_FORM = { name: '', email: '', title: '', phone: '', password: '', status: 'active' }

export default function TeamManagementPage() {
  const { users, tasks, deals, leads, activities, addUser, updateUser, toggleUserStatus } = useCrm()
  const toast = useToast()

  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [detail, setDetail] = useState(null)

  const members = users.filter((u) => u.role === 'user')
  const filtered = statusFilter === 'all' ? members : members.filter((u) => u.status === statusFilter)

  const stats = useMemo(() => {
    const active = members.filter((u) => u.status === 'active').length
    const avgProductivity = members.length
      ? Math.round(members.reduce((s, u) => s + productivityPct(tasks, u.id), 0) / members.length)
      : 0
    const teamWon = deals.filter((d) => d.stage === 'won' && members.some((m) => m.id === d.assignedTo))
      .reduce((s, d) => s + Number(d.value || 0), 0)
    return { total: members.length, active, inactive: members.length - active, avgProductivity, teamWon }
  }, [members, tasks, deals])

  const memberMetrics = (member) => {
    const mine = tasks.filter((t) => t.assignedTo === member.id)
    const s = taskStats(mine)
    const won = deals.filter((d) => d.assignedTo === member.id && d.stage === 'won').reduce((sum, d) => sum + Number(d.value || 0), 0)
    const myLeads = leads.filter((l) => l.assignedTo === member.id).length
    const myDeals = deals.filter((d) => d.assignedTo === member.id).length
    return { ...s, won, leads: myLeads, deals: myDeals }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (member) => {
    setEditing(member)
    setForm({ name: member.name, email: member.email, title: member.title, phone: member.phone || '', password: '', status: member.status })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter the member name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email.'
    if (!editing && !PASSWORD_RE.test(form.password)) next.password = 'Min 8 characters, one uppercase letter and one number.'
    if (form.title.trim().length < 2) next.title = 'Please enter a job title.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = (e) => {
    e?.preventDefault()
    if (!validate()) return
    if (editing) {
      const result = updateUser(editing.id, { name: form.name.trim(), title: form.title.trim(), phone: form.phone.trim(), status: form.status })
      if (!result.ok) { toast.error(result.message); return }
      toast.success('Team member updated.')
    } else {
      const result = addUser({ name: form.name.trim(), email: form.email.trim(), title: form.title.trim(), phone: form.phone.trim(), password: form.password, status: form.status })
      if (!result.ok) { toast.error(result.message); return }
      toast.success('Team member added. Share their credentials securely.')
    }
    setModalOpen(false)
  }

  const toggleStatus = (member) => {
    const result = toggleUserStatus(member.id)
    if (!result.ok) { toast.error(result.message); return }
    toast.info(`${member.name} ${result.status === 'active' ? 'reactivated' : 'deactivated'}.`)
  }

  const columns = [
    {
      key: 'name', label: 'Member', sortable: true,
      render: (m) => (
        <span className="flex items-center gap-3">
          <Avatar name={m.name} color={m.color} size="sm" status={m.status} />
          <span>
            <span className="block text-[13px] font-semibold text-ink">{m.name}</span>
            <span className="block text-[10px] text-muted">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'title', label: 'Role', render: (m) => <span className="text-xs text-body">{m.title}</span> },
    {
      key: 'productivity', label: 'Productivity', sortable: false,
      render: (m) => {
        const pct = productivityPct(tasks, m.id)
        return (
          <span className="flex w-36 items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <span className="block h-full rounded-full bg-[var(--accent-solid)] transition-all duration-700" style={{ width: `${pct}%` }} />
            </span>
            <span className="text-[11px] font-bold tabular-nums text-muted">{pct}%</span>
          </span>
        )
      },
    },
    {
      key: 'won', label: 'Won Revenue',
      render: (m) => <span className="text-xs font-bold tabular-nums text-green">{formatCurrency(memberMetrics(m).won, true)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (m) => (
        <button
          role="switch"
          aria-checked={m.status === 'active'}
          onClick={() => toggleStatus(m)}
          className="group flex items-center gap-2"
          title={m.status === 'active' ? 'Deactivate account' : 'Activate account'}
        >
          <span className={cn('relative h-5 w-9 rounded-full transition-colors duration-300', m.status === 'active' ? 'bg-green' : 'bg-secondary')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300', m.status === 'active' ? 'left-[18px]' : 'left-0.5')} />
          </span>
          <span className={cn('text-[10px] font-bold uppercase tracking-wide', m.status === 'active' ? 'text-green' : 'text-muted')}>
            {m.status}
          </span>
        </button>
      ),
    },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (m) => (
        <span className="flex items-center justify-end gap-1">
          <button className="icon-btn h-8 w-8" title="View details" onClick={() => setDetail(m)}><Eye size={15} /></button>
          <button className="icon-btn h-8 w-8" title="Edit member" onClick={() => openEdit(m)}><Pencil size={15} /></button>
        </span>
      ),
    },
  ]

  return (
    <RoleGuard
      allow={['owner']}
      fallback={(
        <div className="card mx-auto mt-20 max-w-md p-10 text-center">
          <ShieldCheck size={36} className="mx-auto text-red" />
          <h2 className="mt-4 text-lg font-extrabold text-ink">Owner access required</h2>
          <p className="mt-1 text-sm text-muted">Team Management is restricted to the workspace owner.</p>
        </div>
      )}
    >
      <div className="animate-fade-up">
        <PageHeader
          breadcrumb="Owner Controls"
          title="Team Management"
          subtitle="Add, edit, activate or deactivate team accounts and inspect individual productivity."
          actions={<Button icon={UserPlus} onClick={openCreate}>Add Team Member</Button>}
        />

        {/* KPI strip */}
        <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total members', value: stats.total, Icon: Users, cls: 'text-ink' },
            { label: 'Active accounts', value: stats.active, Icon: ShieldCheck, cls: 'text-green' },
            { label: 'Avg productivity', value: `${stats.avgProductivity}%`, Icon: TrendingUp, cls: 'text-[var(--accent-soft)]' },
            { label: 'Team won revenue', value: formatCurrency(stats.teamWon, true), Icon: Briefcase, cls: 'text-green' },
          ].map(({ label, value, Icon, cls }) => (
            <div key={label} className="card px-4 py-3.5">
              <Icon size={15} className="text-faint" />
              <p className={cn('mt-1.5 truncate text-lg font-extrabold tabular-nums tracking-tight sm:text-xl', cls)}>{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['name', 'email', 'title']}
          searchPlaceholder="Search team members…"
          pageSize={8}
          emptyIcon={Users}
          emptyTitle="No team members"
          emptyDescription="Add your first team member to start delegating."
          toolbar={(
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-36 text-xs" aria-label="Filter by status">
              <option value="all">All accounts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          )}
        />

        {/* ── Add / edit modal ─────────────────────────────────────── */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? `Edit ${editing.name.split(' ')[0]}` : 'Add Team Member'}
          subtitle={editing ? 'Update role details and account status' : 'Create a Team User account'}
          footer={(
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>{editing ? 'Save changes' : 'Create account'}</Button>
            </>
          )}
        >
          <form onSubmit={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full name" required error={errors.name}>
              <Input value={form.name} onChange={set('name')} placeholder="John Carter" autoFocus error={!!errors.name} />
            </FormField>
            <FormField label="Work email" required error={errors.email} hint={editing ? 'Email cannot be changed.' : undefined}>
              <Input type="email" value={form.email} onChange={set('email')} placeholder="john@company.com" disabled={!!editing} error={!!errors.email} className={editing ? 'opacity-60' : ''} />
            </FormField>
            <FormField label="Job title" required error={errors.title}>
              <Input value={form.title} onChange={set('title')} placeholder="Account Executive" error={!!errors.title} />
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
            </FormField>
            <FormField label="Role">
              <Input value="Team User" disabled className="opacity-60" />
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>
            {!editing && (
              <FormField label="Temporary password" required error={errors.password} className="sm:col-span-2" hint="Min 8 characters, one uppercase letter, one number.">
                <Input type="text" value={form.password} onChange={set('password')} placeholder="TempPass1" autoComplete="off" error={!!errors.password} />
              </FormField>
            )}
          </form>
        </Modal>

        {/* ── Detail drawer ────────────────────────────────────────── */}
        <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name} subtitle={detail?.title}>
          {detail && (() => {
            const m = memberMetrics(detail)
            const mine = activities.filter((a) => a.userId === detail.id).slice(0, 5)
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar name={detail.name} color={detail.color} size="lg" status={detail.status} />
                  <div>
                    <RoleBadge role={detail.role} />
                    <p className="mt-1.5 text-[11px] text-muted">Joined {formatDate(detail.joinedAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {[[Mail, detail.email, `mailto:${detail.email}`], [Phone, detail.phone || '—', detail.phone ? `tel:${detail.phone}` : undefined], [Calendar, `Member since ${formatDate(detail.joinedAt)}`, undefined]].map(([Icon, value, href], i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-xl border border-line bg-tint px-4 py-2.5 text-body">
                      <Icon size={13} className="shrink-0 text-muted" />
                      {href ? <a href={href} className="truncate hover:text-ink">{value}</a> : <span className="truncate">{value}</span>}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-line bg-secondary/30 p-4">
                  <ProductivityCard pct={m.pct} completed={m.completed} total={m.total} label="Task productivity" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { Icon: CheckCircle2, label: 'Tasks done', value: m.completed, cls: 'text-green' },
                    { Icon: Target, label: 'Leads', value: m.leads, cls: 'text-orange' },
                    { Icon: Briefcase, label: 'Deals', value: m.deals, cls: 'text-blue' },
                  ].map(({ Icon, label, value, cls }) => (
                    <div key={label} className="rounded-xl border border-line bg-tint p-3 text-center">
                      <Icon size={15} className={cn('mx-auto', cls)} />
                      <p className="mt-1.5 text-lg font-extrabold tabular-nums text-ink">{value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Recent activity</p>
                  <ActivityTimeline activities={mine} users={users} compact emptyMessage="No activity recorded for this member." />
                </div>
              </div>
            )
          })()}
        </Drawer>
      </div>
    </RoleGuard>
  )
}
