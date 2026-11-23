import { cn } from '../../utils/format'

const TONES = {
  blue: 'bg-blue/10 text-blue border-blue/25',
  purple: 'bg-purple/10 text-[var(--accent-soft)] border-purple/30',
  green: 'bg-green/10 text-green border-green/25',
  orange: 'bg-orange/10 text-orange border-orange/25',
  red: 'bg-red/10 text-red border-red/25',
  slate: 'bg-tint text-muted border-line',
}

export function Badge({ tone = 'slate', dot = false, children, className = '' }) {
  return (
    <span className={cn('chip border', TONES[tone] || TONES.slate, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const STATUS_TONES = {
  // leads & deals
  new: 'blue', contacted: 'orange', qualified: 'purple', converted: 'green', lost: 'red',
  won: 'green', proposal: 'purple', negotiation: 'orange',
  // tasks
  pending: 'orange', 'in-progress': 'blue', completed: 'green',
  // customers & accounts
  active: 'green', inactive: 'slate',
}

const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost',
  won: 'Won', proposal: 'Proposal', negotiation: 'Negotiation',
  pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed',
  active: 'Active', inactive: 'Inactive',
}

export function StatusBadge({ status, className = '' }) {
  const tone = STATUS_TONES[status] || 'slate'
  const label = STATUS_LABELS[status] || status
  return <Badge tone={tone} dot className={className}>{label}</Badge>
}

const PRIORITY = {
  high: { tone: 'red', label: 'High' },
  medium: { tone: 'orange', label: 'Medium' },
  low: { tone: 'green', label: 'Low' },
}

export function PriorityBadge({ priority, className = '' }) {
  const p = PRIORITY[priority] || PRIORITY.medium
  return <Badge tone={p.tone} dot className={className}>{p.label}</Badge>
}

export function RoleBadge({ role }) {
  return role === 'owner'
    ? <Badge tone="purple">Owner</Badge>
    : <Badge tone="blue">Team User</Badge>
}
