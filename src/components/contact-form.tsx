import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { plans } from '@/lib/site-data'
import type { FormKind, Plan } from '@/lib/site-data'

export function ContactForm({ kind, plan, setPlan, success, setSuccess, submissionId, onStartAnother }: { kind: FormKind; plan: Plan; setPlan: (plan: Plan) => void; success: { reference: string; emailReady: boolean } | null; setSuccess: (success: { reference: string; emailReady: boolean } | null) => void; submissionId: string; onStartAnother: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setError('')
    const fields = Object.fromEntries(new FormData(form))
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, kind, plan: kind === 'inquiry' ? plan : null, consent: fields.consent === 'on', submissionId }), signal: AbortSignal.timeout(20_000) })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || (response.status === 429 ? 'Too many messages. Please wait a few minutes and try again.' : 'Your message could not be saved. Please try again or email us directly.'))
      setSuccess({ reference: result.reference, emailReady: result.emailReady })
      form.reset()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  if (success) return <div className="form-success" role="status"><span className="success-icon"><Check size={28} /></span><p className="eyebrow">MESSAGE RECEIVED</p><h3>You're on our radar.</h3><p>Your {kind === 'support' ? 'support request' : 'inquiry'} is safely saved. {success.emailReady ? 'Your confirmation email is queued for delivery. Check your inbox and spam folder shortly.' : 'Email confirmations are currently delayed. Keep your reference below, or email us directly if you need help.'}</p><p className="reference">Your reference: <strong>{success.reference}</strong></p><button className="button button-dark" onClick={onStartAnother}>Send another message <ArrowRight size={17} /></button></div>
  return <form onSubmit={submit} className="contact-form">
    <div className="form-row"><label>Your name <span>*</span><input name="name" disabled={busy} autoComplete="name" placeholder="Your full name" required minLength={2} maxLength={100} /></label><label>Email address <span>*</span><input name="email" disabled={busy} type="email" autoComplete="email" placeholder="you@yourbusiness.com" required maxLength={254} /></label></div>
    {kind === 'inquiry' ? <><div className="form-row"><label>Business name <span>*</span><input name="business" disabled={busy} autoComplete="organization" placeholder="Your business name" required maxLength={150} /></label><label>Your state<select name="state" disabled={busy} defaultValue=""><option value="">Select your state</option><option>Ohio</option><option>Pennsylvania</option><option>West Virginia</option><option>Elsewhere</option></select></label></div><label>Which plan catches your eye?<select name="plan" id="plan-select" disabled={busy} value={plan} onChange={event => setPlan(event.target.value as Plan)}><option>Not sure yet</option>{plans.map(item => <option key={item.name} value={item.name}>{item.name} - ${item.price}{item.cadence === 'month' ? '/month' : ' one-time'}</option>)}</select></label></> : <label>What do you need help with? <span>*</span><input name="subject" disabled={busy} placeholder="A quick summary of your request" required maxLength={150} /></label>}
    <label>{kind === 'inquiry' ? 'Tell us a little about your business' : 'How can we help?'} <span>*</span><textarea name="message" disabled={busy} placeholder={kind === 'inquiry' ? 'What do you do, and what would you love your social media to do for you?' : 'Share the details so we can help you get back on track.'} required minLength={10} maxLength={5000} rows={4} /></label>
    <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" disabled={busy} tabIndex={-1} autoComplete="off" /></label></div>
    <label className="consent"><input type="checkbox" name="consent" disabled={busy} required /><span>I agree to have my details stored so Tri-State Reviews can respond to this message.</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-dark submit-button" type="submit" disabled={busy}>{busy ? 'Saving your message...' : kind === 'inquiry' ? "Let's start a conversation" : 'Send support request'}{!busy && <ArrowUpRight size={19} />}</button>
    <p className="form-note"><span className="small-dot" /> A real conversation. No pressure, no sales script.</p>
  </form>
}
