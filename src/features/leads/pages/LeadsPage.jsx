import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Target, Plus, Pencil, Trash2, Download } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import DataTable from '../../../components/tables/DataTable'
import Avatar from '../../../components/ui/Avatar'
import { FormField, Input, Select } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { visibleLeads } from '../../../utils/selectors'
import { downloadCsv } from '../../../utils/exporters'
import { formatCurrency, formatDate } from '../../../utils/format'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Trade Show']
const STATUS_LABEL = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost' }
const EMPTY_FORM = { name: '', email: '', phone: '', company: '', source: 'Website', status: 'new', value: '', assignedTo: '' }

export default function LeadsPage() {
  const { currentUser, isOwner } = useAuth()
  const { users, leads, addLead, updateLead, setLeadStatus, deleteLead } = useCrm()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const teamUsers = users.filter((u) => u.role === 'user')
  const memberById = (id) => users.find((u) => u.id === id)

  const scoped = useMemo(() => {
    let list = visibleLeads(leads, currentUser)
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter)
    if (sourceFilter !== 'all') list = list.filter((l) => l.source === sourceFilter)
    if (isOwner && assigneeFilter !== 'all') list = list.filter((l) => l.assignedTo === assigneeFilter)
    return list
  }, [leads, currentUser, statusFilter, sourceFilter, assigneeFilter, isOwner])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, assignedTo: isOwner ? (teamUsers.find((u) => u.status === 'active')?.id || '') : currentUser.id })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (lead) => {
    setEditing(lead)
    setForm({
      name: lead.name, email: lead.email, phone: lead.phone, company: lead.company,
      source: lead.source, status: lead.status, value: String(lead.value ?? ''), assignedTo: lead.assignedTo,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter the lead name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email.'
    if (form.company.trim().length < 2) next.company = 'Please enter a company.'
    if (form.value !== '' && Number(form.value) < 0) next.value = 'Value cannot be negative.'
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
      value: Number(form.value) || 0,
      assignedTo: isOwner ? form.assignedTo : currentUser.id,
    }
    const result = editing ? updateLead(editing.id, payload) : addLead(payload)
    if (!result.ok) { toast.error(result.message); return }
    toast.success(editing ? 'Lead updated.' : 'Lead added to the pipeline.')
    setModalOpen(false)
  }

  const onDelete = (id) => {
    const result = deleteLead(id)
    if (!result.ok) { toast.error(result.message); return }
    toast.success('Lead deleted.')
  }

  const changeStatus = (lead, status) => {
    const result = setLeadStatus(lead.id, status)
    if (!result.ok) { toast.error(result.message); return }
    toast.info(`Lead moved to ${STATUS_LABEL[status]}.`)
  }

  const exportCsv = () => {
    downloadCsv('leads.csv',
      [{ label: 'Name', value: (r) => r.name }, { label: 'Email', value: (r) => r.email }, { label: 'Company', value: (r) => r.company },
       { label: 'Source', value: (r) => r.source }, { label: 'Status', value: (r) => STATUS_LABEL[r.status] },
       { label: 'Value', value: (r) => r.value }, { label: 'Assigned To', value: (r) => memberById(r.assignedTo)?.name || 'Unassigned' },
       { label: 'Created', value: (r) => formatDate(r.createdAt) }],
      scoped)
    toast.info('Leads exported to CSV.')
  }

  const canModify = (l) => isOwner || l.assignedTo === currentUser?.id

  const columns = [
    {
      key: 'name', label: 'Lead', sortable: true,
      render: (l) => (
        <span>
          <span className="block text-[13px] font-semibold text-ink">{l.name}</span>
          <span className="block text-[10px] text-muted">{l.company}</span>
        </span>
      ),
    },
    { key: 'source', label: 'Source', sortable: true, render: (l) => <span className="text-xs text-muted">{l.source}</span> },
    {
      key: 'value', label: 'Value', sortable: true,
      render: (l) => <span className="text-xs font-bold tabular-nums text-ink">{formatCurrency(l.value)}</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (l) => canModify(l) ? (
        <Select
          value={l.status}
          onChange={(e) => changeStatus(l, e.target.value)}
          className="h-8 w-32 border-transparent bg-secondary/70 px-2 text-[11px] font-semibold"
          aria-label={`Status of ${l.name}`}
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      ) : <span className="text-xs text-muted">{STATUS_LABEL[l.status]}</span>,
    },
    ...(isOwner ? [{
      key: 'assignedTo', label: 'Owner',
      render: (l) => {
        const m = memberById(l.assignedTo)
        return m ? (
          <span className="flex items-center gap-2"><Avatar name={m.name} color={m.color} size="xs" /><span className="text-xs text-body">{m.name.split(' ')[0]}</span></span>
        ) : <span className="text-xs text-muted">—</span>
      },
    }] : []),
    { key: 'createdAt', label: 'Created', sortable: true, render: (l) => <span className="text-xs tabular-nums text-muted">{formatDate(l.createdAt)}</span> },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (l) => (
        <span className="flex items-center justify-end gap-1">
          {canModify(l) && <button className="icon-btn h-8 w-8" title="Edit lead" onClick={() => openEdit(l)}><Pencil size={15} /></button>}
          {isOwner && <button className="icon-btn h-8 w-8 hover:!text-red" title="Delete lead" onClick={() => setConfirmDelete(l)}><Trash2 size={15} /></button>}
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb={isOwner ? 'Company Pipeline' : 'Personal Workspace'}
        title={isOwner ? 'Leads' : 'My Leads'}
        subtitle={isOwner
          ? `${scoped.length} leads in the pipeline — qualify them and convert to deals.`
          : 'Leads assigned to you — update statuses as you work them.'}
        actions={(
          <>
            {isOwner && <Button variant="secondary" icon={Download} onClick={exportCsv}>Export</Button>}
            <Button icon={Plus} onClick={openCreate}>Add Lead</Button>
          </>
        )}
      />

      <DataTable
        columns={columns}
        data={scoped}
        searchKeys={['name', 'email', 'company', 'source']}
        searchPlaceholder="Search leads…"
        initialQuery={initialQuery}
        pageSize={9}
        emptyIcon={Target}
        emptyTitle="No leads found"
        emptyDescription={isOwner ? 'Create a lead or adjust your filters.' : 'No leads are assigned to you yet.'}
        toolbar={(
          <>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-32 text-xs" aria-label="Filter by status">
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="h-9 w-36 text-xs" aria-label="Filter by source">
              <option value="all">All sources</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            {isOwner && (
              <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="h-9 w-40 text-xs" aria-label="Filter by owner">
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
        title={editing ? 'Edit Lead' : 'Add Lead'}
        subtitle={editing ? `Editing ${editing.name}` : 'Capture a new prospect'}
        size="lg"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={onSave}>{editing ? 'Save changes' : 'Add lead'}</Button>
          </>
        )}
      >
        <form onSubmit={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full name" required error={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder="Gregory Mason" autoFocus error={!!errors.name} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="greg@company.com" error={!!errors.email} />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
          </FormField>
          <FormField label="Company" required error={errors.company}>
            <Input value={form.company} onChange={set('company')} placeholder="Mason Build Co" error={!!errors.company} />
          </FormField>
          <FormField label="Source">
            <Select value={form.source} onChange={set('source')}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FormField>
          <FormField label="Est. value (USD)" error={errors.value}>
            <Input type="number" min="0" step="500" value={form.value} onChange={set('value')} placeholder="25000" error={!!errors.value} />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </FormField>
          {isOwner && (
            <FormField label="Assigned to">
              <Select value={form.assignedTo} onChange={set('assignedTo')}>
                {teamUsers.filter((u) => u.status === 'active').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </FormField>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete?.id)}
        title="Delete lead?"
        message={`This permanently removes the lead “${confirmDelete?.name}” (${confirmDelete?.company}). This action cannot be undone.`}
        confirmLabel="Delete lead"
      />
    </div>
  )
}
