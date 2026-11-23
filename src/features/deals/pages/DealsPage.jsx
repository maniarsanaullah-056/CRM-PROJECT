import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, X, GripVertical, CalendarDays } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Drawer from '../../../components/ui/Drawer'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Avatar from '../../../components/ui/Avatar'
import { StatusBadge } from '../../../components/ui/Badge'
import { FormField, Input, Select } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { visibleDeals, pipelineValue } from '../../../utils/selectors'
import { formatCurrency, formatDate, toDateInputValue, fromDateInputValue, cn } from '../../../utils/format'

const STAGES = [
  { id: 'new', label: 'New', dot: '#3B82F6', tint: 'border-blue/30' },
  { id: 'contacted', label: 'Contacted', dot: '#F59E0B', tint: 'border-orange/30' },
  { id: 'proposal', label: 'Proposal', dot: '#7C3AED', tint: 'border-purple/30' },
  { id: 'negotiation', label: 'Negotiation', dot: '#F59E0B', tint: 'border-orange/30' },
  { id: 'won', label: 'Won', dot: '#10B981', tint: 'border-green/30' },
  { id: 'lost', label: 'Lost', dot: '#EF4444', tint: 'border-red/30' },
]

const EMPTY_FORM = { title: '', customerName: '', value: '', stage: 'new', expectedClose: '', assignedTo: '' }

