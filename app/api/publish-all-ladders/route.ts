import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLeagueCategory } from '@/lib/leagueMap'

const COMPETITION_MAP: Record<string, string> = {
  'SANFL':                         'SANFL',
  'SANFLW':                        'SANFLW',
  "Adelaide Footy League (Men's)": 'Amateur',
  "SAWFL Women's":                 "SAWFL Women's",
  'Country Football':              'Country Football',
}

const COUNTRY_LEAGUE_MAP: Record<string, string> = {
  'Adelaide Plains':           'adelaide-plains',
  'Barossa Light & Gawler':    'barossa',
  'Eastern Eyre':              'eastern-eyre',
  'Far North':                 'far-north',
  'Great Flinders':            'great-flinders',
  'Great Southern':            'great-southern',
  'Hills Division 1':          'hills-div1',
  'Hills Country Division':    'hills-country',
  'Kangaroo Island':           'kangaroo-island',
  'Kowree Naracoorte Tatiara': 'knt',
  'Limestone Coast':           'limestone-coast',
  'Murray Valley':             'murray-valley',
  'Mid South Eastern':         'mid-south-eastern',
  'North Eastern':             'north-eastern',
  'Northern Areas':            'northern-areas',
  'Port Lincoln':              'port-lincoln',
  'River Murray':              'river-murray',
  'Riverland':                 'riverland',
  'Southern':                  'southern',
  'Spencer Gulf':              'spencer-gulf',
  'Western Eyre':              'western-eyre',
  'Whyalla':                   'whyalla',
  'Yorke Peninsula':           'yorke-peninsula',
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = process.env.SANITY_PROJECT_ID
  const dataset   = process.env.SANITY_DATASET || 'production'
  const token     = process.env.SANITY_TOKEN

  if (!projectId || !token) {
    return NextResponse.json({ error: 'Sanity env vars not configured' }, { status: 500 })
  }

  const leagues = await prisma.league.findMany({ where: { sync_enabled: 1 } })
  const results: { name: string; success: boolean; message: string }[] = []

  for (const league of leagues) {
    const gradeId = league.grade_id
    try {
      const rows = await prisma.ladder.findMany({
        where: { grade_id: gradeId },
        orderBy: { rank: 'asc' },
      })

      if (!rows.length) {
        results.push({ name: league.grade_name ?? gradeId, success: false, message: 'No ladder data' })
        continue
      }

      const cat         = getLeagueCategory(gradeId)
      const competition = COMPETITION_MAP[cat.level1] ?? 'Country Football'
      const countryLeague = cat.level1 === 'Country Football'
        ? (COUNTRY_LEAGUE_MAP[cat.level2] ?? '')
        : undefined

      const doc: Record<string, any> = {
        _id:         `ladder-${gradeId}`,
        _type:       'ladder',
        title:       `${league.grade_name ?? cat.level3} Ladder ${league.season ?? ''}`,
        slug:        { _type: 'slug', current: `ladder-${gradeId}` },
        competition,
        gradeName:   cat.level3,
        season:      league.season ?? '2026',
        syncedAt:    new Date().toISOString(),
        teams: rows.map(r => ({
          _key:          `team-${r.id}`,
          rank:          r.rank,
          teamName:      r.team_name,
          played:        r.played,
          wins:          r.wins,
          losses:        r.losses,
          draws:         r.draws,
          byes:          r.byes ?? 0,
          points:        r.points,
          percentage:    r.percentage ?? 0,
          pointsFor:     r.points_for ?? 0,
          pointsAgainst: r.points_against ?? 0,
          forfeits:      r.forfeits ?? 0,
        }))
      }

      if (countryLeague) doc.countryLeague = countryLeague

      const res = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
        }
      )

      if (!res.ok) {
        const err = await res.text()
        results.push({ name: league.grade_name ?? gradeId, success: false, message: `Sanity error: ${err}` })
      } else {
        results.push({ name: league.grade_name ?? gradeId, success: true, message: 'Published' })
      }
    } catch (e: any) {
      results.push({ name: league.grade_name ?? gradeId, success: false, message: e.message })
    }
  }

  const succeeded = results.filter(r => r.success).length
  const failed    = results.filter(r => !r.success).length

  return NextResponse.json({ success: true, results, summary: { succeeded, failed, total: leagues.length } })
}