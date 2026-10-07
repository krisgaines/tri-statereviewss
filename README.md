# Tri-State Reviews

A responsive social media management website for local businesses in Ohio, Pennsylvania, and West Virginia. The site includes monthly pricing, a one-time strategy and ad-launch offer, filterable sample creative projects, inquiry and support forms, and a community-focused visual identity.

## Technology

- TanStack Start, React 19, TanStack Router, and TypeScript
- Vite and custom responsive CSS with Tailwind available
- Lucide icons, DM Sans and Manrope typography
- Netlify Functions for server-side submission validation, email delivery, and Square checkout links
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

## Square checkout activation

Checkout uses Square-hosted payment links. Customers can pay once for one month of Associates ($150), Friends ($300), or Family ($450), or start an automatically renewing monthly subscription for one of those plans. Blueprint is a $200 one-time payment only. Inquiries alone never create a charge or subscription.

1. Create a Square application with permission to create payment links and subscriptions, and configure its sandbox credentials first. Store its access token as the runtime-only Netlify variable `SQUARE_ACCESS_TOKEN`.
2. Set `SQUARE_ENVIRONMENT` to `sandbox` while testing, then `production` when ready to accept real payments. Set `SQUARE_LOCATION_ID` to the matching environment’s location ID.
3. In Square, create monthly subscription plan variations for Associates, Friends, and Family at the approved prices. Add each environment’s variation ID as the runtime-only Netlify variables `SQUARE_ASSOCIATES_PLAN_VARIATION_ID`, `SQUARE_FRIENDS_PLAN_VARIATION_ID`, and `SQUARE_FAMILY_PLAN_VARIATION_ID`.
4. Make the variables available to the desired deploy contexts and redeploy. Keep tokens and plan IDs out of frontend code and source control.
5. Test all one-time and monthly options in Square sandbox, including Blueprint’s one-time-only checkout. Before switching to production, confirm the production location and plan variation IDs and complete a real low-value test purchase if appropriate.

One-time payments for monthly plans cover one month and do not renew. Monthly subscriptions renew automatically until canceled; customers can contact `tristatereviewss@gmail.com` for help managing or canceling a subscription. Square processes payment information and maintains the payment/subscription records in the Square account; this site does not collect card numbers or expose payment credentials in the browser. Operators review payments and manage subscriptions in Square.

## Data and migrations

The source of truth is `db/schema.ts`. The `inquiries` table stores contact details, the message type, optional business and plan details, explicit consent, timestamps, and email-processing status. There is no public endpoint to read inquiries. Authorized operators can review inquiries through Netlify's database tooling. For example, `netlify db connect --query "SELECT id, kind, created_at, notification_sent_at, confirmation_sent_at, email_attempts, email_error FROM inquiries ORDER BY created_at DESC LIMIT 25"` inspects delivery status without displaying message content.

Migration files in `netlify/database/migrations/` are applied automatically during deployment. Do not apply migrations manually or change already-applied migrations. For future schema changes, run `netlify db status`, modify the schema, and generate a new migration with `pnpm exec drizzle-kit generate --name descriptive_change`.

The public submission endpoint checks origin, validates and bounds input, requires consent, rejects honeypot submissions, and applies an IP-based platform rate limit. Client-generated UUIDs and payload hashes make retries safe without duplicating saved messages. API failures do not discard messages already saved in the database. No message content or credentials are logged.

## Content editing

- Brand, landing-page copy, plans, sample projects, and FAQs: `src/routes/index.tsx`
- Site title and share description: `src/routes/__root.tsx`
- Colors, typography, responsive layout, and motion preferences: `src/styles.css`
- Sender integration and email copy: `netlify/lib/email.ts`
- Photos: `public/img/`; the original stock photographs came from Unsplash image IDs `photo-1442512595331-e89e73853f31`, `photo-1416879595882-3373a0480b5b`, and `photo-1509440159596-0249088772ff`. The floral, bookshop, and market samples use `photo-1490750967868-88aa4486c946`, `photo-1507842217343-583bb7270b66`, and `photo-1542838132-92c53300491e` respectively.

The monthly plans are Associates ($150), Friends ($300), and Family ($450), priced in USD. Customers can pay once for a single month or select an automatically renewing monthly subscription. The Blueprint is a $200 one-time offer with a strategy slideshow, illustrative projections, and an initial ad launch including $50 toward ad spend; additional standard ad runs are $50 each. Projections are illustrative, not guaranteed outcomes. Listed scopes are a starting point; final deliverables are agreed with the customer before service begins. Selecting an offer to inquire does not create a subscription or charge a payment. The portfolio businesses are fictional, clearly labeled sample concepts, not real clients or verified results. Replace them with approved client work when available.

## Validation

No local build, development server, typecheck, or test commands were run during implementation, as required by the build environment. The deployment pipeline performs installation and build validation. The database migration was generated, but the database branch does not yet exist; Netlify provisions it and applies the migration during deployment. Live database submissions and email delivery require post-deployment verification and the email activation steps above.
