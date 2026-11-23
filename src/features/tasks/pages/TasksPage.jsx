import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListTodo, Plus, Pencil, Trash2, Check, AlarmClock, Search, X } from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import DataTable from '../../../components/tables/DataTable'
import Avatar from '../../../components/ui/Avatar'
import { PriorityBadge, StatusBadge } from '../../../components/ui/Badge'
import { FormField, Input, Select, Textarea } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { visibleTasks, taskStats } from '../../../utils/selectors'
import { formatDate, isOverdue, toDateInputValue, fromDateInputValue, cn } from '../../../utils/format'

const EMPTY_FORM = { title: '', description: '', priority: 'medium', status: 'pending', assignedTo: '', dueDate: '' }

export default function TasksPage() {
  const { currentUser, isOwner } = useAuth()
  const { users, tasks, addTask, updateTask, setTaskStatus, deleteTask } = useCrm()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { setQuery(searchParams.get('q') || '') }, [searchParams])

  const teamUsers = users.filter((u) => u.role === 'user')
  const memberById = (id) => users.find((u) => u.id === id)

  const scoped = useMemo(() => {
    let list = visibleTasks(tasks, currentUser)
    if (statusFilter === 'overdue') list = list.filter(isOverdue)
    else if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter)
    if (isOwner && assigneeFilter !== 'all') list = list.filter((t) => t.assignedTo === assigneeFilter)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((t) => [t.title, t.description].some((v) => String(v).toLowerCase().includes(q)))
    return list
  }, [tasks, currentUser, statusFilter, priorityFilter, assigneeFilter, query, isOwner])

  const stats = taskStats(visibleTasks(tasks, currentUser))

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, assignedTo: teamUsers.find((u) => u.status === 'active')?.id || '', dueDate: toDateInputValue(new Date(Date.now() + 3 * 86400000).toISOString()) })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditing(task)
    setForm({
      title: task.title, description: task.description, priority: task.priority,
      status: task.status, assignedTo: task.assignedTo, dueDate: toDateInputValue(task.dueDate),
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const next = {}
    if (form.title.trim().length < 3) next.title = 'Please enter a task title.'
    if (!form.assignedTo) next.assignedTo = 'Please choose an assignee.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSave = (e) => {
    e?.preventDefault()
    if (!validate()) return
    const payload = { ...form, title: form.title.trim(), dueDate: form.dueDate ? fromDateInputValue(form.dueDate) : undefined }
    const result = editing ? updateTask(editing.id, payload) : addTask(payload)
    if (!result.ok) { toast.error(result.message); return }
    toast.success(editing ? 'Task updated.' : 'Task assigned.')
    setModalOpen(false)
  }

  const toggleComplete = (task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed'
    const result = setTaskStatus(task.id, next)
    if (!result.ok) { toast.error(result.message); return }
    toast.success(next === 'completed' ? 'Task completed. Nice work!' : 'Task reopened.')
  }

  const changeStatus = (task, status) => {
    const result = setTaskStatus(task.id, status)
    if (!result.ok) { toast.error(result.message); return }
    toast.info(`Status → ${status === 'in-progress' ? 'In Progress' : status[0].toUpperCase() + status.slice(1)}.`)
  }

  const onDelete = (id) => {
    const result = deleteTask(id)
    if (!result.ok) { toast.error(result.message); return }
    toast.success('Task deleted.')
  }

  const canModify = (t) => isOwner || t.assignedTo === currentUser?.id

  const columns = [
    {
      key: 'done', label: '', className: 'w-10',
      render: (t) => (
        <button
          onClick={() => toggleComplete(t)}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border transition-all',
            t.status === 'completed'
              ? 'border-green bg-green text-white'
              : 'border-line text-transparent hover:border-green hover:bg-green/10 hover:text-green',
          )}
          aria-label={t.status === 'completed' ? 'Reopen task' : 'Complete task'}
        >
          <Check size={13} strokeWidth={3} />
        </button>
      ),
    },
    {
      key: 'title', label: 'Task', sortable: true,
      render: (t) => (
        <span className="block max-w-md">
          <span className={cn('block text-[13px] font-semibold leading-snug', t.status === 'completed' ? 'text-muted line-through decoration-slate-600' : 'text-ink')}>
            {t.title}
          </span>
          {t.description && <span className="mt-0.5 block truncate text-[10px] text-muted">{t.description}</span>}
        </span>
      ),
    },
    ...(isOwner ? [{
      key: 'assignedTo', label: 'Assigned To',
      render: (t) => {
        const m = memberById(t.assignedTo)
        return m ? (
          <span className="flex items-center gap-2"><Avatar name={m.name} color={m.color} size="xs" /><span className="text-xs text-body">{m.name.split(' ')[0]}</span></span>
        ) : <span className="text-xs text-muted">—</span>
      },
    }] : []),
    { key: 'priority', label: 'Priority', sortable: true, render: (t) => <PriorityBadge priority={t.priority} /> },
    {
      key: 'dueDate', label: 'Due', sortable: true,
      render: (t) => {
        const overdue = isOverdue(t)
        return (
          <span className={cn('flex items-center gap-1 text-xs tabular-nums', overdue ? 'font-bold text-red' : 'text-muted')}>
            {overdue && <AlarmClock size={11} />}
            {formatDate(t.dueDate, { month: 'short', day: 'numeric' })}
          </span>
        )
      },
    },
    {
      key: 'status', label: 'Status',
      render: (t) => canModify(t) ? (
        <Select value={t.status} onChange={(e) => changeStatus(t, e.target.value)} className="h-8 w-32 border-transparent bg-secondary/70 px-2 text-[11px] font-semibold" aria-label="Task status">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
      ) : <StatusBadge status={t.status} />,
    },
    {
      key: 'actions', label: '', className: 'text-right',
      render: (t) => isOwner ? (
        <span className="flex items-center justify-end gap-1">
          <button className="icon-btn h-8 w-8" title="Edit task" onClick={() => openEdit(t)}><Pencil size={15} /></button>
          <button className="icon-btn h-8 w-8 hover:!text-red" title="Delete task" onClick={() => setConfirmDelete(t)}><Trash2 size={15} /></button>
        </span>
      ) : null,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb={isOwner ? 'Productivity' : 'Personal Workspace'}
        title={isOwner ? 'Tasks & Productivity' : 'My Tasks'}
        subtitle={isOwner
          ? `${stats.total} tasks · ${stats.completed} completed · ${stats.overdue} overdue — assign and track team work.`
          : `${stats.total} assigned to you · ${stats.completed} done · ${stats.overdue} overdue.`}
        actions={isOwner && <Button icon={Plus} onClick={openCreate}>Assign Task</Button>}
      />

      {/* Summary strip */}
      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, cls: 'text-ink' },
          { label: 'In progress', value: stats.inProgress, cls: 'text-blue' },
          { label: 'Completed', value: stats.completed, cls: 'text-green' },
          { label: 'Overdue', value: stats.overdue, cls: stats.overdue > 0 ? 'text-red' : 'text-muted' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className={cn('text-xl font-extrabold tabular-nums', cls)}>{value}</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={scoped}
        searchKeys={['title', 'description']}
        searchPlaceholder="Search tasks…"
        pageSize={9}
        emptyIcon={ListTodo}
        emptyTitle="No tasks found"
        emptyDescription={isOwner ? 'Assign your first task to a team member.' : 'You have no tasks matching these filters.'}
        toolbar={(
          <>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-32 text-xs" aria-label="Filter by status">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-9 w-32 text-xs" aria-label="Filter by priority">
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            {isOwner && (
              <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="h-9 w-40 text-xs" aria-label="Filter by assignee">
                <option value="all">All members</option>
                {teamUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            )}
            <div className="relative w-40">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter…" className="input h-9 pl-9 text-xs" aria-label="Quick filter" />
              {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Clear filter"><X size={13} /></button>}
            </div>
          </>
        )}
      />

      {/* ── Create / edit modal (owner) ───────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Task' : 'Assign Task'}
        subtitle={editing ? 'Update task details' : 'Delegate work to a team member'}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={onSave}>{editing ? 'Save changes' : 'Assign task'}</Button>
          </>
        )}
      >
        <form onSubmit={onSave} className="space-y-4">
          <FormField label="Task title" required error={errors.title}>
            <Input value={form.title} onChange={set('title')} placeholder="Follow up with Acme Corp…" autoFocus error={!!errors.title} />
          </FormField>
          <FormField label="Description">
            <Textarea value={form.description} onChange={set('description')} placeholder="Context, links, acceptance criteria…" rows={2} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Assigned to" required error={errors.assignedTo}>
              <Select value={form.assignedTo} onChange={set('assignedTo')}>
                <option value="">Select member…</option>
                {teamUsers.filter((u) => u.status === 'active').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Due date">
              <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
            </FormField>
            <FormField label="Priority">
              <Select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => onDelete(confirmDelete?.id)}
        title="Delete task?"
        message={`“${confirmDelete?.title}” will be permanently removed.`}
        confirmLabel="Delete task"
      />
    </div>
  )
}
