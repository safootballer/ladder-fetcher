import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncAllLeagues, syncLadder } from '@/lib/playhq'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { gradeId } = body

  if (gradeId) {
    // Sync single league
    const league = await prisma.league.findUnique({ where: { grade_id: gradeId } })
    if (!league) return NextResponse.json({ error: 'League not found' }, { status: 404 })
    const result = await syncLadder(gradeId, league.grade_name ?? '', league.season ?? '')
    return NextResponse.json({ results: [{ name: league.grade_name, ...result }] })
  }

  // Sync all
  const results = await syncAllLeagues()
  return NextResponse.json({ results })
}
