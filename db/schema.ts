import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey(),
  kind: text('kind', { enum: ['inquiry', 'support'] }).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  business: text('business'),
  state: text('state'),
  plan: text('plan'),
  subject: text('subject'),
  message: text('message').notNull(),
  consent: boolean('consent').notNull(),
  payloadHash: text('payload_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  notificationSentAt: timestamp('notification_sent_at', { withTimezone: true }),
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  emailAttempts: integer('email_attempts').notNull().default(0),
  emailError: text('email_error'),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).notNull().defaultNow(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
})
