import { useEffect, useState } from 'react'
import {
  Building2, User, Bell, Palette, ShieldCheck, RotateCcw, Save, KeyRound, Check,
} from 'lucide-react'
import PageHeader from '../../../components/layout/PageHeader'
import Button from '../../../components/ui/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { FormField, Input, Textarea, Select } from '../../../components/ui/Form'
import Avatar from '../../../components/ui/Avatar'
import RoleGuard from '../../../components/common/RoleGuard'
import { useAuth } from '../../../context/AuthContext'
import { useCrm } from '../../../context/CrmContext'
import { useToast } from '../../../context/ToastContext'
import { cn, formatDate } from '../../../utils/format'

const THEMES = [
  { id: 'midnight', label: 'Midnight', mode: 'Dark', bg: '#101114', sidebar: '#141518', card: '#18191D', accent: '#6366F1' },
  { id: 'ocean', label: 'Deep Ocean', mode: 'Dark', bg: '#081019', sidebar: '#0C1622', card: '#101D2B', accent: '#3B82F6' },
  { id: 'forest', label: 'Forest', mode: 'Dark', bg: '#081410', sidebar: '#0D1B15', card: '#101F18', accent: '#10B981' },
  { id: 'ember', label: 'Ember Night', mode: 'Dark', bg: '#17100C', sidebar: '#1F1511', card: '#241A15', accent: '#F59E0B' },
  { id: 'porcelain', label: 'Porcelain', mode: 'Light', bg: '#F4F5F7', sidebar: '#FFFFFF', card: '#FFFFFF', accent: '#4F46E5' },
  { id: 'mist', label: 'Mist Blue', mode: 'Light', bg: '#EDF2F9', sidebar: '#FFFFFF', card: '#FFFFFF', accent: '#2563EB' },
  { id: 'sage', label: 'Sage', mode: 'Light', bg: '#EEF4EF', sidebar: '#FFFFFF', card: '#FFFFFF', accent: '#059669' },
]

const ACCENTS = [
  { id: 'auto', label: 'Auto (match theme)', color: null },
  { id: 'violet', label: 'Indigo', color: '#6366F1' },
  { id: 'ocean', label: 'Blue', color: '#2563EB' },
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'sunset', label: 'Amber', color: '#D97706' },
]

const NOTIFICATION_ROWS = [
  { key: 'taskReminders', label: 'Task reminders', description: 'Overdue and due-soon task alerts' },
  { key: 'dealUpdates', label: 'Deal updates', description: 'Stage changes and closing reminders' },
  { key: 'teamMentions', label: 'Team mentions', description: 'When someone references you' },
  { key: 'emailDigest', label: 'Weekly email digest', description: 'A Monday-morning performance summary' },
  { key: 'weeklyReport', label: 'Auto-generated reports', description: 'PDF snapshots of pipeline health' },
]

