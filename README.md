# Tri-State Reviews

A responsive social media management website for local businesses in Ohio, Pennsylvania, and West Virginia. The site separates its homepage, portfolio, and plans and billing into focused pages, with inquiry and support forms and a community-focused visual identity.

## Technology

- TanStack Start, React 19, TanStack Router, and TypeScript
- Vite and custom responsive CSS with Tailwind available
- Lucide icons, DM Sans and Manrope typography
- Netlify Functions for server-side submission validation, email delivery, and Stripe-hosted checkout
- Netlify Database with the native Drizzle adapter for persistent inquiries
- Resend for transactional owner notifications and customer confirmations
- Netlify Image CDN for locally stored portfolio photographs

## Local development

Use Node.js 22 and pnpm. Install dependencies with `pnpm install`, link your Netlify site with `netlify link` if necessary, and start the full Netlify development environment with:

```sh
netlify dev --port 8889
```

This serves the website and its functions together. `pnpm dev` starts only the frontend; use Netlify Dev to submit working forms. Netlify CLI must be available on your machine. Local database access requires the linked site's Netlify Database environment. The production build and migration application are handled by the deployment pipeline.

## Email activation

The email integration has been implemented, but sending real mail requires an email-service account and a verified sender domain. No credentials are committed to the project.

1. Create a Resend account and verify a domain you control using its DNS instructions.
2. Create a sending API key and store it securely as the Netlify environment variable `RESEND_API_KEY`, scoped to Functions.
3. Add `RESEND_FROM_EMAIL` in Netlify with a sender address on that verified domain, also scoped to Functions. Do not use the Gmail inbox as the sender; it is the notification recipient and customer reply-to address.
4. Make the variables available to the appropriate deploy contexts and redeploy.
5. Submit a real inquiry and a support request after deployment. Confirm that both arrive at `tristatereviewss@gmail.com` and that the submitter receives a receipt. Check spam folders and the Resend delivery dashboard if necessary.

Both forms send owner notifications to `tristatereviewss@gmail.com`. Replying to an owner notification replies to the submitter; replying to a confirmation goes to that inbox. Confirmations deliberately do not echo submitted messages, preventing the form from distributing arbitrary content to third-party addresses.

Messages are saved before email is attempted. If email settings are missing, the website honestly reports that receipts are delayed and supplies a reference. Once sending is configured, the production scheduled worker processes the backlog. It runs every five minutes and processes four records per run, with exponential retry delays, a database lease, independent notification/confirmation tracking, and provider idempotency keys. After twelve attempts, a record requires operator attention; the original message remains saved. The retry schedule only runs on published production deploys. Preview submissions attempt delivery immediately if credentials are enabled there, but do not receive scheduled retries. Use production-only email credentials unless preview mail is desired.

## Stripe checkout activation

Checkout creates a Stripe-hosted Checkout Session. Customers can pay once for one month of Associates ($150), Friends ($300), or Family ($450), or start an automatically renewing monthly subscription for one of those plans. Blueprint is a $200 one-time payment only. Plan names, prices, and recurring cadence are set on the server; inquiries alone never create a charge or subscription.

1. In Stripe, start in test mode and copy the test-mode secret API key. In Netlify, add it under the project’s environment variables as `STRIPE_SECRET_KEY`, scoped to Functions at runtime and enabled for the deploy contexts you intend to use. Checkout Sessions are created only on the server.
2. Create a webhook destination for `https://YOUR_SITE_DOMAIN/api/stripe/webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
3. Reveal that destination’s signing secret in Stripe and add it to Netlify as `STRIPE_WEBHOOK_SECRET`, also scoped to Functions at runtime and enabled in the matching deploy contexts. Each destination has a different signing secret. Keep both values out of source control and frontend code.
4. Make both variables available to the deploy contexts where checkout should operate, then redeploy. Use test-mode credentials and a test-mode webhook destination while testing. Before accepting real payments, create a separate live-mode destination and set its live secret API key and signing secret in Netlify.
5. Test one-time purchases for all four offers, monthly subscriptions for Associates, Friends, and Family, Blueprint’s one-time-only restriction, and webhook delivery from Stripe’s Workbench/Webhooks delivery view. Confirm signed events succeed and invalid signatures are rejected.

For local webhook testing, run the Stripe CLI listener forwarding to `localhost:8889/api/stripe/webhook` and set its generated signing secret as `STRIPE_WEBHOOK_SECRET` in the local Netlify Functions environment. Use a test-mode `STRIPE_SECRET_KEY` and test-mode events.

The webhook verifies Stripe signatures and acknowledges event delivery; payment and subscription records remain in Stripe, and the site does not create a second payment ledger. The webhook currently does not send custom fulfillment messages or update local order state. Operators review charges and manage subscriptions in Stripe. One-time payments for monthly plans cover one month and do not renew. Subscriptions renew monthly until canceled; customers can contact `tristatereviewss@gmail.com` for help managing or canceling a subscription. This site does not collect or store card numbers.

## Data and migrations

The source of truth is `db/schema.ts`. The `inquiries` table stores contact details, the message type, optional business and plan details, explicit consent, timestamps, and email-processing status. There is no public endpoint to read inquiries. Authorized operators can review inquiries through Netlify's database tooling. For example, `netlify db connect --query "SELECT id, kind, created_at, notification_sent_at, confirmation_sent_at, email_attempts, email_error FROM inquiries ORDER BY created_at DESC LIMIT 25"` inspects delivery status without displaying message content.

Migration files in `netlify/database/migrations/` are applied automatically during deployment. Do not apply migrations manually or change already-applied migrations. For future schema changes, run `netlify db status`, modify the schema, and generate a new migration with `pnpm exec drizzle-kit generate --name descriptive_change`.

The public submission endpoint checks origin, validates and bounds input, requires consent, rejects honeypot submissions, and applies an IP-based platform rate limit. Client-generated UUIDs and payload hashes make retries safe without duplicating saved messages. API failures do not discard messages already saved in the database. No message content or credentials are logged.

## Content editing

- Homepage and inquiry/support form: `src/routes/index.tsx`
- Portfolio and interactive Blueprint sample slideshow: `src/routes/portfolio.tsx`
- Plan details, billing FAQs, and Stripe checkout: `src/routes/billing.tsx`
- Shared plan and portfolio data: `src/lib/site-data.ts`
- Shared navigation, footer, and privacy dialog: `src/components/site-shell.tsx`
- Site title and share description: `src/routes/__root.tsx`
- Colors, typography, responsive layout, and motion preferences: `src/styles.css`
- Sender integration and email copy: `netlify/lib/email.ts`
- Portfolio photographs: `public/img/`; images are served through Netlify Image CDN.

The monthly plans are Associates ($150), Friends ($300), and Family ($450), priced in USD. Customers can pay once for a single month or select an automatically renewing monthly subscription. The Blueprint is a $200 one-time offer with a strategy slideshow, illustrative projections, and an initial ad launch including $50 toward ad spend; additional standard ad runs are $50 each. Projections are illustrative, not guaranteed outcomes. Listed scopes are a starting point; final deliverables are agreed with the customer before service begins. Selecting an offer to inquire does not create a subscription or charge a payment. The portfolio includes the Tri-State Reviews in-house website and clearly labeled fictional sample concepts; they do not imply outside client relationships or verified results.

## Validation

No local build, development server, typecheck, or test commands were run during implementation, as required by the build environment. The deployment pipeline performs installation and build validation. The database migration was generated, but the database branch does not yet exist; Netlify provisions it and applies the migration during deployment. Live database submissions and email delivery require post-deployment verification and the email activation steps above.
