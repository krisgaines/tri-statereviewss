import type { Config } from '@netlify/functions'
import { and, asc, isNull, lt, lte, or } from 'drizzle-orm'
import { getDb } from '../../db/index.js'
import { inquiries } from '../../db/schema.js'
import { deliverInquiry, emailConfigured } from '../lib/email.js'

export default async function retryEmails() {
  if (!emailConfigured()) return
  const database = getDb()
  const now = new Date()
  const pending = await database.select({ id: inquiries.id }).from(inquiries)
    .where(and(
      or(isNull(inquiries.notificationSentAt), isNull(inquiries.confirmationSentAt)),
      lt(inquiries.emailAttempts, 12), lte(inquiries.nextAttemptAt, now),
      or(isNull(inquiries.lockedUntil), lt(inquiries.lockedUntil, now)),
    )).orderBy(asc(inquiries.nextAttemptAt)).limit(4)
  await Promise.allSettled(pending.map(async (record, position) => {
    if (position) await new Promise(resolve => setTimeout(resolve, position * 1200))
    await deliverInquiry(record.id)
  }))
}

export const config: Config = { schedule: '*/5 * * * *' }
