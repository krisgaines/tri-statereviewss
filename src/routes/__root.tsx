import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'


import '../styles.css'

const siteName = 'Social Media Management in Ohio, PA & WV | Tri-State Reviews'
const siteDescription = 'Social media management for local businesses in Ohio, Pennsylvania, and West Virginia. Thoughtful content, real connections, and monthly plans starting at $150.'

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: 'Tri-State Reviews',
      },
      {
        name: 'theme-color',
        content: '#303c2d',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
