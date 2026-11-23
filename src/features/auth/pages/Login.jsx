import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Mail, Lock, Eye, EyeOff, ShieldAlert, BarChart3, Users, CheckCircle2, ShieldCheck, ArrowRight,
  TrendingUp, CheckSquare, CircleDollarSign,
} from 'lucide-react'
import Button from '../../../components/ui/Button'
import { FormField, Input } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { DEMO_ACCOUNTS } from '../../../data/seedData'
import { roleHome } from '../../../routes/ProtectedRoute'
import { cn } from '../../../utils/format'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('owner@crm.com')
  const [password, setPassword] = useState('Owner123!')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = (e, emailOverride, passwordOverride) => {
    e?.preventDefault()
    const em = (emailOverride ?? email).trim()
    const pw = passwordOverride ?? password
    setError('')
    if (!em || !pw) { setError('Please enter both email and password.'); return }
    setLoading(true)
    // Small delay so the button state is perceptible and feels real
    window.setTimeout(() => {
      const result = login(em, pw, remember)
      setLoading(false)
      if (!result.ok) { setError(result.message); return }
      toast.success('Welcome back! Signed in successfully.')
      navigate(roleHome(result.role), { replace: true })
    }, 350)
  }

  const quickLogin = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    doLogin(null, account.email, account.password)
  }

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-line bg-sidebar p-10 xl:p-14 lg:flex">
        {/* Ambient drifting orbs */}
        <span aria-hidden className="orb h-72 w-72 bg-[var(--accent-solid)] opacity-20" style={{ top: '12%', right: '-15%' }} />
        <span aria-hidden className="orb h-56 w-56 bg-blue opacity-15" style={{ bottom: '18%', left: '-18%', animationDelay: '-6s' }} />

        {/* Floating product cards — live CRM preview */}
        <div aria-hidden className="pointer-events-none absolute right-6 top-1/4 z-0 hidden w-60 flex-col gap-4 xl:flex">
          {/* Revenue card with animated sparkline */}
          <div className="float-mid rounded-xl border border-line bg-card p-4 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Revenue · 30d</p>
              <span className="flex items-center gap-1 rounded-md bg-green/10 px-1.5 py-0.5 text-[9px] font-bold text-green"><TrendingUp size={10} />+18%</span>
            </div>
            <p className="mt-1.5 text-[22px] font-extrabold tabular-nums tracking-tight text-ink">$84.2k</p>
            <svg viewBox="0 0 200 44" className="mt-2 w-full">
              <path d="M0,36 C22,34 30,24 46,26 C64,28 66,32 82,22 C100,12 112,18 128,14 C148,9 168,10 200,4"
                fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="300" className="sparkline-draw" />
            </svg>
          </div>

          {/* Deal card */}
          <div className="float-slow rounded-xl border border-line bg-card p-4 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple/15 text-[10px] font-bold text-[var(--accent-soft)]">QL</span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-ink">Quantum Labs — License</p>
                <p className="text-[9px] font-medium text-muted">Negotiation · closes in 9d</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold tabular-nums text-ink">$58,000</span>
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                <span className="bar-in block h-full rounded-full bg-[var(--accent-solid)]" style={{ width: '68%' }} />
              </span>
            </div>
          </div>

          {/* Task done toast-card */}
          <div className="float-fast flex items-center gap-2.5 rounded-xl border border-green/30 bg-green/10 p-3 shadow-lg shadow-black/10 backdrop-blur-sm">
            <CheckSquare size={16} className="shrink-0 text-green" />
            <p className="text-[10px] font-semibold leading-snug text-ink">Proposal sent — Aurora Retail Group<span className="block text-[8px] font-medium text-muted">just now · by John Carter</span></p>
          </div>
        </div>

        <Link to="/login" className="relative z-10 flex items-center gap-3">
          <div className="gradient-brand flex h-11 w-11 items-center justify-center rounded-2xl">
            <Zap size={22} className="text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-ink">Vantage<span className="gradient-text"> CRM</span></p>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-faint">Sales · Relationships · Growth</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-ink xl:text-5xl">
            The operating system for <span className="gradient-text">modern sales teams.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            One premium workspace for your customers, leads, deals, tasks and team —
            with strict role-based visibility for Owners and Team Members.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { Icon: ShieldCheck, text: 'Role-based access — Owners see everything, Team Members see only their assigned work' },
              { Icon: BarChart3, text: 'Live analytics: revenue, conversion, team productivity — computed from real records' },
              { Icon: Users, text: 'Full pipeline: customers, Kanban deals, tasks and a complete activity audit trail' },
            ].map(({ Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px] leading-snug text-muted animate-fade-up" style={{ animationDelay: `${160 + i * 110}ms` }}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple/15 text-[var(--accent-soft)]">
                  <Icon size={13} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-8 border-t border-line pt-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
          {[['$4.2M+', 'Pipeline tracked'], ['120+', 'Demo records included'], ['2 roles', 'Owner & Team User']].map(([v, l]) => (
            <div key={l}>
              <p className="text-lg font-extrabold text-ink">{v}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-xl">
              <Zap size={19} className="text-white" fill="currentColor" />
            </div>
            <p className="text-xl font-extrabold text-ink">Vantage<span className="gradient-text"> CRM</span></p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-1 text-[13px] text-muted">Sign in to your workspace to continue.</p>

          {/* Demo credentials */}
          <div className="mt-5 rounded-2xl border border-purple/25 bg-purple/[0.07] p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-soft)]">
              <CheckCircle2 size={12} /> Demo accounts — click to sign in instantly
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => quickLogin(a)}
                  disabled={loading}
                  className="rounded-xl border border-line bg-secondary/60 px-2 py-2 text-center transition-all hover:border-purple/40 hover:bg-purple/10 disabled:opacity-50"
                >
                  <span className="block text-[11px] font-bold text-ink">{a.email.split('@')[0]}</span>
                  <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-wide text-muted">{a.role.split(' /')[0]}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-muted">
              owner@crm.com · Owner123!<br />
              john@crm.com / sara@crm.com · User123!
            </p>
          </div>

          <form onSubmit={doLogin} className="mt-5 space-y-4" noValidate>
            <FormField label="Email" required>
              <Input icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" autoFocus />
            </FormField>

            <FormField label="Password" required error={error}>
              <div className="relative">
                <Input icon={Lock} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" error={!!error} />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted hover:text-body">
                <button
                  type="button"
                  role="switch"
                  aria-checked={remember}
                  onClick={() => setRemember((v) => !v)}
                  className={cn('relative h-5 w-9 rounded-full transition-colors duration-300', remember ? 'bg-purple' : 'bg-secondary')}
                >
                  <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300', remember ? 'left-[18px]' : 'left-0.5')} />
                </button>
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[var(--accent-link)] transition-colors hover:text-ink">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={loading ? undefined : ArrowRight}>
              {loading ? 'Signing in…' : 'Sign in to Vantage'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted">
            New to Vantage?{' '}
            <Link to="/signup" className="font-semibold text-[var(--accent-link)] hover:text-ink">Create an account</Link>
          </p>

          {/* Security disclosure */}
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-orange/20 bg-orange/[0.06] px-3.5 py-3">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-orange" />
            <p className="text-[10.5px] leading-relaxed text-muted">
              <span className="font-bold text-orange">Demo environment.</span> Authentication and role checks run entirely in your browser — credentials and sessions live in LocalStorage and can be inspected by anyone with DevTools. This is a front-end demonstration, not production-grade authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
