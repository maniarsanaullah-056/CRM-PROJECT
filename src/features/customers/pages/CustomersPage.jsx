import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Building2, Plus, Eye, Pencil, Trash2, Users, Download, MapPin, Mail, Phone, Calendar, Briefcase,
} from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Drawer from '../../../components/ui/Drawer'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import DataTable from '../../../components/tables/DataTable'
import Avatar from '../../../components/ui/Avatar'
import { StatusBadge } from '../../../components/ui/Badge'
import { FormField, Input, Select } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { visibleCustomers, visibleDeals } from '../../../utils/selectors'
import { downloadCsv } from '../../../utils/exporters'
import { formatCurrency, formatDate } from '../../../utils/format'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EMPTY_FORM = { name: '', email: '', phone: '', company: '', location: '', status: 'active', assignedTo: '' }

export default function CustomersPage() {
  const { currentUser, isOwner } = useAuth()
  const { users, customers, deals, addCustomer, updateCustomer, deleteCustomer } = useCrm()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [detail, setDetail] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const teamUsers = users.filter((u) => u.role === 'user')
  const memberById = (id) => users.find((u) => u.id === id)

  const scoped = useMemo(() => {
    let list = visibleCustomers(customers, currentUser)
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter)
    if (isOwner && assigneeFilter !== 'all') list = list.filter((c) => c.assignedTo === assigneeFilter)
    return list
  }, [customers, currentUser, statusFilter, assigneeFilter, isOwner])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, assignedTo: isOwner ? (teamUsers.find((u) => u.status === 'active')?.id || '') : currentUser.id })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (customer) => {
    setEditing(customer)
    setForm({
      name: customer.name, email: customer.email, phone: customer.phone, company: customer.company,
      location: customer.location, status: customer.status, assignedTo: customer.assignedTo,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter the customer name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email.'
    if (form.company.trim().length < 2) next.company = 'Please enter a company.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = (e) => {
    e?.preventDefault()
    if (!validate()) return
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company.trim(),
      assignedTo: isOwner ? form.assignedTo : currentUser.id,
    }
    const result = editing ? updateCustomer(editing.id, payload) : addCustomer(payload)
    if (!result.ok) { toast.error(result.message); return }
    toast.success(editing ? 'Customer updated.' : 'Customer added.')
    setModalOpen(false)
  }

  const onDelete = (id) => {
    const result = deleteCustomer(id)
    if (!result.ok) { toast.error(result.message); return }
    toast.success('Customer deleted.')
    setDetail(null)
  }

  const exportCsv = () => {
    downloadCsv('customers.csv',
      [{ label: 'Name', value: (r) => r.name }, { label: 'Email', value: (r) => r.email }, { label: 'Phone', value: (r) => r.phone },
       { label: 'Company', value: (r) => r.company }, { label: 'Location', value: (r) => r.location },
       { label: 'Assigned To', value: (r) => memberById(r.assignedTo)?.name || 'Unassigned' },
       { label: 'Status', value: (r) => r.status }, { label: 'Created', value: (r) => formatDate(r.createdAt) }],
      scoped)
    toast.info('Customers exported to CSV.')
  }

  const canModify = (c) => isOwner || c.assignedTo === currentUser?.id

  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (c) => (
        <button className="flex items-center gap-3 text-left" onClick={() => setDetail(c)}>
          <Avatar name={c.name} color={['purple', 'blue', 'green', 'orange'][c.name.length % 4]} size="sm" />
          <span>
            <span className="block text-[13px] font-semibold text-ink hover:text-ink">{c.name}</span>
            <span className="block text-[10px] text-muted">{c.email}</span>
          </span>
        </button>
      ),
    },
    { key: 'company', label: 'Company', sortable: true, render: (c) => (
      <span>
        <span className="block text-[13px] font-medium text-ink">{c.company}</span>
        <span className="block text-[10px] text-muted">{c.location || '—'}</span>
      </span>
    ) },
    ...(isOwner ? [{
      key: 'assignedTo', label: 'Assigned To',
      render: (c) => {
        const m = memberById(c.assignedTo)
        return m ? (
          <span className="flex items-center gap-2"><Avatar name={m.name} color={m.color} size="xs" /><span className="text-xs text-body">{m.name.split(' ')[0]}</span></span>
        ) : <span className="text-xs text-muted">—</span>
      },
    }] : []),
    { key: 'status', label: 'Status', sortable: true, render: (c) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', label: 'Created', sortable: true, render: (c) => <span className="text-xs tabular-nums text-muted">{formatDate(c.createdAt)}</span> },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (c) => (
        <span className="flex items-center justify-end gap-1">
          <button className="icon-btn h-8 w-8" title="View details" onClick={() => setDetail(c)}><Eye size={15} /></button>
          {canModify(c) && <button className="icon-btn h-8 w-8" title="Edit" onClick={() => openEdit(c)}><Pencil size={15} /></button>}
          {isOwner && <button className="icon-btn h-8 w-8 hover:!text-red" title="Delete" onClick={() => setConfirmDelete(c)}><Trash2 size={15} /></button>}
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb={isOwner ? 'Company Records' : 'Personal Workspace'}
        title={isOwner ? 'Customers' : 'My Customers'}
        subtitle={isOwner
          ? `${scoped.length} customers across the company — search, filter and manage them all.`
          : 'Customers assigned to you. Contact your owner to change assignments.'}
        actions={(
          <>
            {isOwner && <Button variant="secondary" size="md" icon={Download} onClick={exportCsv}>Export</Button>}
            {isOwner && <Button icon={Plus} onClick={openCreate}>Add Customer</Button>}
          </>
        )}
      />

      <DataTable
        columns={columns}
        data={scoped}
        searchKeys={['name', 'email', 'company', 'location']}
        searchPlaceholder="Search name, email or company…"
        initialQuery={initialQuery}
        pageSize={9}
        emptyIcon={Building2}
        emptyTitle="No customers found"
        emptyDescription={isOwner ? 'Add your first customer to start building the book of business.' : 'No customers are assigned to you yet.'}
        toolbar={(
          <>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-32 text-xs" aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            {isOwner && (
              <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="h-9 w-40 text-xs" aria-label="Filter by assignee">
                <option value="all">All members</option>
                {teamUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            )}
          </>
        )}
      />

      {/* ── Create / edit modal ───────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        subtitle={editing ? `Editing ${editing.name}` : 'Create a new customer record'}
        size="lg"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={onSave}>{editing ? 'Save changes' : 'Add customer'}</Button>
          </>
        )}
      >
        <form onSubmit={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full name" required error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Jane Cooper" autoFocus error={!!errors.name} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" error={!!errors.email} />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
          </FormField>
          <FormField label="Company" required error={errors.company}>
            <Input value={form.company} onChange={set('company')} placeholder="Acme Corp" error={!!errors.company} />
          </FormField>
          <FormField label="Location">
            <Input value={form.location} onChange={set('location')} placeholder="New York, NY" />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
          {isOwner && (
            <FormField label="Assigned to" className="sm:col-span-2" hint="The team member who owns this relationship.">
              <Select value={form.assignedTo} onChange={set('assignedTo')}>
                {teamUsers.filter((u) => u.status === 'active').map((u) => <option key={u.id} value={u.id}>{u.name} — {u.title}</option>)}
              </Select>
            </FormField>
          )}
        </form>
      </Modal>

      {/* ── Detail drawer ─────────────────────────────────────────── */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name}
        subtitle={detail?.company}
        footer={detail && canModify(detail) && (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" icon={Pencil} onClick={() => { setDetail(null); openEdit(detail) }}>Edit</Button>
            {isOwner && <Button variant="danger" className="flex-1" icon={Trash2} onClick={() => setConfirmDelete(detail)}>Delete</Button>}
          </div>
        )}
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={detail.name} color={['purple', 'blue', 'green', 'orange'][detail.name.length % 4]} size="lg" />
              <div>
                <StatusBadge status={detail.status} />
                <p className="mt-1.5 text-[11px] text-muted">Customer since {formatDate(detail.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-[13px]">
              {[
                { Icon: MapPin, label: 'Location', value: detail.location || '—' },
                { Icon: Mail, label: 'Email', value: detail.email, href: `mailto:${detail.email}` },
                { Icon: Phone, label: 'Phone', value: detail.phone || '—', href: detail.phone ? `tel:${detail.phone}` : undefined },
                { Icon: Users, label: 'Assigned to', value: memberById(detail.assignedTo)?.name || 'Unassigned' },
                { Icon: Calendar, label: 'Created', value: formatDate(detail.createdAt) },
              ].map(({ Icon, label, value, href }, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-tint px-4 py-3">
                  <Icon size={15} className="shrink-0 text-muted" />
                  <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
                  {href ? <a href={href} className="truncate text-ink hover:text-ink">{value}</a> : <span className="truncate text-ink">{value}</span>}
                </div>
              ))}
            </div>

            <DealsForCompany company={detail.company} deals={visibleDeals(deals, currentUser)} />
          </div>
        )}
      </Drawer>

      {/* ── Delete confirmation ────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete?.id)}
        title="Delete customer?"
        message={`This permanently removes “${confirmDelete?.name}” and cannot be undone. Related deals and tasks are kept for audit history.`}
        confirmLabel="Delete customer"
      />
    </div>
  )
}

function DealsForCompany({ company, deals }) {
  const related = deals.filter((d) => d.customerName === company)
  if (related.length === 0) return null
  const openValue = related.filter((d) => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + Number(d.value || 0), 0)
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
        <Briefcase size={12} /> Linked deals ({related.length}) · {formatCurrency(openValue, true)} open
      </p>
      <ul className="space-y-2">
        {related.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-secondary/40 px-4 py-2.5">
            <span className="min-w-0 truncate text-xs font-medium text-body">{d.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-bold tabular-nums text-muted">{formatCurrency(d.value, true)}</span>
              <StatusBadge status={d.stage} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
