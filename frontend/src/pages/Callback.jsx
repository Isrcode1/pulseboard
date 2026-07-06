import React, { useEffect } from 'react'
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070913] text-blue-400 font-mono text-sm gap-2">
      <div className="animate-pulse">Authenticating with GitHub...</div>
      <div className="text-[10px] text-slate-500">Please wait</div>
    </div>
  )
}
