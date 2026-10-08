import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Facebook, Heart, Instagram, Leaf, MapPin, MessageCircle, PenTool, Send, Sparkles } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'
import { SiteFooter, SiteHeader } from '@/components/site-shell'
import { image, plans } from '@/lib/site-data'
import type { FormKind, Plan } from '@/lib/site-data'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Social Media Management in Ohio, PA & WV | Tri-State Reviews' },
      { name: 'description', content: 'Social media management for local businesses in Ohio, Pennsylvania, and West Virginia. Thoughtful content, real connections, and monthly plans starting at $150.' },
    ],
  }),
  component: Home,
})

function Starburst({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" stroke="currentColor" strokeWidth="2.4" /></svg>
}

function Home() {
  const [kind, setKind] = useState<FormKind>('inquiry')
  const [plan, setPlan] = useState<Plan>('Not sure yet')
  const [submissionIds, setSubmissionIds] = useState(() => ({ inquiry: crypto.randomUUID(), support: crypto.randomUUID() }))
  const [success, setSuccess] = useState<{ kind: FormKind; data: { reference: string; emailReady: boolean } } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedPlan = params.get('plan')
    const requestedKind = params.get('kind')
    if (plans.some(item => item.name === requestedPlan)) setPlan(requestedPlan as Plan)
    if (requestedKind === 'support') setKind('support')
    if (requestedPlan || requestedKind) window.history.replaceState(null, '', `${window.location.pathname}#contact`)
  }, [])

  function startAnotherMessage(formKind: FormKind) {
    setSubmissionIds(current => ({ ...current, [formKind]: crypto.randomUUID() }))
    setSuccess(null)
  }

  return <>
    <SiteHeader />
    <main id="main">
      <section className="hero container"><div className="hero-copy"><div className="local-pill"><span className="small-dot" /> LOCALLY ROOTED. SOCIALLY CONNECTED.</div><h1>Social media<br /><span className="hero-accent">management</span><br className="desktop-break" /> for local businesses.<Starburst className="heading-spark" /></h1><p>You take care of your business.<br />We take care of the scroll.</p><p className="hero-description">Thoughtful social media management for the local businesses that make Ohio, Pennsylvania, and West Virginia feel like home.</p><div className="hero-actions"><Link to="/billing" className="button button-dark">Find your people <ArrowUpRight size={19} /></Link><Link to="/portfolio" className="text-link">See our work <ArrowRight size={17} /></Link></div><div className="hero-footnote"><MapPin size={15} /><span>Three states. One connected community.</span></div></div>
        <div className="hero-art" aria-label="Sample social media designs for local businesses"><div className="art-orbit" /><Starburst className="art-spark" /><div className="story-card"><img src={image('florals', 450)} alt="Seasonal flowers in a sample social post" width={450} height={560} /><span>LOCAL STORIES<br /><strong>A little closer.<br />A little more social.</strong></span><div className="story-footer">MADE FOR THE NEIGHBORHOOD.</div></div><div className="phone-card"><div className="phone-header"><span className="coffee-avatar"><Leaf size={15} /></span><span><strong>willowandco.coffee</strong><small>Your neighborhood coffee spot</small></span><span className="phone-dots">•••</span></div><div className="phone-photo"><img src={image('coffee', 700)} alt="Coffee and a cozy café table in a sample social post" width={700} height={870} fetchPriority="high" /><span className="coffee-wordmark">willow & co.</span><div className="coffee-headline">Good mornings<br />start here.</div><span className="coffee-photo-footer">GOOD COFFEE. BETTER COMPANY.</span></div><div className="phone-icons"><Heart size={21} /><MessageCircle size={21} /><Send size={20} /><span className="save-icon" /></div><div className="phone-caption"><strong>willowandco.coffee</strong> A warm cup. A familiar face.<br />See you around the corner.</div><small className="concept-label">SAMPLE CONTENT CONCEPT</small></div><div className="yellow-note"><Starburst className="note-star" />Your next regular<br />starts with<br /><strong>a scroll.</strong><ArrowUpRight size={31} /></div><div className="local-love"><span className="love-heart"><Heart size={21} fill="currentColor" /></span><span>A little local love.<small>Content with community at its heart.</small></span></div><span className="art-caption">YOUR BUSINESS. JUST A LITTLE MORE SOCIAL.</span></div>
      </section>
      <div className="community-strip"><div className="container"><span>SMALL-TOWN HEART. BIG-PICTURE THINKING.</span><div className="state-list"><span>Ohio</span><Starburst className="strip-star" /><span>Pennsylvania</span><Starburst className="strip-star" /><span>West Virginia</span></div><div className="platform-list"><Instagram size={19} /><span>Instagram</span><Facebook size={18} /><span>Facebook & more</span></div></div></div>
      <section className="section services container" id="services"><div className="section-intro"><div><p className="eyebrow">LESS ON YOUR PLATE. MORE ON YOUR FEED.</p><h2>Your social media,<br /><span className="muted-heading">in good hands.</span></h2></div><p>You've got a business to run. We bring the ideas, the consistency, and the care that help your story reach the right people.</p></div><div className="services-grid">{[{ icon: PenTool, name: 'Content with character', text: 'Posts and captions that sound like you, not like everyone else.' }, { icon: CalendarDays, name: 'Consistency, handled', text: 'Thoughtful planning and publishing that keep your business showing up.' }, { icon: MessageCircle, name: 'Real connections', text: 'A community-first approach that turns a feed into a conversation.' }, { icon: BarChart3, name: 'A clearer picture', text: "Simple insights to understand what's working and where to go next." }].map((service, index) => <article className="service" key={service.name}><div className="service-top"><service.icon size={25} strokeWidth={1.5} /><span>0{index + 1}</span></div><h3>{service.name}</h3><p>{service.text}</p></article>)}</div></section>
      <section className="home-paths"><div className="container home-paths-inner"><div><p className="eyebrow">TAKE A CLOSER LOOK</p><h2>Good work starts<br />with a good fit.</h2><p>Explore the sample work, then choose the kind of support that fits your next step.</p></div><div className="home-path-links"><Link to="/portfolio"><span><small>01 / PORTFOLIO</small><strong>See the work</strong></span><ArrowUpRight size={22} /></Link><Link to="/billing"><span><small>02 / BILLING</small><strong>Compare plans & pay</strong></span><ArrowUpRight size={22} /></Link></div></div></section>
      <section className="about-section" id="about"><div className="container about-grid"><div className="about-illustration" aria-hidden="true"><div className="about-circle"><span>OH</span><span>PA</span><span>WV</span><Sparkles size={48} strokeWidth={1.2} /></div><span className="about-sticker">Around here,<br /><strong>local matters.</strong></span></div><div><p className="eyebrow">YOUR NEIGHBORS. YOUR SOCIAL TEAM.</p><h2>We're not just online.<br />We're <span>around here.</span></h2><p>Tri-State Reviews is built for the independent shops, cafés, and everyday businesses that give our communities their character.</p><p>Across Ohio, Pennsylvania, and West Virginia, we help local businesses show up with a voice that feels like their own. No one-size-fits-all feed. Just thoughtful content, good conversations, and people who care.</p><a href="#contact" className="text-link">Meet your next social sidekick <ArrowUpRight size={18} /></a></div></div></section>
      <section className="section contact-section container" id="contact"><div className="contact-copy"><p className="eyebrow">IT STARTS WITH A HELLO</p><h2>Big ideas.<br />Small-town warmth.<br /><span className="muted-heading">Let's talk.</span></h2><p>Tell us what you're working on.<br />We'll help you find your next step.</p><a className="contact-email" href="mailto:tristatereviewss@gmail.com">tristatereviewss@gmail.com <ArrowUpRight size={17} /></a><div className="contact-location"><MapPin size={18} /><span>Proudly serving<br /><strong>Ohio, Pennsylvania & West Virginia</strong></span></div><div className="support-note"><MessageCircle size={20} /><div><strong>Already part of the community?</strong><p>Use the support tab. We're here to help.</p></div></div></div><div className="contact-panel"><div className="form-tabs" role="tablist" aria-label="Message type"><button id="inquiry-tab" role="tab" aria-selected={kind === 'inquiry'} aria-controls="contact-form-panel" tabIndex={kind === 'inquiry' ? 0 : -1} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { setKind('support'); document.getElementById('support-tab')?.focus() } }} onClick={() => setKind('inquiry')} className={kind === 'inquiry' ? 'selected' : ''}>Let's work together <ArrowUpRight size={16} /></button><button id="support-tab" role="tab" aria-selected={kind === 'support'} aria-controls="contact-form-panel" tabIndex={kind === 'support' ? 0 : -1} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { setKind('inquiry'); document.getElementById('inquiry-tab')?.focus() } }} onClick={() => setKind('support')} className={kind === 'support' ? 'selected' : ''}>I need support <MessageCircle size={16} /></button></div><div role="tabpanel" id="contact-form-panel" aria-labelledby={`${kind}-tab`}><ContactForm kind={kind} plan={plan} setPlan={setPlan} success={success?.kind === kind ? success.data : null} setSuccess={data => setSuccess(data ? { kind, data } : null)} submissionId={submissionIds[kind]} onStartAnother={() => startAnotherMessage(kind)} /></div></div></section>
    </main>
    <SiteFooter />
  </>
}
