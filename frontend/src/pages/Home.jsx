import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('pb_token')
    if (token) navigate('/dashboard')
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/auth/auth/github/login'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '24px'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,229,255,0.08)',
          border: '1px solid rgba(0,229,255,0.25)',
          color: 'var(--cyan)', fontSize: '11px',
          letterSpacing: '3px', textTransform: 'uppercase',
          padding: '6px 16px', borderRadius: '2px', marginBottom: '28px'
        }}>
          Real-time Developer Presence
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 800,
          letterSpacing: '-2px', lineHeight: 1, marginBottom: '16px'
        }}>
          <span style={{ color: 'var(--cyan)' }}>Pulse</span>
          <span style={{ color: 'var(--orange)' }}>Board</span>
        </h1>

        <p style={{
          fontFamily: 'monospace', fontSize: '14px',
          color: 'var(--muted)', lineHeight: 1.9, marginBottom: '40px'
        }}>
          Your entire dev life. One link. Always live.<br />
          GitHub activity · Blog posts · Skills · Analytics.
        </p>

        <button onClick={handleLogin} style={{
          background: 'var(--cyan)', color: '#07090f',
          border: 'none', padding: '14px 32px',
          fontSize: '14px', fontWeight: 700,
          borderRadius: '3px', letterSpacing: '1px',
          display: 'inline-flex', alignItems: 'center', gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <p style={{
          marginTop: '48px', fontFamily: 'monospace',
          fontSize: '11px', color: 'var(--muted)'
        }}>
          No password needed · Your GitHub profile, amplified
        </p>
      </div>
    </div>
  )
}
