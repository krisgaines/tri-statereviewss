import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Config } from '@netlify/functions'

const responseHeaders = { 'Cache-Control': 'no-store' }
const signatureToleranceSeconds = 300

function hasValidSignature(payload: string, signatureHeader: string, secret: string) {
  const signatureParts = signatureHeader.split(',').map(part => part.split('=', 2))
  const timestamp = signatureParts.find(([key]) => key === 't')?.[1]
  const signatures = signatureParts.filter(([key]) => key === 'v1').map(([, value]) => value)
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false
  if (Math.abs(Date.now() / 1_000 - Number(timestamp)) > signatureToleranceSeconds) return false

  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest()
  return signatures.some(signature => {
    if (!signature || !/^[a-f\d]{64}$/i.test(signature)) return false
    const received = Buffer.from(signature, 'hex')
    return received.length === expected.length && timingSafeEqual(received, expected)
  })
}

export default async function stripeWebhook(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...responseHeaders, Allow: 'POST' } })

  const secret = Netlify.env.get('STRIPE_WEBHOOK_SECRET')
  if (!secret) return Response.json({ error: 'Webhook is not configured.' }, { status: 503, headers: responseHeaders })

  const signature = request.headers.get('stripe-signature')
  if (!signature) return Response.json({ error: 'Missing Stripe signature.' }, { status: 400, headers: responseHeaders })
  if (Number(request.headers.get('content-length')) > 1_000_000) return Response.json({ error: 'Webhook payload is too large.' }, { status: 413, headers: responseHeaders })

  let payload: string
  try {
    payload = await request.text()
    if (new TextEncoder().encode(payload).byteLength > 1_000_000) return Response.json({ error: 'Webhook payload is too large.' }, { status: 413, headers: responseHeaders })
  } catch {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400, headers: responseHeaders })
  }

  if (!hasValidSignature(payload, signature, secret)) {
    return Response.json({ error: 'Invalid Stripe signature.' }, { status: 400, headers: responseHeaders })
  }

  try {
    const event: unknown = JSON.parse(payload)
    if (!event || typeof event !== 'object' || !('id' in event) || typeof event.id !== 'string' || !('type' in event) || typeof event.type !== 'string') {
      return Response.json({ error: 'Invalid Stripe event.' }, { status: 400, headers: responseHeaders })
    }
    return Response.json({ received: true }, { headers: responseHeaders })
  } catch {
    return Response.json({ error: 'Invalid webhook payload.' }, { status: 400, headers: responseHeaders })
  }
}

export const config: Config = {
  path: '/api/stripe/webhook',
  method: 'POST',
}
