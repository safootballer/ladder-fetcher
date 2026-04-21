'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { getLeagueCategory, LEVEL1_ORDER, LEVEL2_ORDER } from '@/lib/leagueMap'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [leagues, setLeagues]             = useState<any[]>([])
  const [level1, setLevel1]               = useState<string>('SANFL')
  const [level2, setLevel2]               = useState<string | null>(null)
  const [activeGradeId, setActiveGradeId] = useState<string | null>(null)
  const [ladder, setLadder]               = useState<any[]>([])
  const [loadingLadder, setLoadingLadder] = useState(false)
  const [copiedId, setCopiedId]           = useState<string | null>(null)
  const [publishing, setPublishing]       = useState(false)
  const [publishMsg, setPublishMsg]       = useState<{ type: string; text: string } | null>(null)

  const loadLeagues = useCallback(async () => {
    const data = await fetch('/api/leagues').then(r => r.json())
    const list = Array.isArray(data) ? data : []
    setLeagues(list)
  }, [])

  useEffect(() => { loadLeagues() }, [])
  useEffect(() => {
    window.addEventListener('leagues:updated', loadLeagues)
    return () => window.removeEventListener('leagues:updated', loadLeagues)
  }, [loadLeagues])

  useEffect(() => {
    const l2options = getLevel2Options(level1)
    setLevel2(l2options[0] ?? null)
    setActiveGradeId(null)
  }, [level1, leagues])

  useEffect(() => {
    if (!level2) return
    const grades = getGradesForLevel2(level1, level2)
    if (grades.length > 0) setActiveGradeId(grades[0].grade_id)
  }, [level2])

  useEffect(() => {
    if (!activeGradeId) return
    setPublishMsg(null)
    setLoadingLadder(true)
    fetch(`/api/ladder?gradeId=${activeGradeId}`)
      .then(r => r.json())
      .then(d => setLadder(Array.isArray(d) ? d : []))
      .finally(() => setLoadingLadder(false))
  }, [activeGradeId])

  function getLevel2Options(l1: string): string[] {
    const order = LEVEL2_ORDER[l1] ?? []
    const available = new Set(
      leagues
        .filter(lg => getLeagueCategory(lg.grade_id).level1 === l1)
        .map(lg => getLeagueCategory(lg.grade_id).level2)
    )
    return order.filter(l2 => available.has(l2))
  }

  function getGradesForLevel2(l1: string, l2: string) {
    return leagues
      .filter(lg => {
        const cat = getLeagueCategory(lg.grade_id)
        return cat.level1 === l1 && cat.level2 === l2
      })
      .sort((a, b) => getLeagueCategory(a.grade_id).sortOrder - getLeagueCategory(b.grade_id).sortOrder)
  }

  function copyTable() {
    if (!ladder.length || !activeGradeId) return
    const headers = ['Rank', 'Team', 'P', 'PTS', '%', 'W', 'L', 'D', 'BYE', 'F', 'A', 'FORF']
    const rows = ladder.map(r => [
      r.rank, r.team_name, r.played, r.points,
      r.percentage?.toFixed(2), r.wins, r.losses, r.draws,
      r.byes, r.points_for, r.points_against, r.forfeits,
    ])
    const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedId(activeGradeId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  async function publishToWebsite() {
    if (!activeGradeId) return
    setPublishing(true)
    setPublishMsg(null)
    try {
      const res  = await fetch('/api/publish-ladder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId: activeGradeId }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishMsg({ type: 'success', text: `✅ Published to website: ${data.title}` })
      } else {
        setPublishMsg({ type: 'error', text: `❌ ${data.error ?? 'Publish failed'}` })
      }
    } catch (e: any) {
      setPublishMsg({ type: 'error', text: `❌ ${e.message}` })
    }
    setPublishing(false)
  }

  const level2Options = getLevel2Options(level1)
  const gradeOptions  = level2 ? getGradesForLevel2(level1, level2) : []
  const currentLeague = leagues.find(l => l.grade_id === activeGradeId)

  const tabStyle = (active: boolean, color = '#2ca3ee') => ({
    padding: '0.5rem 1.125rem', borderRadius: 8,
    fontSize: '0.82rem', fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    border: active ? `1.5px solid ${color}` : '1.5px solid rgba(44,163,238,0.2)',
    background: active ? `rgba(44,163,238,0.15)` : 'transparent',
    color: active ? color : 'rgba(255,255,255,0.55)',
    transition: 'all 0.15s',
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div className="fade-up" style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.25rem', color: '#2ca3ee', margin: 0 }}>
          League Ladders
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
          {'Welcome back, '}<strong style={{ color: '#fff' }}>{session?.user?.name}</strong>
          {' · Auto-synced daily from PlayHQ'}
        </p>
      </div>

      {leagues.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No leagues configured yet.</p>
        </div>
      ) : (
        <>
          {/* Level 1 */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {LEVEL1_ORDER.filter(l1 => getLevel2Options(l1).length > 0).map(l1 => (
              <button key={l1} onClick={() => setLevel1(l1)} style={tabStyle(level1 === l1, '#2ca3ee')}>
                {l1}
              </button>
            ))}
          </div>

          {/* Level 2 */}
          {level2Options.length > 0 && (
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem', paddingLeft: '0.5rem', borderLeft: '3px solid rgba(44,163,238,0.3)' }}>
              {level2Options.map(l2 => (
                <button key={l2} onClick={() => setLevel2(l2)} style={tabStyle(level2 === l2, '#e6fe00')}>
                  {l2}
                </button>
              ))}
            </div>
          )}

          {/* Level 3 */}
          {gradeOptions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '3px solid rgba(230,254,0,0.2)' }}>
              {gradeOptions.map(lg => {
                const cat = getLeagueCategory(lg.grade_id)
                return (
                  <button key={lg.grade_id} onClick={() => setActiveGradeId(lg.grade_id)}
                    style={tabStyle(activeGradeId === lg.grade_id, '#4ade80')}>
                    {cat.level3}
                  </button>
                )
              })}
            </div>
          )}

          {/* Ladder content */}
          {currentLeague && (
            <>
              {/* Meta cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Competition</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginTop: 4, lineHeight: 1.3 }}>
                    {currentLeague.grade_name}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Season</div>
                  <div className="metric-value" style={{ fontSize: '1.25rem' }}>{currentLeague.season}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Last Synced</div>
                  <div className="metric-value" style={{ fontSize: '1.25rem' }}>
                    {currentLeague.last_synced_at?.slice(0, 10) ?? 'Never'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {ladder.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Ctrl+V into Excel or Google Sheets</span>
                  <button onClick={copyTable} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                    {copiedId === activeGradeId ? '✅ Copied!' : '📋 Copy Table'}
                  </button>
                  <button
                    onClick={publishToWebsite}
                    disabled={publishing}
                    style={{
                      background: publishing ? 'rgba(230,254,0,0.3)' : '#e6fe00',
                      color: '#000', border: 'none', borderRadius: 8,
                      padding: '0.45rem 1rem', fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.06em',
                      textTransform: 'uppercase', cursor: publishing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {publishing ? 'Publishing...' : '🌐 Publish to Website'}
                  </button>
                </div>
              )}

              {/* Publish message */}
              {publishMsg && (
                <div style={{
                  marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem',
                  background: publishMsg.type === 'success' ? 'rgba(5,46,22,0.8)' : 'rgba(45,0,0,0.8)',
                  border: `1px solid ${publishMsg.type === 'success' ? '#4ade80' : '#f87171'}`,
                  color: publishMsg.type === 'success' ? '#4ade80' : '#f87171',
                }}>
                  {publishMsg.text}
                </div>
              )}

              {/* Ladder table */}
              {loadingLadder ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' }}>Loading ladder...</p>
              ) : ladder.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>No ladder data yet. Click <strong style={{ color: '#e6fe00' }}>Sync All Now</strong> in the sidebar.</p>
                </div>
              ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <table className="ladder-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th><th>Team</th>
                        <th title="Played">P</th><th title="Points">PTS</th>
                        <th title="Percentage">%</th><th title="Wins">W</th>
                        <th title="Losses">L</th><th title="Draws">D</th>
                        <th title="Byes">BYE</th><th title="Points For">F</th>
                        <th title="Points Against">A</th><th title="Forfeits">FORF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ladder.map((row, i) => (
                        <tr key={row.id} className={`${i < 8 ? 'top-8' : ''} ${i === 0 ? 'rank-1' : ''}`}>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 24, height: 24, borderRadius: '50%',
                              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '0.8rem',
                              background: i === 0 ? 'rgba(230,254,0,0.2)' : i < 8 ? 'rgba(44,163,238,0.15)' : 'rgba(255,255,255,0.05)',
                              color: i === 0 ? '#e6fe00' : i < 8 ? '#2ca3ee' : 'rgba(255,255,255,0.4)',
                            }}>{row.rank}</span>
                          </td>
                          <td style={{ fontWeight: i === 0 ? 700 : 400 }}>{row.team_name}</td>
                          <td>{row.played}</td>
                          <td style={{ fontWeight: 700, color: '#e6fe00' }}>{row.points}</td>
                          <td>{row.percentage?.toFixed(2)}</td>
                          <td style={{ color: '#4ade80' }}>{row.wins}</td>
                          <td style={{ color: '#f87171' }}>{row.losses}</td>
                          <td>{row.draws}</td>
                          <td style={{ color: 'rgba(255,255,255,0.5)' }}>{row.byes}</td>
                          <td>{row.points_for}</td>
                          <td>{row.points_against}</td>
                          <td style={{ color: row.forfeits ? '#f87171' : 'rgba(255,255,255,0.3)' }}>{row.forfeits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(44,163,238,0.1)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ladder.length} teams</span>
                    <span>Copy Table to paste into Excel or Google Sheets</span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}