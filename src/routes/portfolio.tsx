import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog } from '@/components/dialog'
import { SiteFooter, SiteHeader } from '@/components/site-shell'
import { blueprintSlides, image, projects } from '@/lib/site-data'
import type { Project } from '@/lib/site-data'

export const Route = createFileRoute('/portfolio')({
  head: () => ({ meta: [{ title: 'Portfolio | Tri-State Reviews' }, { name: 'description', content: 'Explore illustrative social content concepts, the Tri-State Reviews website, and a sample Blueprint strategy slideshow.' }] }),
  component: PortfolioPage,
})

function BlueprintCoverPreview() {
  return <div className="blueprint-cover" aria-hidden="true"><span className="blueprint-cover-index">STRATEGY DECK · 01—04</span><span className="blueprint-cover-studio">KINDRED<br />SOCIAL STUDIO</span><strong>Good work,<br />well shared.</strong><span className="blueprint-cover-rule" /><span className="blueprint-cover-caption">BRAND & CONTENT BLUEPRINT</span><span className="blueprint-cover-seal">SAMPLE<br />CONCEPT</span></div>
}

function WebsitePreview() {
  return <div className="website-preview" aria-hidden="true"><div className="website-preview-bar"><span className="website-preview-mark">TR</span><span>TRI-STATE REVIEWS</span><span className="website-preview-nav">HOME&nbsp;&nbsp; WORK&nbsp;&nbsp; PLANS</span></div><div className="website-preview-body"><small>LOCALLY ROOTED. SOCIALLY CONNECTED.</small><strong>Social media<br /><em>management</em></strong><span>for local businesses.</span><i>OH&nbsp; · &nbsp;PA&nbsp; · &nbsp;WV</i></div><div className="website-preview-foot"><span>LOCAL ROOTS.</span><span>SOCIAL REACH.</span></div></div>
}

