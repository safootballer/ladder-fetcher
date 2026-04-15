import { NextRequest, NextResponse } from 'next/server'
import { syncAllLeagues } from '@/lib/playhq'

/**
 * GET /api/cron
 * Called by Render Cron Job daily at 3am UTC.
 * Protected by CRON_SECRET env var.
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

  console.log(`[CRON] Auto-sync started at ${new Date().toISOString()}`)

  try {
    const results = await syncAllLeagues()
    const success = results.filter(r => r.success).length
    const failed  = results.filter(r => !r.success).length

    console.log(`[CRON] Done: ${success} succeeded, ${failed} failed`)
    results.forEach(r => console.log(`[CRON] ${r.success ? '✅' : '❌'} ${r.name}: ${r.message}`))

    return NextResponse.json({ success: true, results, summary: { success, failed } })
  } catch (e: any) {
    console.error(`[CRON] Fatal error: ${e.message}`)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
