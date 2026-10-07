import type { Config } from '@netlify/functions'
import { z } from 'zod'

const checkoutPlans = {
  Associates: { amount: 15_000, name: 'Associates — one month of social media management', variation: 'SQUARE_ASSOCIATES_PLAN_VARIATION_ID' },
  Friends: { amount: 30_000, name: 'Friends — one month of social media management', variation: 'SQUARE_FRIENDS_PLAN_VARIATION_ID' },
  Family: { amount: 45_000, name: 'Family — one month of social media management', variation: 'SQUARE_FAMILY_PLAN_VARIATION_ID' },
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

  const accessToken = Netlify.env.get('SQUARE_ACCESS_TOKEN')
  const locationId = Netlify.env.get('SQUARE_LOCATION_ID')
  const environment = Netlify.env.get('SQUARE_ENVIRONMENT')
  if (!accessToken || !locationId || (environment !== 'sandbox' && environment !== 'production')) {
    return fail('Online checkout is temporarily unavailable. Please contact us for help.', 503)
  }

  const selectedPlan = checkoutPlans[parsed.plan]
  const subscriptionPlanId = 'variation' in selectedPlan ? Netlify.env.get(selectedPlan.variation) : undefined
  if (parsed.paymentType === 'subscription' && !subscriptionPlanId) {
    return fail('Monthly subscriptions are temporarily unavailable. Please contact us for help.', 503)
  }

  const baseUrl = environment === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com'
  const body = {
    idempotency_key: parsed.requestId,
    quick_pay: {
      name: selectedPlan.name,
      price_money: { amount: selectedPlan.amount, currency: 'USD' },
      location_id: locationId,
    },
    checkout_options: {
      ...(parsed.paymentType === 'subscription' ? { subscription_plan_id: subscriptionPlanId } : {}),
      merchant_support_email: 'tristatereviewss@gmail.com',
    },
  }

  try {
    const squareResponse = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2026-09-16',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
    const result: unknown = await squareResponse.json().catch(() => null)
    if (!squareResponse.ok || !result || typeof result !== 'object' || !('payment_link' in result)) {
      console.error('Square checkout link creation failed.')
      return fail('We could not start checkout. Please try again or contact us for help.', 502)
    }

    const paymentLink = result.payment_link
    if (!paymentLink || typeof paymentLink !== 'object' || !('url' in paymentLink) || typeof paymentLink.url !== 'string') {
      console.error('Square returned an invalid checkout link.')
      return fail('We could not start checkout. Please try again or contact us for help.', 502)
    }

    const checkoutUrl = new URL(paymentLink.url)
    const trustedHosts = ['square.link', 'sandbox.square.link', 'checkout.square.site']
    if (checkoutUrl.protocol !== 'https:' || !trustedHosts.includes(checkoutUrl.hostname)) {
      console.error('Square returned an untrusted checkout link.')
      return fail('We could not start checkout. Please try again or contact us for help.', 502)
    }

    return Response.json({ url: checkoutUrl.toString() }, { headers: responseHeaders })
  } catch {
    console.error('Square checkout could not be reached.')
    return fail('We could not start checkout. Please try again or contact us for help.', 502)
  }
}

export const config: Config = {
  path: '/api/checkout',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip'], action: 'rate_limit' },
}