function BlueprintPresentation() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = blueprintSlides[activeSlide]
  return <div className="blueprint-presentation">
    <div className="blueprint-presentation-top"><span>KINDRED SOCIAL STUDIO</span><span>ILLUSTRATIVE BLUEPRINT</span></div>
    <article className="blueprint-slide" aria-live="polite" aria-atomic="true">
      <div className="blueprint-slide-main"><p className="blueprint-slide-kicker">{slide.kicker}</p><h3>{slide.title.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3><p>{slide.copy}</p><span className="blueprint-slide-line" /></div>
      <aside className="blueprint-slide-side"><span>STUDIO NOTES</span><div className="blueprint-slide-orbit"><i /><i /><i /></div><p>{slide.note}</p><small>KINDRED / STRATEGY</small></aside>
      <span className="blueprint-slide-number">{String(activeSlide + 1).padStart(2, '0')} <i>/</i> {String(blueprintSlides.length).padStart(2, '0')}</span>
    </article>
    <nav className="blueprint-controls" aria-label="Sample Blueprint slides"><button className="icon-button" onClick={() => setActiveSlide(index => Math.max(0, index - 1))} disabled={activeSlide === 0} aria-label="Previous slide"><ChevronLeft size={20} /></button><div className="blueprint-slide-tabs">{blueprintSlides.map((item, index) => <button key={item.kicker} className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}: ${item.kicker}`} aria-current={index === activeSlide ? 'step' : undefined}>{String(index + 1).padStart(2, '0')}</button>)}</div><button className="icon-button" onClick={() => setActiveSlide(index => Math.min(blueprintSlides.length - 1, index + 1))} disabled={activeSlide === blueprintSlides.length - 1} aria-label="Next slide"><ChevronRight size={20} /></button></nav>
  </div>
}

function ProjectPreview({ project }: { project: Project }) {
  if (project.visual === 'website') return <WebsitePreview />
  if (project.visual === 'blueprint') return <BlueprintCoverPreview />
  return <><img src={image(project.image ?? '')} alt="" width={700} height={800} loading="lazy" /><span className="sample-badge">ILLUSTRATIVE SAMPLE</span><div className="project-overlay"><span>{project.headline}</span><small>{project.tag}</small></div></>
}

function ProjectDetails({ project, close }: { project: Project; close: () => void }) {
  const isSample = project.visual !== 'website'
  return <Dialog title={project.name} close={close}>
    {project.visual === 'blueprint' ? <><p className="sample-disclaimer">Illustrative sample · Fictional studio and strategy · Not actual client work</p><BlueprintPresentation /><p>{project.description}</p></> : project.visual === 'website' ? <><p className="sample-disclaimer website-disclaimer">In-house project · Tri-State Reviews</p><div className="website-preview-frame"><WebsitePreview /></div><p>{project.description}</p></> : <><p className="sample-disclaimer">Illustrative sample · Not an actual client project</p><img className="dialog-image" src={image(project.image ?? '', 800)} alt={`${project.name} sample creative direction`} width={800} height={450} /><p>{project.description}</p></>}
    <h3>{isSample ? 'The sample scope' : 'What this site includes'}</h3><ul className="deliverables">{project.deliverables.map(item => <li key={item}><Check size={17} />{item}</li>)}</ul>
    {isSample && <p className="dialog-note">These concepts show a possible creative direction. They do not imply client relationships or performance results.</p>}
    <Link className="button button-dark" to="/billing">Explore plans <ArrowUpRight size={17} /></Link>
  </Dialog>
}

function PortfolioPage() {
  const [filter, setFilter] = useState('All work')
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const filters = ['All work', 'Food & drink', 'Retail', 'Our website', 'Blueprint sample']
  const visibleProjects = projects.filter(project => filter === 'All work' || project.category === filter)
  return <>
    <SiteHeader />
    <main id="main" className="portfolio-page">
      <section className="page-intro container"><p className="eyebrow">A LITTLE OF WHAT WE CAN DO</p><h1>Local stories.<br /><span className="muted-heading">Worth sharing.</span></h1><p>Explore the creative thinking behind the feed—and take a look at the website you’re on and a sample Blueprint deck.</p><div className="portfolio-legend"><span><i className="legend-dot sample-dot" />Fictional samples, clearly labeled</span><span><i className="legend-dot site-dot" />Tri-State Reviews in-house website</span></div></section>
      <section className="portfolio-gallery container" aria-label="Portfolio projects"><div className="portfolio-toolbar"><div className="work-filters" aria-label="Filter portfolio work">{filters.map(item => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}</div><p>{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}</p></div><div className="portfolio-page-grid">{visibleProjects.map(project => <article className="project" key={project.name}><button className={`project-image ${project.color}`} onClick={() => setActiveProject(project)} aria-label={`View ${project.name} project`}><ProjectPreview project={project} />{project.visual !== 'photo' && <span className={`project-type-badge ${project.visual === 'website' ? 'in-house-badge' : ''}`}>{project.visual === 'website' ? 'OUR WEBSITE' : 'BLUEPRINT SAMPLE'}</span>}<span className="project-arrow"><ArrowUpRight size={22} /></span></button><div className="project-description"><div><h3>{project.name}</h3><p>{project.category}<span> / </span>{project.visual === 'blueprint' ? 'Strategy slideshow' : project.visual === 'website' ? 'In-house digital project' : 'Social content & strategy'}</p><p className="project-profile">{project.description}</p></div><button className="icon-button" onClick={() => setActiveProject(project)} aria-label={`Read about ${project.name}`}><ArrowUpRight size={22} /></button></div></article>)}</div></section>
      <section className="portfolio-note"><div className="container portfolio-note-inner"><div><p className="eyebrow">GOOD WORK, BUILT TOGETHER</p><h2>Your business has a story<br />worth putting out there.</h2></div><Link className="button button-dark" to="/billing">See plans & billing <ArrowUpRight size={18} /></Link></div></section>
    </main>
    <SiteFooter />
    {activeProject && <ProjectDetails project={activeProject} close={() => setActiveProject(null)} />}
  </>
}