function Toggle({ checked, onChange, label }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-purple' : 'bg-secondary')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}

export default function SettingsPage() {
  const { currentUser, isOwner } = useAuth()
  const { settings, updateCompany, updateProfile, changePassword, updateNotifications, updateAppearance, resetDemoData } = useCrm()
  const toast = useToast()

  const tabs = isOwner
    ? [
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'account', label: 'Account & Demo', icon: ShieldCheck },
      ]
    : [
        { id: 'profile', label: 'Personal Profile', icon: User },
        { id: 'security', label: 'Security', icon: KeyRound },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
      ]
  const [tab, setTab] = useState(tabs[0].id)
  useEffect(() => { setTab(tabs[0].id) }, [isOwner]) // eslint-disable-line react-hooks/exhaustive-deps

  const [company, setCompany] = useState(settings.company)
  const [profile, setProfile] = useState({ name: currentUser?.name || '', title: currentUser?.title || '', phone: currentUser?.phone || '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => { setCompany(settings.company) }, [settings.company])
  useEffect(() => {
    setProfile({ name: currentUser?.name || '', title: currentUser?.title || '', phone: currentUser?.phone || '' })
  }, [currentUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveCompany = (e) => {
    e.preventDefault()
    if (!company.name.trim()) { toast.error('Company name is required.'); return }
    updateCompany(company)
    toast.success('Company profile saved.')
  }

  const saveProfile = (e) => {
    e.preventDefault()
    if (profile.name.trim().length < 2) { toast.error('Please enter your name.'); return }
    updateProfile(currentUser.id, { name: profile.name.trim(), title: profile.title.trim(), phone: profile.phone.trim() })
    toast.success('Profile updated.')
  }

  const savePassword = (e) => {
    e.preventDefault()
    setPasswordError('')
    if (passwords.next !== passwords.confirm) { setPasswordError('New passwords do not match.'); return }
    const result = changePassword(currentUser.id, passwords.current, passwords.next)
    if (!result.ok) { setPasswordError(result.message); return }
    setPasswords({ current: '', next: '', confirm: '' })
    toast.success('Password changed (demo).')
  }

  const onReset = () => {
    const result = resetDemoData()
    if (!result.ok) { toast.error(result.message); return }
    toast.success('Demo data restored to defaults.')
  }

  const theme = settings.appearance.theme || 'midnight'
  const accent = settings.appearance.accent || 'auto'
  const density = settings.appearance.density

  return (
    <div className="animate-fade-up">
      <PageHeader
        breadcrumb="Workspace"
        title="Settings"
        subtitle={isOwner ? 'Company configuration, your profile, notifications and appearance.' : 'Your personal settings, security and appearance.'}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* ── Tab rail ─────────────────────────────────────────── */}
        <nav className="card h-fit p-2 lg:col-span-3 xl:col-span-2" aria-label="Settings sections">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <button
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all',
                    tab === id ? 'bg-purple/15 text-[#E9D5FF] ring-1 ring-purple/30' : 'text-muted hover:bg-tint hover:text-ink',
                  )}
                >
                  <Icon size={16} className={tab === id ? 'text-[var(--accent-soft)]' : ''} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Panel ────────────────────────────────────────────── */}
        <div className="lg:col-span-9 xl:col-span-10">
          {/* Company profile (owner only) */}
          {tab === 'company' && (
            <RoleGuard allow={['owner']}>
              <form onSubmit={saveCompany} className="card space-y-4 p-6">
                <div className="flex items-center gap-3 border-b border-line pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple/15 text-[var(--accent-soft)]"><Building2 size={20} /></div>
                  <div>
                    <h2 className="text-sm font-bold text-ink">Company Profile</h2>
                    <p className="text-[11px] text-muted">Visible to your team across the workspace.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Company name" required className="sm:col-span-2">
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Vantage CRM" />
                  </FormField>
                  <FormField label="Support email"><Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></FormField>
                  <FormField label="Phone"><Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></FormField>
                  <FormField label="Website"><Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} /></FormField>
                  <FormField label="Industry">
                    <Select value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })}>
                      {['Technology — SaaS', 'Sales & Marketing', 'Financial Services', 'Healthcare', 'Manufacturing', 'Other'].map((i) => <option key={i}>{i}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Address" className="sm:col-span-2">
                    <Textarea rows={2} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                  </FormField>
                </div>
                <div className="flex justify-end border-t border-line pt-4">
                  <Button type="submit" icon={Save}>Save company profile</Button>
                </div>
              </form>
            </RoleGuard>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="card space-y-4 p-6">
              <div className="flex items-center gap-4 border-b border-line pb-4">
                <Avatar name={currentUser?.name} color={currentUser?.color} size="lg" status={currentUser?.status} />
                <div>
                  <h2 className="text-sm font-bold text-ink">{isOwner ? 'Owner Profile' : 'Personal Profile'}</h2>
                  <p className="text-[11px] text-muted">Member since {formatDate(currentUser?.joinedAt)} · {currentUser?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full name" className="sm:col-span-2">
                  <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </FormField>
                <FormField label="Job title">
                  <Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
                </FormField>
                <FormField label="Phone">
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </FormField>
                <FormField label="Email" className="sm:col-span-2" hint="Email is managed by your administrator and cannot be changed.">
                  <Input value={currentUser?.email} disabled className="opacity-60" />
                </FormField>
              </div>
              <div className="flex justify-end border-t border-line pt-4">
                <Button type="submit" icon={Save}>Save profile</Button>
              </div>
            </form>
          )}

          {/* Security / password (user) — owner sees account tab instead */}
          {tab === 'security' && (
            <form onSubmit={savePassword} className="card max-w-2xl space-y-4 p-6">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange/15 text-orange"><KeyRound size={20} /></div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Change Password</h2>
                  <p className="text-[11px] text-muted">Demo-only: passwords are stored in LocalStorage, not hashed.</p>
                </div>
              </div>
              <FormField label="Current password" required><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} autoComplete="current-password" /></FormField>
              <FormField label="New password" required hint="Min 8 characters, one uppercase letter and one number."><Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} autoComplete="new-password" /></FormField>
              <FormField label="Confirm new password" required error={passwordError}><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} autoComplete="new-password" error={!!passwordError} /></FormField>
              <div className="flex justify-end border-t border-line pt-4">
                <Button type="submit" icon={KeyRound}>Update password</Button>
              </div>
            </form>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <div className="card p-6">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue/15 text-blue"><Bell size={20} /></div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Notification Preferences</h2>
                  <p className="text-[11px] text-muted">Applies instantly and persists in this browser.</p>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {NOTIFICATION_ROWS.map(({ key, label, description }) => (
                  <li key={key} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink">{label}</p>
                      <p className="text-[11px] text-muted">{description}</p>
                    </div>
                    <Toggle checked={!!settings.notifications[key]} onChange={(v) => { updateNotifications({ [key]: v }); toast.info(`${label} ${v ? 'enabled' : 'muted'}.`) }} label={label} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Appearance */}
          {tab === 'appearance' && (
            <div className="card space-y-6 p-6">
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple/15 text-[var(--accent-soft)]"><Palette size={20} /></div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Appearance</h2>
                  <p className="text-[11px] text-muted">Full light & dark themes, accent color and density — persisted in this browser.</p>
                </div>
              </div>

              <div>
                <p className="label">Theme <span className="normal-case text-faint">(light & dark presets)</span></p>
                {['Dark', 'Light'].map((mode) => (
                  <div key={mode} className="mb-3">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-faint">{mode}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {THEMES.filter((t) => t.mode === mode).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => updateAppearance({ theme: t.id })}
                          aria-pressed={theme === t.id}
                          className={cn(
                            'group rounded-2xl border p-2.5 text-left transition-all duration-200',
                            theme === t.id ? 'border-[var(--accent-solid)] ring-2 ring-[var(--accent-solid)]/40' : 'border-line hover:border-faint',
                          )}
                        >
                          {/* Mini preview: bg + sidebar rail + accent button */}
                          <span className="block h-16 overflow-hidden rounded-xl border border-black/20" style={{ background: t.bg }}>
                            <span className="flex h-full">
                              <span className="h-full w-9" style={{ background: t.sidebar }}>
                                <span className="mx-auto mt-2 block h-1.5 w-4 rounded-full" style={{ background: 'rgba(128,128,128,0.55)' }} />
                                <span className="mx-auto mt-1.5 block h-1.5 w-4 rounded-full" style={{ background: 'rgba(128,128,128,0.35)' }} />
                              </span>
                              <span className="flex flex-1 flex-col gap-1.5 p-2">
                                <span className="block h-2.5 w-16 rounded" style={{ background: t.card, border: '1px solid rgba(128,128,128,0.3)' }} />
                                <span className="block h-2.5 w-12 rounded" style={{ background: t.card, border: '1px solid rgba(128,128,128,0.3)' }} />
                                <span className="mt-auto block h-3.5 w-10 rounded" style={{ background: t.accent }} />
                              </span>
                            </span>
                          </span>
                          <span className="mt-2 flex items-center justify-between gap-1 text-[11px] font-semibold text-body">
                            <span className="truncate">{t.label}</span>
                            {theme === t.id && <Check size={13} className="shrink-0 text-green" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="label">Accent color <span className="normal-case text-faint">(overrides theme default)</span></p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {ACCENTS.map(({ id, label, color }) => (
                    <button
                      key={id}
                      onClick={() => updateAppearance({ accent: id })}
                      aria-pressed={accent === id}
                      className={cn(
                        'group rounded-2xl border p-3 text-left transition-all',
                        accent === id ? 'border-[var(--accent-solid)] bg-tint ring-2 ring-[var(--accent-solid)]/40' : 'border-line hover:border-faint',
                      )}
                    >
                      {color ? (
                        <span className="block h-9 rounded-lg" style={{ background: color }} />
                      ) : (
                        <span className="flex h-9 items-center justify-center rounded-xl border border-line text-[11px] font-bold text-muted">Auto</span>
                      )}
                      <span className="mt-2 flex items-center justify-between text-[11px] font-semibold text-body">
                        <span className="truncate">{label}</span>
                        {accent === id && <Check size={13} className="text-green" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label">Density</p>
                <div className="grid grid-cols-2 gap-3">
                  {[['comfortable', 'Comfortable', 'Relaxed spacing, best for large screens'], ['compact', 'Compact', 'Denser tables for power users']].map(([id, label, desc]) => (
                    <button
                      key={id}
                      onClick={() => updateAppearance({ density: id })}
                      aria-pressed={density === id}
                      className={cn(
                        'rounded-2xl border p-4 text-left transition-all',
                        density === id ? 'border-purple/40 bg-purple/10 ring-2 ring-purple/30' : 'border-line hover:border-line',
                      )}
                    >
                      <span className="text-[13px] font-bold text-ink">{label}</span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Owner account & demo reset */}
          {tab === 'account' && (
            <RoleGuard allow={['owner']}>
              <div className="space-y-4">
                <form onSubmit={savePassword} className="card max-w-2xl space-y-4 p-6">
                  <div className="flex items-center gap-3 border-b border-line pb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange/15 text-orange"><KeyRound size={20} /></div>
                    <div>
                      <h2 className="text-sm font-bold text-ink">Owner Password</h2>
                      <p className="text-[11px] text-muted">Demo-only — stored in LocalStorage, not hashed.</p>
                    </div>
                  </div>
                  <FormField label="Current password" required><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} autoComplete="current-password" /></FormField>
                  <FormField label="New password" required><Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} autoComplete="new-password" /></FormField>
                  <FormField label="Confirm new password" required error={passwordError}><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} autoComplete="new-password" error={!!passwordError} /></FormField>
                  <div className="flex justify-end border-t border-line pt-4"><Button type="submit" icon={KeyRound}>Update password</Button></div>
                </form>

                <div className="rounded-2xl border border-red/25 bg-red/[0.05] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-red">Reset Demo Data</h3>
                      <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
                        Restores every customer, lead, deal, task and activity to the original seeded state — wiping any records you created. Your owner session stays signed in.
                      </p>
                    </div>
                    <Button variant="danger" icon={RotateCcw} onClick={() => setConfirmReset(true)} className="shrink-0">Reset demo data</Button>
                  </div>
                </div>
              </div>
            </RoleGuard>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={onReset}
        title="Reset all demo data?"
        message="Every record you added or changed will be discarded and replaced with the original demo dataset. This cannot be undone."
        confirmLabel="Reset everything"
      />
    </div>
  )
}
