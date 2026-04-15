import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extractGradeId, fetchGradeMeta, syncLadder } from '@/lib/playhq'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leagues = await prisma.league.findMany({ orderBy: { grade_name: 'asc' } })
  return NextResponse.json(leagues)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  const gradeId = extractGradeId(url)
  if (!gradeId) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  const existing = await prisma.league.findUnique({ where: { grade_id: gradeId } })
  if (existing) return NextResponse.json({ error: 'League already saved' }, { status: 400 })

  const meta = await fetchGradeMeta(gradeId)
  if (!meta) return NextResponse.json({ error: 'Could not fetch league info from PlayHQ' }, { status: 400 })

  await prisma.league.create({
    data: {
      grade_id:    gradeId,
      grade_name:  meta.name,
      season:      meta.season,
      url,
      added_by:    (session.user as any)?.name ?? 'admin',
      added_at:    new Date().toISOString(),
      sync_enabled: 1,
    },
  })

  // Immediately sync ladder
  const syncResult = await syncLadder(gradeId, meta.name, meta.season)
  return NextResponse.json({ success: true, meta, sync: syncResult })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, sync_enabled } = await req.json()
  await prisma.league.update({ where: { id }, data: { sync_enabled } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, grade_id } = await req.json()
  await prisma.ladder.deleteMany({ where: { grade_id } })
  await prisma.league.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
