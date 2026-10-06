import type {} from '@netlify/functions'
import { and, eq, isNull, lt, lte, or } from 'drizzle-orm'
import { getDb } from '../../db/index.js'
import { inquiries } from '../../db/schema.js'

export function emailConfigured() {
  return Boolean(Netlify.env.get('RESEND_API_KEY') && Netlify.env.get('RESEND_FROM_EMAIL'))
}

async function sendEmail(idempotencyKey: string, to: string, subject: string, text: string, replyTo: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Netlify.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from: Netlify.env.get('RESEND_FROM_EMAIL'), to: [to], subject, text, reply_to: replyTo }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Email provider did not accept the message')
}

export async function deliverInquiry(id: string) {
  if (!emailConfigured()) return
  const database = getDb()
  const now = new Date()
  const [record] = await database.update(inquiries)
    .set({ lockedUntil: new Date(now.getTime() + 120_000), emailAttempts: inquiries.emailAttempts + 1 })
    .where(and(eq(inquiries.id, id), lt(inquiries.emailAttempts, 12), lte(inquiries.nextAttemptAt, now), or(isNull(inquiries.lockedUntil), lt(inquiries.lockedUntil, now))))
    .returning()
  if (!record) return
  const inbox = 'tristatereviewss@gmail.com'
  const reference = `TSR-${record.id.slice(-8).toUpperCase()}`
  const typeLabel = record.kind === 'support' ? 'support request' : 'inquiry'
  const jobs: Promise<void>[] = []
  if (!record.notificationSentAt) {
    const ownerText = [
      `New ${typeLabel} for Tri-State Reviews`, `Reference: ${reference}`, `Received: ${record.createdAt.toISOString()}`,
      '', `Name: ${record.name}`, `Email: ${record.email}`,
      ...(record.business ? [`Business: ${record.business}`] : []),
      ...(record.state ? [`State: ${record.state}`] : []),
      ...(record.plan ? [`Plan: ${record.plan}`] : []),
      ...(record.subject ? [`Subject: ${record.subject}`] : []),
      '', 'Message:', record.message, '', 'Consent to store and respond: provided',
    ].join('\n')
    jobs.push((async () => {
      await sendEmail(`tristate/${record.id}/owner`, inbox, `[Tri-State Reviews] New ${typeLabel} · ${reference}`, ownerText, record.email)
      await database.update(inquiries).set({ notificationSentAt: new Date() }).where(eq(inquiries.id, id))
    })())
  }
  if (!record.confirmationSentAt) {
    const confirmationText = [
      'Thanks for reaching out to Tri-State Reviews.', '',
      `Your ${typeLabel} has been received and saved. Our team will follow up with you at this email address.`,
      '', `Your reference: ${reference}`, '',
      'If you need to add anything, reply to this email or contact tristatereviewss@gmail.com.',
      '', 'Local roots. Social reach.', 'Tri-State Reviews', 'Serving Ohio, Pennsylvania & West Virginia',
      '', 'This is a confirmation of your message, not a subscription or payment receipt.',
    ].join('\n')
    jobs.push((async () => {
      await sendEmail(`tristate/${record.id}/customer`, record.email, `We received your ${typeLabel} · Tri-State Reviews`, confirmationText, inbox)
      await database.update(inquiries).set({ confirmationSentAt: new Date() }).where(eq(inquiries.id, id))
    })())
  }
  const results = await Promise.allSettled(jobs)
  const failed = results.some(result => result.status === 'rejected')
  await database.update(inquiries).set({
    lockedUntil: null,
    emailError: failed ? 'Email delivery requires a retry. Check provider configuration and logs.' : null,
    nextAttemptAt: new Date(Date.now() + Math.min(3_600_000, 300_000 * 2 ** (record.emailAttempts - 1))),
  }).where(eq(inquiries.id, id))
  if (failed) console.error('A Tri-State Reviews email was not accepted; a retry is queued.')
}
