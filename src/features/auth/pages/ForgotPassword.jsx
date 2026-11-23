import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, ArrowLeft, Send, Inbox } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { FormField, Input } from '../../../components/ui/Form'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setSent(true) // Demo only — no email is ever sent
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg p-5 text-ink">
      <span aria-hidden className="orb h-96 w-96 bg-[var(--accent-solid)] opacity-10" style={{ top: '-12%', right: '-12%' }} />
      <span aria-hidden className="orb h-80 w-80 bg-blue opacity-10" style={{ bottom: '-15%', left: '-12%', animationDelay: '-7s' }} />
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-ink">
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div className="gradient-brand mb-5 flex h-12 w-12 items-center justify-center rounded-2xl">
          {sent ? <Inbox size={22} className="text-ink" /> : <Zap size={22} className="text-white" fill="currentColor" />}
        </div>

        {sent ? (
          <div className="card p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-ink">Check your inbox</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              If an account exists for <span className="font-semibold text-ink">{email.trim().toLowerCase()}</span>, a password reset link has been sent.
            </p>
            <div className="mt-4 rounded-xl border border-blue/25 bg-blue/[0.07] px-4 py-3 text-[11px] leading-relaxed text-muted">
              <span className="font-bold text-blue">Demo mode:</span> no email is actually dispatched — this screen simulates the production reset flow. To sign in now, use a demo account from the login page (e.g. owner@crm.com / Owner123!).
            </div>
            <Link to="/login">
              <Button className="mt-5 w-full" size="lg">Return to sign in</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-ink">Reset your password</h2>
              <p className="mt-1 text-[13px] text-muted">Enter the email linked to your account and we’ll send reset instructions.</p>
            </div>
            <FormField label="Email" required error={error}>
              <Input icon={Mail} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} placeholder="you@company.com" autoFocus error={!!error} />
            </FormField>
            <Button type="submit" size="lg" icon={Send} className="w-full">Send reset instructions</Button>
          </form>
        )}
      </div>
    </div>
  )
}
