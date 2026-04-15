'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) { setError('Please enter both fields'); return }
    setLoading(true); setError('')
    const res = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (res?.ok) router.push('/dashboard')
    else setError('Invalid username or password')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(44,163,238,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <img src="/logo2.png" alt="SAFie" style={{ height: 48 }} onError={e => (e.currentTarget.style.display='none')} />
          <img src="/logo.png" alt="SA Footballer" style={{ height: 48 }} onError={e => (e.currentTarget.style.display='none')} />
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2.8rem', color: '#2ca3ee', letterSpacing: '-0.02em', margin: 0 }}>
          League Ladders
        </h1>
        <div style={{ marginTop: '0.35rem' }}>
          <span className="badge-yellow">AI by SA Footballer</span>
        </div>
        <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Auto-synced daily from PlayHQ
        </p>
      </div>

      <div className="fade-up-1 glass-card" style={{ width: '100%', maxWidth: 400, padding: '2.25rem' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
          Sign In
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Use your SA Footballer account
        </p>

        {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.25rem', padding: '0.85rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
