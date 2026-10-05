import type { Config, Context } from '@netlify/functions'
import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '../../db/index.js'
import { inquiries } from '../../db/schema.js'
import { deliverInquiry, emailConfigured } from '../lib/email.js'

export default async function contact(request: Request, context: Context) {
  const headers = { 'Cache-Control': 'no-store' }
  const fail = (error: string, status: number) => Response.json({ error }, { status, headers })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'POST' } })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return fail('Please submit this form from our website.', 403)
  if (!request.headers.get('content-type')?.includes('application/json')) return fail('Unsupported request format.', 415)
  if (Number(request.headers.get('content-length')) > 20_000) return fail('Your message is too large.', 413)
  const schema = z.object({
    submissionId: z.uuid(),
    kind: z.enum(['inquiry', 'support']),
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    business: z.string().trim().max(150).optional().default(''),
    state: z.enum(['', 'Ohio', 'Pennsylvania', 'West Virginia', 'Elsewhere']).optional().default(''),
    plan: z.enum(['Associates', 'Friends', 'Family', 'Not sure yet']).nullable().optional(),
    subject: z.string().trim().max(150).optional().default(''),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(300).optional().default(''),
    consent: z.literal(true),
  }).superRefine((data, validation) => {
    if (data.kind === 'inquiry' && !data.business) validation.addIssue({ code: 'custom', message: 'A business name is required.' })
    if (data.kind === 'support' && !data.subject) validation.addIssue({ code: 'custom', message: 'A support subject is required.' })
  })
  let parsed: z.infer<typeof schema>
  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).byteLength > 20_000) return fail('Your message is too large.', 413)
    const validation = schema.safeParse(JSON.parse(body))
    if (!validation.success) return fail('Please check your details, write at least 10 characters, and agree to have your message stored.', 400)
    parsed = validation.data
  } catch { return fail('Please check your message and try again.', 400) }
  if (parsed.website) return fail('Your submission could not be accepted.', 400)
  try {
    const database = getDb()
    const payload = {
      kind: parsed.kind, name: parsed.name, email: parsed.email, business: parsed.business || null,
      state: parsed.state || null, plan: parsed.kind === 'inquiry' ? parsed.plan || 'Not sure yet' : null,
      subject: parsed.subject || null, message: parsed.message, consent: parsed.consent,
    }
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    await database.insert(inquiries).values({ id: parsed.submissionId, ...payload, payloadHash }).onConflictDoNothing()
    const [saved] = await database.select({ id: inquiries.id, payloadHash: inquiries.payloadHash }).from(inquiries).where(eq(inquiries.id, parsed.submissionId)).limit(1)
    if (!saved || saved.payloadHash !== payloadHash) return fail('This submission has changed. Please submit your updated message again.', 409)
    const emailReady = emailConfigured()
    if (emailReady) context.waitUntil(deliverInquiry(saved.id).catch(() => { console.error('Email processing is delayed; the saved message remains queued.') }))
    return Response.json({ saved: true, reference: `TSR-${saved.id.slice(-8).toUpperCase()}`, emailReady }, { status: 201, headers })
  } catch {
    console.error('Unable to save a Tri-State Reviews message.')
    return fail('Your message could not be saved. Please try again or email tristatereviewss@gmail.com.', 503)
  }
}

export const config: Config = {
  path: '/api/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip'], action: 'rate_limit' },
}
