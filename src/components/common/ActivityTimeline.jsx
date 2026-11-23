// ── Reusable activity timeline with event-category iconography ──────────────
import {
  LogIn, LogOut, UserPlus, Briefcase, CheckSquare, Users, Settings, User, RotateCcw, Zap, Pencil, Circle,
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import { timeAgo } from '../../utils/format'

const CATEGORY = {
  login: { Icon: LogIn, cls: 'bg-blue/15 text-blue border-blue/30' },
  logout: { Icon: LogOut, cls: 'bg-slate-500/10 text-muted border-slate-500/20' },
  signup: { Icon: UserPlus, cls: 'bg-green/15 text-green border-green/30' },
  customer: { Icon: Users, cls: 'bg-purple/15 text-[var(--accent-soft)] border-purple/30' },
  lead: { Icon: Zap, cls: 'bg-orange/15 text-orange border-orange/30' },
  deal: { Icon: Briefcase, cls: 'bg-green/15 text-green border-green/30' },
  task: { Icon: CheckSquare, cls: 'bg-blue/15 text-blue border-blue/30' },
  team: { Icon: Users, cls: 'bg-purple/15 text-[var(--accent-soft)] border-purple/30' },
  settings: { Icon: Settings, cls: 'bg-slate-500/10 text-muted border-slate-500/20' },
  profile: { Icon: User, cls: 'bg-slate-500/10 text-body border-slate-500/20' },
  'system.reset': { Icon: RotateCcw, cls: 'bg-red/15 text-red border-red/30' },
}

const categoryFor = (action = '') => {
  const prefix = action.split('.')[0]
  return CATEGORY[prefix] || CATEGORY[action] || { Icon: action.includes('update') ? Pencil : Circle, cls: 'bg-secondary text-muted border-line' }
}

export default function ActivityTimeline({ activities, users = [], compact = false, emptyMessage = 'No activity yet.' }) {
  if (!activities || activities.length === 0) {
    return <p className="py-8 text-center text-xs text-muted">{emptyMessage}</p>
  }

  const userColor = (userId) => users.find((u) => u.id === userId)?.color || 'purple'

  return (
    <ol className="relative">
      {/* vertical line */}
      <span aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-tint" />
      {activities.map((a) => {
        const { Icon, cls } = categoryFor(a.action)
        return (
          <li key={a.id} className="relative flex items-start gap-3 py-2.5">
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cls}`}>
              <Icon size={14} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`${compact ? 'text-[11px]' : 'text-xs'} leading-snug text-body`}>{a.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted">
                {users.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Avatar name={a.userName} color={userColor(a.userId)} size="xs" />
                    <span className="font-semibold text-muted">{a.userName}</span>
                  </span>
                )}
                <span className="tabular-nums">{timeAgo(a.timestamp)}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
