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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function safePost(payload: object): Promise<{ data: any; error: string | null }> {
  try {
    const res = await fetch(PLAYHQ_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      return { data: null, error: `Non-JSON response (status ${res.status}): ${text.slice(0, 200)}` }
    }

    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 300)}` }
    }

    if (json.errors?.length) {
      return { data: null, error: `GraphQL errors: ${JSON.stringify(json.errors).slice(0, 300)}` }
    }

    if (!json.data) {
      return { data: null, error: 'Empty data field in response' }
    }

    return { data: json.data, error: null }
  } catch (e: any) {
    return { data: null, error: `Network/fetch error: ${e.message}` }
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
  const { data } = await safePost({ query: GRADE_META_QUERY, variables: { gradeID: gradeId } })
  if (!data) return null
  const g = data.discoverGrade
  return { id: g.id, name: g.name, season: g.season.name }
}

export async function syncLadder(
  gradeId: string,
  gradeName: string,
  season: string,
  retries = 2,
): Promise<{ success: boolean; message: string }> {
  const { prisma } = await import('@/lib/prisma')
  const syncedAt = new Date().toISOString()

  let lastError = ''
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Back off before retrying — PlayHQ is likely rate-limiting
      await sleep(1500 * attempt)
    }

    const { data, error } = await safePost({ query: LADDER_QUERY, variables: { gradeID: gradeId } })

    if (error) {
      lastError = error
      console.log(`[LADDER] Attempt ${attempt + 1} failed for ${gradeName} (${gradeId}): ${error}`)
      continue
    }

    const grade = data?.discoverGrade
    if (!grade?.ladder) {
      lastError = 'No ladder data returned (grade may have no fixtures yet)'
      console.log(`[LADDER] ${gradeName} (${gradeId}): ${lastError}`)
      continue
    }

    // Success — save to DB
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

      await prisma.league.update({
        where: { grade_id: gradeId },
        data:  { last_synced_at: syncedAt },
      })

      return { success: true, message: `${updated} updated, ${added} added` }
    } catch (e: any) {
      lastError = `DB error: ${e.message}`
      console.log(`[LADDER] ${gradeName} (${gradeId}): ${lastError}`)
    }
  }

  return { success: false, message: lastError || 'Failed to fetch from PlayHQ' }
}

export async function syncAllLeagues(): Promise<{ name: string; success: boolean; message: string }[]> {
  const { prisma } = await import('@/lib/prisma')
  const leagues = await prisma.league.findMany({ where: { sync_enabled: 1 } })
  const results = []

  for (const lg of leagues) {
    const res = await syncLadder(lg.grade_id, lg.grade_name ?? '', lg.season ?? '')
    results.push({ name: lg.grade_name ?? lg.grade_id, ...res })

    // Throttle requests to avoid PlayHQ rate limiting
    await sleep(400)
  }

  return results
}
