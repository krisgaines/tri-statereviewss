export type Plan = 'Associates' | 'Friends' | 'Family' | 'Blueprint' | 'Not sure yet'
export type CheckoutPlan = Exclude<Plan, 'Not sure yet'>
export type FormKind = 'inquiry' | 'support'

export const image = (name: string, width = 700) => `/.netlify/images?url=/img/${name}.jpg&w=${width}&fm=webp&q=85`

export const plans: { name: CheckoutPlan; price: number; cadence: 'month' | 'once'; description: string; features: string[] }[] = [
  { name: 'Associates', price: 150, cadence: 'month', description: 'A little help. A stronger presence.', features: ['One social media platform', 'Monthly content planning', 'Branded posts & captions', 'Scheduled publishing'] },
  { name: 'Friends', price: 300, cadence: 'month', description: 'More connection. More possibilities.', features: ['Up to two social platforms', 'Everything in Associates', 'Stories & community support', 'Monthly performance snapshot'] },
  { name: 'Family', price: 450, cadence: 'month', description: 'Your business, with us by your side.', features: ['Up to three social platforms', 'Everything in Friends', 'Short-form video guidance', 'A dedicated strategy check-in'] },
  { name: 'Blueprint', price: 200, cadence: 'once', description: 'A one-time strategy deck and ad launch.', features: ['A custom Blueprint strategy slideshow', 'Illustrative growth projections for each monthly plan', '$50 allocated toward your initial ad run', 'We set up and launch your initial ads'] },
]

export type Project = {
  name: string
  category: string
  visual: 'photo' | 'website' | 'blueprint'
  image?: string
  headline: string
  tag: string
  description: string
  deliverables: string[]
  color: string
}

export const projects: Project[] = [
  { name: 'Willow & Co. Coffee', category: 'Food & drink', visual: 'photo', image: 'coffee', headline: 'Good things\nare brewing.', tag: 'A daily dose of community', description: 'An independent neighborhood café serving espresso, fresh pastries, and a familiar place to meet. This sample shows how everyday café moments can become warm, recognizable social content.', deliverables: ['A warm, consistent visual direction', 'Coffee features and behind-the-scenes stories', 'A sample monthly posting calendar'], color: 'coffee-project' },
  { name: 'Tri-State Reviews', category: 'Our website', visual: 'website', headline: 'Local roots.\nSocial reach.', tag: 'Our own website', description: 'The website you are viewing is an in-house Tri-State Reviews project. It introduces the business, explains the service plans, and gives prospective clients clear paths to explore sample work, ask a question, or check out.', deliverables: ['A responsive home, portfolio, and billing experience', 'Clear service and plan information', 'Inquiry and hosted-checkout journeys'], color: 'website-project' },
  { name: 'The Sunday Bakehouse', category: 'Food & drink', visual: 'photo', image: 'bakery', headline: 'A little\nsweeter.', tag: 'Fresh from the oven. Into the feed.', description: 'An independent bakery with small-batch breads, seasonal treats, and the kind of morning ritual regulars build into their week. This concept brings the menu and the people behind it into the feed.', deliverables: ['An editorial-style social feed concept', 'New menu and seasonal launch posts', 'Behind-the-scenes story templates'], color: 'bakery-project' },
  { name: 'Maple & Main Floral', category: 'Retail', visual: 'photo', image: 'florals', headline: 'Flowers for\ntoday.', tag: 'Seasonal flowers, thoughtfully shared', description: 'A neighborhood flower studio creating seasonal bouquets, small celebration arrangements, and thoughtful everyday gifts. The sample approach follows the color and rhythm of each season.', deliverables: ['Seasonal bouquet spotlights', 'Occasion-based gift and arrangement ideas', 'A bright, botanical visual direction'], color: 'floral-project' },
  { name: 'Kindred Social Studio', category: 'Blueprint sample', visual: 'blueprint', headline: 'Good work,\nwell shared.', tag: 'A sample Blueprint slideshow', description: 'A fictional small social-media agency concept that shows the kind of clear, practical thinking a Blueprint can contain: positioning, content pillars, a sample posting rhythm, and launch notes. The agency and recommendations are illustrative—not a real client engagement or measured result.', deliverables: ['Positioning and audience prompts', 'Three sample content pillars', 'An illustrative four-week content rhythm', 'A practical launch checklist'], color: 'blueprint-project' },
  { name: 'Market Street Provisions', category: 'Retail', visual: 'photo', image: 'market', headline: 'Fresh finds,\nclose to home.', tag: 'Good food from around the corner', description: 'A local provisions shop with fresh produce, pantry staples, and locally made finds for everyday meals. The sample content makes seasonal ingredients and neighborhood makers easy to discover.', deliverables: ['Produce and pantry product features', 'Local-maker introductions', 'Simple seasonal meal inspiration'], color: 'market-project' },
]

export const blueprintSlides = [
  { kicker: '01 · THE FOUNDATION', title: 'Good work,\nwell shared.', copy: 'A clear social direction for a small, community-minded creative studio.', note: 'Start with what makes the studio worth remembering.' },
  { kicker: '02 · THE AUDIENCE', title: 'Make room for\nthe right people.', copy: 'Speak to independent owners who want thoughtful content without another full-time task.', note: 'Audience notes are prompts to validate together.' },
  { kicker: '03 · CONTENT PILLARS', title: 'Three threads.\nOne steady voice.', copy: 'Show the work · Share the thinking · Make local connections.', note: 'A usable framework, not a pile of random posts.' },
  { kicker: '04 · THE RHYTHM', title: 'A month with\nroom to breathe.', copy: 'A sample four-week cadence balancing practical advice, studio process, and community stories.', note: 'The final schedule is tailored with each client.' },
]
