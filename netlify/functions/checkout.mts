import type { Config } from '@netlify/functions'
import { z } from 'zod'

const checkoutPlans = {
  Associates: { amount: 15_000, name: 'Associates — one month of social media management' },
  Friends: { amount: 30_000, name: 'Friends — one month of social media management' },
  Family: { amount: 45_000, name: 'Family — one month of social media management' },
  Blueprint: { amount: 20_000, name: 'Blueprint — one-time strategy and ad launch' },
} as const

const requestSchema = z.object({
  requestId: z.uuid(),
  plan: z.enum(['Associates', 'Friends', 'Family', 'Blueprint']),
  paymentType: z.enum(['one_time', 'subscription']),
})

const responseHeaders = { 'Cache-Control': 'no-store' }

export default async function checkout(request: Request) {
  const fail = (error: string, status: number) => Response.json({ error }, { status, headers: responseHeaders })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { ...responseHeaders, Allow: 'POST' } })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return fail('Please start checkout from our website.', 403)
  if (!request.headers.get('content-type')?.includes('application/json')) return fail('Unsupported request format.', 415)
  if (Number(request.headers.get('content-length')) > 2_000) return fail('The checkout request is too large.', 413)

  let parsed: z.infer<typeof requestSchema>
  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).byteLength > 2_000) return fail('The checkout request is too large.', 413)
    const validation = requestSchema.safeParse(JSON.parse(body))
    if (!validation.success) return fail('Please select a valid plan and payment option.', 400)
    parsed = validation.data
  } catch {
    return fail('Please try checkout again.', 400)
  }

  if (parsed.plan === 'Blueprint' && parsed.paymentType !== 'one_time') return fail('Blueprint is available as a one-time payment only.', 400)

  const secretKey = Netlify.env.get('STRIPE_SECRET_KEY')
  if (!secretKey) return fail('Online checkout is temporarily unavailable. Please contact us for help.', 503)

  const selectedPlan = checkoutPlans[parsed.plan]
  const siteUrl = new URL(request.url).origin
  const sessionParams = new URLSearchParams({
    mode: parsed.paymentType === 'subscription' ? 'subscription' : 'payment',
    success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#pricing`,
    cancel_url: `${siteUrl}/?checkout=cancelled#pricing`,
    client_reference_id: parsed.requestId,
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(selectedPlan.amount),
    'line_items[0][price_data][product_data][name]': selectedPlan.name,
    'line_items[0][quantity]': '1',
    'metadata[request_id]': parsed.requestId,
    'metadata[plan]': parsed.plan,
    'metadata[payment_type]': parsed.paymentType,
  })

  if (parsed.paymentType === 'subscription') {
    sessionParams.set('line_items[0][price_data][recurring][interval]', 'month')
    sessionParams.set('subscription_data[metadata][request_id]', parsed.requestId)
    sessionParams.set('subscription_data[metadata][plan]', parsed.plan)
  }

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': parsed.requestId,
      },
      body: sessionParams,
      signal: AbortSignal.timeout(10_000),
    })
    const result: unknown = await stripeResponse.json().catch(() => null)
    if (!stripeResponse.ok || !result || typeof result !== 'object' || !('url' in result) || typeof result.url !== 'string') {
      console.error('Stripe checkout session creation failed.')
      return fail('We could not start checkout. Please try again or contact us for help.', 502)
    }

    const checkoutUrl = new URL(result.url)
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') {
      console.error('Stripe returned an untrusted checkout URL.')
      return fail('We could not start checkout. Please try again or contact us for help.', 502)
    }

    return Response.json({ url: checkoutUrl.toString() }, { headers: responseHeaders })
  } catch {
    console.error('Stripe checkout could not be reached.')
    return fail('We could not start checkout. Please try again or contact us for help.', 502)
  }
}

export const config: Config = {
  path: '/api/checkout',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip'], action: 'rate_limit' },
}
