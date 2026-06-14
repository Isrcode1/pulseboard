import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    const token = params.get('token')
    if (token) {
      localStorage.setItem('pb_token', token)
      // Fetch user info
      fetch('/api/auth/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(user => {
          localStorage.setItem('pb_user', JSON.stringify(user))
          navigate('/dashboard')
        })
        .catch(() => navigate('/dashboard'))
      return
    }

    const code = params.get('code')
    if (code) {
      fetch(`/api/auth/auth/github/callback?code=${code}`)
        .then(r => r.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('pb_token', data.access_token)
            localStorage.setItem('pb_user', JSON.stringify(data.user))
            navigate('/dashboard')
          } else {
            navigate('/')
          }
        })
        .catch(() => navigate('/'))
      return
    }

    navigate('/')
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)', color: 'var(--cyan)',
      fontFamily: 'monospace', fontSize: '14px', flexDirection: 'column', gap: '16px'
    }}>
      <div>Authenticating with GitHub...</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Please wait</div>
    </div>
  )
}
