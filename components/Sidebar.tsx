'use client'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function Sidebar({ user }: { user: any }) {
  const [leagues, setLeagues]   = useState<any[]>([])
  const [url, setUrl]           = useState('')
  const [adding, setAdding]     = useState(false)
  const [syncing, setSyncing]   = useState(false)
  const [msg, setMsg]           = useState<{ type: string; text: string } | null>(null)
  const isAdmin = user?.role === 'admin'

  async function loadLeagues() {
    const data = await fetch('/api/leagues').then(r => r.json())
    setLeagues(Array.isArray(data) ? data : [])
  }

  useEffect(() => { loadLeagues() }, [])

  async function addLeague() {
    if (!url.trim()) return
    setAdding(true); setMsg(null)
    const res  = await fetch('/api/leagues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
    const data = await res.json()
    setAdding(false)
    if (data.success) { setMsg({ type: 'success', text: `Added: ${data.meta.name}` }); setUrl(''); loadLeagues(); window.dispatchEvent(new Event('leagues:updated')) }
    else setMsg({ type: 'error', text: data.error ?? 'Failed' })
  }

  async function syncAll() {
    setSyncing(true); setMsg(null)
    const res  = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    const data = await res.json()
    setSyncing(false)
    const ok  = data.results?.filter((r: any) => r.success).length ?? 0
    const bad = data.results?.filter((r: any) => !r.success).length ?? 0
    setMsg({ type: ok > 0 ? 'success' : 'error', text: `${ok} synced${bad > 0 ? `, ${bad} failed` : ''}` })
    loadLeagues()
    window.dispatchEvent(new Event('leagues:updated'))
  }

  async function toggleLeague(id: number, current: number) {
    await fetch('/api/leagues', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, sync_enabled: current ? 0 : 1 }) })
    loadLeagues()
  }

  async function deleteLeague(id: number, gradeId: string) {
    if (!confirm('Remove this league?')) return
    await fetch('/api/leagues', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, grade_id: gradeId }) })
    loadLeagues()
    window.dispatchEvent(new Event('leagues:updated'))
  }

  return (
    <aside style={{
      width: 260, flexShrink: 0, background: '#000',
      borderRight: '1px solid rgba(44,163,238,0.2)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '1.25rem 1rem', gap: '0.5rem',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
          <img src="/logo2.png" alt="" style={{ height: 32 }} onError={e => (e.currentTarget.style.display='none')} />
          <img src="/logo.png" alt="" style={{ height: 32 }} onError={e => (e.currentTarget.style.display='none')} />
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.2rem', color: '#2ca3ee' }}>League Ladders</div>
        <span className="badge-yellow" style={{ fontSize: '0.58rem', marginTop: 3, display: 'inline-block' }}>SA Footballer</span>
      </div>

      <div style={{ height: 1, background: 'rgba(44,163,238,0.2)' }} />

      {/* User */}
      <div style={{ padding: '0.625rem', borderRadius: 9, background: 'rgba(44,163,238,0.05)', border: '1px solid rgba(44,163,238,0.15)' }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Signed in</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
        <div style={{ fontSize: '0.72rem', color: '#2ca3ee' }}>{(user?.role ?? 'user').toUpperCase()}</div>
      </div>

      {/* Admin: Add league */}
      {isAdmin && (
        <>
          <div style={{ height: 1, background: 'rgba(44,163,238,0.15)' }} />
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Add League
            </p>
            <input
              type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="PlayHQ Grade URL..."
              className="input-field" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}
            />
            <button onClick={addLeague} disabled={adding || !url.trim()} className="btn-primary" style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }}>
              {adding ? 'Adding...' : 'Add & Sync'}
            </button>
          </div>

          <button onClick={syncAll} disabled={syncing} className="btn-yellow" style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }}>
            {syncing ? 'Syncing...' : 'Sync All Now'}
          </button>

          {msg && (
            <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'} style={{ fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}>
              {msg.text}
            </div>
          )}
        </>
      )}

      <div style={{ height: 1, background: 'rgba(44,163,238,0.15)' }} />

      {/* Leagues list */}
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
          Leagues
        </p>
        {leagues.length === 0 && <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>No leagues yet</p>}
        {leagues.map(lg => (
          <div key={lg.id} style={{ marginBottom: '0.625rem', padding: '0.625rem', borderRadius: 9, background: 'rgba(44,163,238,0.04)', border: '1px solid rgba(44,163,238,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.7rem', marginTop: 2 }}>{lg.sync_enabled ? '🟢' : '🔴'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lg.grade_name}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  {lg.season} · {lg.last_synced_at?.slice(0, 10) ?? 'Never synced'}
                </div>
              </div>
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
                <button onClick={() => toggleLeague(lg.id, lg.sync_enabled)} className="btn-ghost" style={{ flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}>
                  {lg.sync_enabled ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => deleteLeague(lg.id, lg.grade_id)} className="btn-danger" style={{ flex: 1, fontSize: '0.72rem', padding: '0.3rem 0.5rem' }}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ height: 1, background: 'rgba(44,163,238,0.2)' }} />
      <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-yellow" style={{ width: '100%', fontSize: '0.82rem', padding: '0.6rem' }}>
        Logout
      </button>
    </aside>
  )
}
