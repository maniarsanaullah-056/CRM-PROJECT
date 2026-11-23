import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { FormField, Input } from '../../../components/ui/Form'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{10,}$/

export default function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.'
    if (!PASSWORD_RE.test(form.password)) next.password = 'Min 10 characters, one uppercase letter and one number most important.'
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    window.setTimeout(() => {
      const result = signup({ name: form.name, email: form.email, password: form.password })
      setLoading(false)
      if (!result.ok) {
        setErrors({ email: result.message })
        return
      }
      toast.success('Account created. Welcome to Vantage CRM!')
      navigate('/user/dashboard', { replace: true })
    }, 400)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-5 text-ink">
      <span aria-hidden className="orb h-96 w-96 bg-[var(--accent-solid)] opacity-10" style={{ top: '-12%', right: '-12%' }} />
      <span aria-hidden className="orb h-80 w-80 bg-blue opacity-10" style={{ bottom: '-15%', left: '-12%', animationDelay: '-7s' }} />
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="gradient-brand flex h-12 w-12 items-center justify-center rounded-2xl">
            <Zap size={22} className="text-white" fill="currentColor" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">Create your account</h2>
          <p className="mt-1 text-[13px] text-muted">
            New accounts join as <span className="font-semibold text-body">Team Users</span>. Only an owner can grant Owner access.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
          <FormField label="Full name" required error={errors.name}>
            <Input icon={User} value={form.name} onChange={set('name')} placeholder="Alex Morgan" autoComplete="name" autoFocus error={!!errors.name} />
          </FormField>

          <FormField label="Work email" required error={errors.email}>
            <Input icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" error={!!errors.email} />
          </FormField>

          <FormField label="Password" required error={errors.password} hint="At least 8 characters with one uppercase letter and one number.">
            <div className="relative">
              <Input icon={Lock} type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Create a strong password" autoComplete="new-password" error={!!errors.password} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm password" required error={errors.confirm}>
            <Input icon={Lock} type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" autoComplete="new-password" error={!!errors.confirm} />
          </FormField>

          <div className="flex items-start gap-2 rounded-xl border border-line bg-secondary/40 px-3.5 py-2.5 text-[10.5px] leading-relaxed text-muted">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green" />
            Demo accounts are stored only in this browser’s LocalStorage and are visible to anyone who opens DevTools.
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={loading ? undefined : ArrowRight}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--accent-link)] hover:text-ink">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
