import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, Sparkles } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/site-shell'
import { plans } from '@/lib/site-data'
import type { CheckoutPlan } from '@/lib/site-data'

export const Route = createFileRoute('/billing')({
  head: () => ({ meta: [{ title: 'Plans & Billing | Tri-State Reviews' }, { name: 'description', content: 'Compare Tri-State Reviews monthly social media management plans and the one-time Blueprint strategy package.' }] }),
  component: BillingPage,
})

function BillingPage() {
  const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutNotice, setCheckoutNotice] = useState('')
  const checkoutRequestIds = useRef(new Map<string, string>())

  useEffect(() => {
    const checkoutStatus = new URLSearchParams(window.location.search).get('checkout')
    if (checkoutStatus === 'success') setCheckoutNotice('Thanks for returning from Stripe Checkout. Check your Stripe receipt for payment confirmation.')
    if (checkoutStatus === 'cancelled') setCheckoutNotice('Checkout was canceled. You can restart anytime.')
    if (checkoutStatus) window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`)
  }, [])

  async function startCheckout(selectedPlan: CheckoutPlan, paymentType: 'one_time' | 'subscription') {
    if (checkoutBusy) return
    const checkoutKey = `${selectedPlan}:${paymentType}`
    const requestId = checkoutRequestIds.current.get(checkoutKey) ?? crypto.randomUUID()
    checkoutRequestIds.current.set(checkoutKey, requestId)
    setCheckoutBusy(checkoutKey)
    setCheckoutError('')
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, plan: selectedPlan, paymentType }),
      })
      const result = await response.json().catch(() => null) as { url?: unknown; error?: unknown } | null
      if (!response.ok || typeof result?.url !== 'string') {
        setCheckoutError(typeof result?.error === 'string' ? result.error : 'Checkout is unavailable right now. Please try again or contact us.')
        setCheckoutBusy(null)
        return
      }
      window.location.assign(result.url)
    } catch {
      setCheckoutError('We could not connect to checkout. Please try again or contact us.')
      setCheckoutBusy(null)
    }
  }

  return <>
    <SiteHeader />
    <main id="main" className="billing-page">
      <section className="page-intro container billing-intro"><p className="eyebrow">GOOD COMPANY. A PLAN THAT FITS.</p><h1>Choose your kind<br />of <span className="muted-heading">support.</span></h1><p>Choose the pace and level of help that suits your business. Need help deciding? Send us a note before checking out.</p><span className="monthly-label"><span className="small-dot" /> USD · MONTHLY PLANS OR ONE-TIME PAYMENT · BLUEPRINT IS ONE-TIME</span></section>
      <section className="billing-plans container" aria-busy={Boolean(checkoutBusy)} aria-label="Plans and payment options"><div className="pricing-grid">{plans.map(item => {
        const oneTimeKey = `${item.name}:one_time`
        const subscriptionKey = `${item.name}:subscription`
        return <article className={`price-card ${item.name === 'Friends' ? 'featured' : ''} ${item.name === 'Blueprint' ? 'blueprint-card' : ''}`} key={item.name}>
          {item.name === 'Friends' && <div className="featured-label"><Sparkles size={14} /> THE SWEET SPOT</div>}
          {item.name === 'Blueprint' && <div className="featured-label"><Sparkles size={14} /> ONE-TIME STRATEGY + AD LAUNCH</div>}
          <p className="plan-title">{item.name}</p><p className="plan-description">{item.description}</p><div className="plan-price">${item.price}<span>{item.cadence === 'month' ? '/ month' : 'one-time'}</span></div><div className="price-line" /><p className="included-label">A LITTLE LOOK AT WHAT'S INCLUDED</p><ul>{item.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
          <div className="checkout-actions">{item.cadence === 'month' ? <><button className="button button-outline" onClick={() => startCheckout(item.name, 'one_time')} disabled={Boolean(checkoutBusy)}>{checkoutBusy === oneTimeKey ? 'Opening checkout…' : `Pay once · $${item.price}`} <ArrowUpRight size={16} /></button><button className={`button ${item.name === 'Friends' ? 'button-dark' : 'button-outline'}`} onClick={() => startCheckout(item.name, 'subscription')} disabled={Boolean(checkoutBusy)}>{checkoutBusy === subscriptionKey ? 'Opening checkout…' : `Subscribe · $${item.price}/mo`} <ArrowUpRight size={16} /></button></> : <button className="button button-dark" onClick={() => startCheckout('Blueprint', 'one_time')} disabled={Boolean(checkoutBusy)}>{checkoutBusy === oneTimeKey ? 'Opening checkout…' : 'Pay $200 once'} <ArrowUpRight size={16} /></button>}<a className="checkout-question" href={`/?plan=${encodeURIComponent(item.name)}#contact`}>Questions? Let's talk</a></div>
        </article>
      })}</div>
        {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}{checkoutNotice && <p className="checkout-notice" role="status">{checkoutNotice}</p>}
        <p className="pricing-note">One-time payments for monthly plans cover one month of service and do not renew. Subscriptions renew automatically each month until canceled. Blueprint is a one-time $200 payment. Exact content deliverables are agreed before service begins.</p>
      </section>
      <section className="billing-faq-section container"><div><p className="eyebrow">A FEW BILLING DETAILS</p><h2>Before you<br />make it official.</h2><p>Want to see what the Blueprint can look like? Visit the portfolio for a clearly labeled example slideshow.</p><Link className="text-link" to="/portfolio">See the sample deck <ArrowUpRight size={18} /></Link></div><div className="faq-list">{[
        { title: 'Can I pay once instead of subscribing?', answer: 'Yes. Associates, Friends, and Family are available as a one-time payment for a single month or as automatically renewing monthly subscriptions. One-time payments do not renew.' },
        { title: 'What is included with Blueprint?', answer: 'Blueprint is a one-time strategy slideshow with illustrative growth projections and an initial ad launch, including $50 allocated toward the initial ad run. The business and recommendations in the portfolio slideshow are illustrative. We agree on the exact scope before service begins.' },
        { title: 'Does an inquiry charge me or start a subscription?', answer: 'No. Sending an inquiry does not charge you or subscribe you. Checkout happens separately through Stripe.' },
        { title: 'How do I manage or cancel a subscription?', answer: 'Stripe securely hosts checkout and processes payments. Contact tristatereviewss@gmail.com for help managing or canceling a subscription.' },
      ].map(item => <details key={item.title}><summary>{item.title}<ChevronDown size={18} /></summary><p>{item.answer}</p></details>)}</div></section>
      <section className="billing-contact container"><p>Still weighing your options?</p><a href="/#contact">Ask us before you pay <ArrowUpRight size={17} /></a></section>
    </main>
    <SiteFooter />
  </>
}
