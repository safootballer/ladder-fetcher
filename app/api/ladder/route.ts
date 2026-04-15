import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const gradeId = searchParams.get('gradeId')
  if (!gradeId) return NextResponse.json({ error: 'gradeId required' }, { status: 400 })

  const rows = await prisma.ladder.findMany({
    where: { grade_id: gradeId },
    orderBy: { rank: 'asc' },
  })

  return NextResponse.json(rows)
}
