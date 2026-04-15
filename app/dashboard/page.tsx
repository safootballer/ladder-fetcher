'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [leagues, setLeagues]       = useState<any[]>([])
  const [activeTab, setActiveTab]   = useState<string | null>(null)
  const [ladder, setLadder]         = useState<any[]>([])
  const [loadingLadder, setLoadingLadder] = useState(false)
  const [copiedId, setCopiedId]     = useState<string | null>(null)

  const loadLeagues = useCallback(async () => {
    const data = await fetch('/api/leagues').then(r => r.json())
    const list = Array.isArray(data) ? data : []
    setLeagues(list)
    if (list.length > 0 && !activeTab) setActiveTab(list[0].grade_id)
  }, [activeTab])

  useEffect(() => { loadLeagues() }, [])

  // Listen for sidebar updates
  useEffect(() => {
    window.addEventListener('leagues:updated', loadLeagues)
    return () => window.removeEventListener('leagues:updated', loadLeagues)
  }, [loadLeagues])

  useEffect(() => {
    if (!activeTab) return
    setLoadingLadder(true)
    fetch(`/api/ladder?gradeId=${activeTab}`)
      .then(r => r.json())
      .then(data => setLadder(Array.isArray(data) ? data : []))
      .finally(() => setLoadingLadder(false))
  }, [activeTab])

  function copyTable() {
    if (!ladder.length || !activeTab) return
    const headers = ['Rank', 'Team', 'P', 'PTS', '%', 'W', 'L', 'D', 'BYE', 'F', 'A', 'FORF']
    const rows = ladder.map(r => [
      r.rank, r.team_name, r.played, r.points,
      r.percentage?.toFixed(2), r.wins, r.losses, r.draws,
      r.byes, r.points_for, r.points_against, r.forfeits,
    ])
    const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedId(activeTab)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const currentLeague = leagues.find(l => l.grade_id === activeTab)

  return (
    <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.25rem', color: '#2ca3ee', margin: 0 }}>
          🏈 League Ladders
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
          Welcome back, <strong style={{ color: '#fff' }}>{session?.user?.name}</strong> · Auto-synced daily from PlayHQ
        </p>
      </div>

      {leagues.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No leagues configured yet. Ask an admin to add leagues via the sidebar.</p>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div className="tab-bar">
            {leagues.map(lg => (
              <button
                key={lg.grade_id}
                className={`tab-btn ${activeTab === lg.grade_id ? 'active' : ''}`}
                onClick={() => setActiveTab(lg.grade_id)}
              >
                🏆 {lg.grade_name}
              </button>
            ))}
          </div>

          {/* Ladder content */}
          {currentLeague && (
            <>
              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Competition</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', marginTop: 4, lineHeight: 1.2 }}>
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

              {/* Copy button */}
              {ladder.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                    Then Ctrl+V into Excel or Google Sheets
                  </span>
                  <button onClick={copyTable} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                    {copiedId === activeTab ? '✅ Copied!' : '📋 Copy Table'}
                  </button>
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
                        <th style={{ width: 40 }}>#</th>
                        <th>Team</th>
                        <th title="Played">P</th>
                        <th title="Points">PTS</th>
                        <th title="Percentage">%</th>
                        <th title="Wins">W</th>
                        <th title="Losses">L</th>
                        <th title="Draws">D</th>
                        <th title="Byes">BYE</th>
                        <th title="Points For">F</th>
                        <th title="Points Against">A</th>
                        <th title="Forfeits">FORF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ladder.map((row, i) => (
                        <tr key={row.id} className={`${i < 8 ? 'top-8' : ''} ${i === 0 ? 'rank-1' : ''}`}>
                          <td>
                            <span className="rank-badge" style={{
                              background: i === 0 ? 'rgba(230,254,0,0.2)' : i < 8 ? 'rgba(44,163,238,0.15)' : 'rgba(255,255,255,0.05)',
                              color: i === 0 ? '#e6fe00' : i < 8 ? '#2ca3ee' : 'rgba(255,255,255,0.4)',
                            }}>
                              {row.rank}
                            </span>
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
                    <span>Use Copy Table to paste into Excel or Google Sheets</span>
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
