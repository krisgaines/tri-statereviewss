import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowUpRight, Facebook, Instagram, Menu, Youtube, X } from 'lucide-react'
import { Dialog } from './dialog'

function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Tri-State Reviews home"><img className="brand-logo" src="/logo.png" alt="" width={415} height={463} /></Link>
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useRouterState({ select: state => state.location.pathname })
  const closeMenu = () => setMenuOpen(false)
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="container header-inner"><Brand /><nav className={menuOpen ? 'navigation open' : 'navigation'} aria-label="Main navigation"><Link to="/" className={pathname === '/' ? 'current' : undefined} onClick={closeMenu}>Home</Link><Link to="/portfolio" className={pathname === '/portfolio' ? 'current' : undefined} onClick={closeMenu}>Portfolio</Link><Link to="/billing" className={pathname === '/billing' ? 'current' : undefined} onClick={closeMenu}>Billing</Link><a href="/#contact" className="button button-dark nav-cta" onClick={closeMenu}>Let's talk <ArrowUpRight size={17} /></a></nav><button className="mobile-menu icon-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></header>
  </>
}

export function SiteFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  return <>
    <footer className="site-footer"><div className="container footer-main"><div><Brand light /><p>Local roots. Social reach.</p></div><div className="footer-links"><Link to="/portfolio">Our work</Link><Link to="/billing">Plans & billing</Link><a href="/#contact">Get in touch</a><a href="mailto:tristatereviewss@gmail.com?subject=Advertising%20placement%20inquiry">Advertising</a><a href="/?kind=support#contact">Support</a></div><a href="#main" className="back-top">Back to top <ArrowUpRight size={17} /></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Tri-State Reviews. Made for our community.</span><button onClick={() => setPrivacyOpen(true)}>Privacy & your information</button><nav className="social-links" aria-label="Social media"><a href="https://www.facebook.com/profile.php?id=61594742597948" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={16} aria-hidden="true" /></a><a href="https://x.com/tristatereih" target="_blank" rel="noopener noreferrer" aria-label="X"><svg className="social-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.15h3.68L14.54 10.98 24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.92L18.9 1.15Zm-1.29 19.61h2.04L6.49 3.09H4.3l13.31 17.67Z" /></svg></a><a href="https://www.tiktok.com/@tristatereviews" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg className="social-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.35V2h-3.4v13.67a2.9 2.9 0 0 1-2.9 2.75 2.9 2.9 0 0 1 0-5.8c.3 0 .6.05.9.14V9.29a6.3 6.3 0 1 0 5.4 6.24V8.58a8.16 8.16 0 0 0 4.77 1.53V6.73c-.34 0-.67-.01-1-.04Z" /></svg></a><a href="https://www.instagram.com/tristatereviewss/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={16} aria-hidden="true" /></a><a href="https://www.youtube.com/feed/you" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={17} aria-hidden="true" /></a></nav><span>OH · PA · WV</span></div></footer>
    {privacyOpen && <Dialog title="Your information, handled with care." close={() => setPrivacyOpen(false)}><p>When you send an inquiry or support request, we store your name, email address, message, and any business, location, or plan details you provide in our Netlify-managed database.</p><p>We use these details to respond to your request, manage support, and send a transactional confirmation. Messages are shared with our email delivery provider only to deliver those emails. Submitting a form does not subscribe you to a marketing list.</p><p>Payments and payment details are handled by Stripe on its hosted checkout page. This website does not receive or store your card number. Stripe processes your transaction and subscription information.</p><p>Contact <a href="mailto:tristatereviewss@gmail.com">tristatereviewss@gmail.com</a> to request access, correction, or deletion of information we hold or to get help with a subscription.</p></Dialog>}
  </>
}
