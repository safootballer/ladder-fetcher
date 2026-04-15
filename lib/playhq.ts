const PLAYHQ_URL = 'https://api.playhq.com/graphql'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/json',
  Origin: 'https://www.playhq.com',
  Referer: 'https://www.playhq.com/',
  tenant: 'afl',
}

const GRADE_META_QUERY = `
query GradeMeta($gradeID: ID!) {
  discoverGrade(gradeID: $gradeID) {
    id name
    season { name }
  }
}
`

const LADDER_QUERY = `
query GradeLadder($gradeID: ID!) {
  discoverGrade(gradeID: $gradeID) {
    ladder {
      generatedFrom { id name }
      standings {
        played won lost drawn byes
        competitionPoints alternatePercentage
        pointsFor pointsAgainst forfeits
        team { id name }
      }
    }
  }
}
`

async function safePost(payload: object) {
  try {
    const res = await fetch(PLAYHQ_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data ?? null
  } catch {
    return null
  }
}

export function extractGradeId(url: string): string | null {
  if (!url) return null
  const parts = url.replace(/\/$/, '').split('/')
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].length >= 6) return parts[i]
  }
  return null
}

export async function fetchGradeMeta(gradeId: string) {
  const data = await safePost({ query: GRADE_META_QUERY, variables: { gradeID: gradeId } })
  if (!data) return null
  const g = data.discoverGrade
  return { id: g.id, name: g.name, season: g.season.name }
}

export async function syncLadder(gradeId: string, gradeName: string, season: string): Promise<{ success: boolean; message: string }> {
  const { prisma } = await import('@/lib/prisma')
  const syncedAt = new Date().toISOString()

  const data = await safePost({ query: LADDER_QUERY, variables: { gradeID: gradeId } })
  if (!data) return { success: false, message: 'Failed to fetch from PlayHQ' }

  const grade = data?.discoverGrade
  if (!grade?.ladder) return { success: false, message: 'No ladder data returned' }

  let updated = 0
  let added = 0

  try {
    for (const block of grade.ladder) {
      const roundId   = block.generatedFrom.id
      const roundName = block.generatedFrom.name

      for (let idx = 0; idx < block.standings.length; idx++) {
        const row  = block.standings[idx]
        const rank = idx + 1

        const existing = await prisma.ladder.findFirst({
          where: { team_id: row.team.id, season, round_id: roundId },
        })

        const vals = {
          grade_id:       gradeId,
          grade_name:     gradeName,
          round_name:     roundName,
          team_name:      row.team.name,
          rank,
          played:         row.played,
          wins:           row.won,
          losses:         row.lost,
          draws:          row.drawn,
          byes:           row.byes ?? 0,
          points:         row.competitionPoints,
          percentage:     row.alternatePercentage,
          points_for:     row.pointsFor ?? 0,
          points_against: row.pointsAgainst ?? 0,
          forfeits:       row.forfeits ?? 0,
          synced_at:      syncedAt,
        }

        if (existing) {
          await prisma.ladder.update({ where: { id: existing.id }, data: vals })
          updated++
        } else {
          await prisma.ladder.create({
            data: { team_id: row.team.id, season, round_id: roundId, ...vals },
          })
          added++
        }
      }
    }

    // Update last_synced_at
    await prisma.league.update({
      where: { grade_id: gradeId },
      data:  { last_synced_at: syncedAt },
    })

    return { success: true, message: `${updated} updated, ${added} added` }
  } catch (e: any) {
    return { success: false, message: e.message }
  }
}

export async function syncAllLeagues(): Promise<{ name: string; success: boolean; message: string }[]> {
  const { prisma } = await import('@/lib/prisma')
  const leagues = await prisma.league.findMany({ where: { sync_enabled: 1 } })
  const results = []
  for (const lg of leagues) {
    const res = await syncLadder(lg.grade_id, lg.grade_name ?? '', lg.season ?? '')
    results.push({ name: lg.grade_name ?? lg.grade_id, ...res })
  }
  return results
}