export default function DealsPipelinePage() {
  const { currentUser, isOwner } = useAuth()
  const { users, customers, deals, addDeal, updateDeal, moveDealStage, deleteDeal } = useCrm()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [detail, setDetail] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => { setQuery(searchParams.get('q') || '') }, [searchParams])

  const teamUsers = users.filter((u) => u.role === 'user')
  const memberById = (id) => users.find((u) => u.id === id)

  const scoped = useMemo(() => {
    let list = visibleDeals(deals, currentUser)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((d) => [d.title, d.customerName].some((v) => String(v).toLowerCase().includes(q)))
    if (isOwner && assigneeFilter !== 'all') list = list.filter((d) => d.assignedTo === assigneeFilter)
    return list
  }, [deals, currentUser, query, assigneeFilter, isOwner])

  const totalPipeline = pipelineValue(visibleDeals(deals, currentUser))
  const wonCount = visibleDeals(deals, currentUser).filter((d) => d.stage === 'won').length

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = (stage = 'new') => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, stage, assignedTo: isOwner ? (teamUsers.find((u) => u.status === 'active')?.id || '') : currentUser.id })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (deal) => {
    setEditing(deal)
    setForm({
      title: deal.title, customerName: deal.customerName, value: String(deal.value ?? ''),
      stage: deal.stage, expectedClose: toDateInputValue(deal.expectedClose), assignedTo: deal.assignedTo,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Please enter a descriptive deal title.'
    if (form.value === '' || Number(form.value) < 0) next.value = 'Please enter a valid value.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = (e) => {
    e?.preventDefault()
    if (!validate()) return
    const payload = {
      ...form,
      title: form.title.trim(),
      customerName: form.customerName.trim(),
      value: Number(form.value),
      expectedClose: form.expectedClose ? fromDateInputValue(form.expectedClose) : undefined,
      assignedTo: isOwner ? form.assignedTo : currentUser.id,
    }
    const result = editing ? updateDeal(editing.id, payload) : addDeal(payload)
    if (!result.ok) { toast.error(result.message); return }
    toast.success(editing ? 'Deal updated.' : 'Deal created.')
    setModalOpen(false)
    setDetail(null)
  }

  const onDelete = (id) => {
    const result = deleteDeal(id)
    if (!result.ok) { toast.error(result.message); return }
    toast.success('Deal deleted.')
    setDetail(null)
  }

  const onDrop = (stageId) => (e) => {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (!id) return
    const result = moveDealStage(id, stageId)
    if (!result.ok) toast.error(result.message)
    else toast.info(`Deal moved to ${STAGES.find((s) => s.id === stageId)?.label}.`)
    setDragId(null)
  }

  const canModify = (d) => isOwner || d.assignedTo === currentUser?.id

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb={isOwner ? 'Sales Pipeline' : 'Personal Pipeline'}
        title={isOwner ? 'Deals Pipeline' : 'My Deals'}
        subtitle={`${formatCurrency(totalPipeline, true)} open pipeline · ${wonCount} won — drag cards between stages or click to manage.`}
        actions={<Button icon={Plus} onClick={() => openCreate('new')}>Add Deal</Button>}
      />

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search deals or companies…" className="input h-9 pl-10 text-[13px]" aria-label="Search deals" />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Clear search"><X size={14} /></button>}
        </div>
        {isOwner && (
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="h-9 w-44 text-xs" aria-label="Filter by owner">
            <option value="all">All members</option>
            {teamUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        )}
      </div>

      {/* ── Kanban board ─────────────────────────────────────────── */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex min-w-max items-stretch gap-4">
          {STAGES.map((stage) => {
            const columnDeals = scoped.filter((d) => d.stage === stage.id)
            const columnValue = columnDeals.reduce((s, d) => s + Number(d.value || 0), 0)
            const isTarget = dragOver === stage.id
            return (
              <section
                key={stage.id}
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage.id) }}
                onDragLeave={() => setDragOver((v) => (v === stage.id ? null : v))}
                onDrop={onDrop(stage.id)}
                aria-label={`${stage.label} column, ${columnDeals.length} deals`}
                className={cn(
                  'flex w-[272px] shrink-0 flex-col rounded-2xl border bg-tint transition-colors duration-200',
                  isTarget ? 'border-purple/40 bg-purple/[0.06]' : stage.tint,
                )}
              >
                <header className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: stage.dot }} />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-body">{stage.label}</h3>
                    <span className="rounded-md bg-tint px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted">{columnDeals.length}</span>
                  </div>
                  <button onClick={() => openCreate(stage.id)} className="icon-btn h-7 w-7" title={`Add deal to ${stage.label}`} aria-label="Add deal">
                    <Plus size={14} />
                  </button>
                </header>
                <p className="border-b border-line px-4 py-1.5 text-[10px] font-bold tabular-nums text-faint">{formatCurrency(columnValue, true)} total</p>

                <div className="flex flex-1 flex-col gap-2.5 p-3">
                  {columnDeals.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line py-6 text-center text-[10px] font-semibold uppercase tracking-wider text-faint">
                      Drop deals here
                    </p>
                  )}
                  {columnDeals.map((deal) => {
                    const owner = memberById(deal.assignedTo)
                    const close = new Date(deal.expectedClose)
                    const overdueClose = !['won', 'lost'].includes(deal.stage) && close < new Date()
                    return (
                      <article
                        key={deal.id}
                        draggable={canModify(deal)}
                        onDragStart={(e) => { setDragId(deal.id); e.dataTransfer.setData('text/plain', deal.id); e.dataTransfer.effectAllowed = 'move' }}
                        onDragEnd={() => { setDragId(null); setDragOver(null) }}
                        onClick={() => setDetail(deal)}
                        className={cn(
                          'group cursor-pointer rounded-xl border border-line border-l-4 bg-card p-3 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 hover:border-line',
                          dragId === deal.id && 'opacity-40',
                        )}
                        style={{ borderLeftColor: stage.dot }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="min-w-0 text-[12px] font-semibold leading-snug text-ink group-hover:text-ink">{deal.title}</h4>
                          {canModify(deal) && <GripVertical size={13} className="mt-0.5 shrink-0 text-faint transition-colors group-hover:text-muted" />}
                        </div>
                        {deal.customerName && <p className="mt-0.5 truncate text-[10px] font-medium text-muted">{deal.customerName}</p>}
                        <p className="mt-2 text-[15px] font-extrabold tabular-nums tracking-tight text-ink">{formatCurrency(deal.value)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {owner ? (
                            <span className="flex min-w-0 items-center gap-1.5">
                              <Avatar name={owner.name} color={owner.color} size="xs" />
                              <span className="truncate text-[10px] font-medium text-muted">{owner.name.split(' ')[0]}</span>
                            </span>
                          ) : <span />}
                          <span className={cn('flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wide', overdueClose ? 'text-red' : 'text-muted')}>
                            <CalendarDays size={10} /> {formatDate(deal.expectedClose, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* ── Detail drawer ─────────────────────────────────────────── */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        subtitle={detail?.customerName}
        footer={detail && (
          <div className="flex gap-2">
            {canModify(detail) && <Button variant="secondary" className="flex-1" icon={Pencil} onClick={() => { setDetail(null); openEdit(detail) }}>Edit</Button>}
            {isOwner && <Button variant="danger" className="flex-1" icon={Trash2} onClick={() => setConfirmDelete(detail)}>Delete</Button>}
          </div>
        )}
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Deal value</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-ink">{formatCurrency(detail.value)}</p>
              </div>
              <StatusBadge status={detail.stage} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-xl border border-line bg-tint px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted">Owner</p>
                <p className="mt-1 flex items-center gap-2 text-ink">{memberById(detail.assignedTo)?.name || 'Unassigned'}</p>
              </div>
              <div className="rounded-xl border border-line bg-tint px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted">Expected close</p>
                <p className="mt-1 text-ink">{formatDate(detail.expectedClose)}</p>
              </div>
            </div>

            <FormField label="Move stage">
              <Select value={detail.stage} onChange={(e) => {
                const result = moveDealStage(detail.id, e.target.value)
                if (!result.ok) { toast.error(result.message); return }
                setDetail({ ...detail, stage: e.target.value })
                toast.info(`Stage → ${STAGES.find((s) => s.id === e.target.value)?.label}`)
              }}>
                {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
            </FormField>
          </div>
        )}
      </Drawer>

      {/* ── Create / edit modal ───────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Deal' : 'Add Deal'}
        subtitle={editing ? 'Update deal details' : 'Track a new opportunity'}
        size="lg"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={onSave}>{editing ? 'Save changes' : 'Create deal'}</Button>
          </>
        )}
      >
        <form onSubmit={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Deal title" required error={errors.title} className="sm:col-span-2">
            <Input value={form.title} onChange={set('title')} placeholder="Acme Corp — Enterprise Rollout" autoFocus error={!!errors.title} />
          </FormField>
          <FormField label="Customer / account" className="sm:col-span-2">
            <Input value={form.customerName} onChange={set('customerName')} placeholder="Acme Corp" list="company-options" />
            <datalist id="company-options">
              {[...new Set(customers.map((c) => c.company))].map((c) => <option key={c} value={c} />)}
            </datalist>
          </FormField>
          <FormField label="Value (USD)" required error={errors.value}>
            <Input type="number" min="0" step="1000" value={form.value} onChange={set('value')} placeholder="50000" error={!!errors.value} />
          </FormField>
          <FormField label="Expected close">
            <Input type="date" value={form.expectedClose} onChange={set('expectedClose')} />
          </FormField>
          <FormField label="Stage">
            <Select value={form.stage} onChange={set('stage')}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
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
        title="Delete deal?"
        message={`“${confirmDelete?.title}” will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete deal"
      />
    </div>
  )
}
