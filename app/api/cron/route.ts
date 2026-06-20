import { NextRequest, NextResponse } from 'next/server'
import { syncAllLeagues } from '@/lib/playhq'

export const maxDuration = 300 // allow up to 5 minutes if platform supports it

/**
 * GET /api/cron
 * Called by Render Cron Job daily at 3am UTC.
 * Protected by CRON_SECRET env var.
 *
 * Responds immediately to avoid the cron trigger's own HTTP client timing out,
 * then continues the sync in the background.
 *
 * Render Cron setup:
 *   Command:  curl -X GET https://your-app.onrender.com/api/cron -H "x-cron-secret: YOUR_SECRET"
 *   Schedule: 0 3 * * *  (3am UTC daily)
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log(`[CRON] Auto-sync triggered at ${new Date().toISOString()} — running in background`)

  // Fire-and-forget: don't await, so the HTTP response returns immediately.
  // This prevents the cron caller's fetch from timing out waiting for headers.
  runSyncInBackground()

  return NextResponse.json({
    success: true,
    message: 'Sync started in background — check logs for progress and completion',
    startedAt: new Date().toISOString(),
  })
}

async function runSyncInBackground() {
  const startedAt = Date.now()
  try {
    const results = await syncAllLeagues()
    const success = results.filter(r => r.success).length
    const failed  = results.filter(r => !r.success).length
    const durationSec = ((Date.now() - startedAt) / 1000).toFixed(1)

    console.log(`[CRON] Done in ${durationSec}s: ${success} succeeded, ${failed} failed`)
    results.forEach(r => console.log(`[CRON] ${r.success ? '✅' : '❌'} ${r.name}: ${r.message}`))
  } catch (e: any) {
    console.error(`[CRON] Fatal error: ${e.message}`)
  }
}
