import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const code = params.get('code')
    
    // Set a minimum visible duration of 2000ms for the authentication splash screen
    const minimumDisplayTime = new Promise(resolve => setTimeout(resolve, 2000))
    
    let authPromise = Promise.resolve()

    if (token) {
      localStorage.setItem('pb_token', token)
      authPromise = fetch('/api/auth/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => {
          if (!r.ok) throw new Error('Auth failed')
          return r.json()
        })
        .then(user => {
          localStorage.setItem('pb_user', JSON.stringify(user))
        })
    } else if (code) {
      authPromise = fetch(`/api/auth/auth/github/callback?code=${code}`)
        .then(r => {
          if (!r.ok) throw new Error('Callback failed')
          return r.json()
        })
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('pb_token', data.access_token)
            localStorage.setItem('pb_user', JSON.stringify(data.user))
          } else {
            throw new Error('No token returned')
          }
        })
    } else {
      // Direct access fallback simulation for testing/mock purposes
      authPromise = Promise.resolve()
    }

    // Wait for both the auth process AND the minimum display timer to complete
    Promise.all([authPromise, minimumDisplayTime])
      .then(() => {
        navigate('/dashboard')
      })
      .catch((err) => {
        console.error("Auth redirect error:", err)
        navigate('/')
      })

  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#060810] text-[#e3e3e3] font-sans py-12 px-6 select-none relative overflow-hidden">
      
      {/* Spacer to center the loading box */}
      <div className="h-20"></div>

      {/* Center content */}
      <div className="flex flex-col items-center space-y-6 max-w-sm w-full text-center relative z-10">
        
        {/* PulseBoard Logo */}
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white font-display">
            <span className="text-[#3b82f6]">Pulse</span><span className="text-orange-500">Board</span>
          </span>
          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2.5"></div>
        </div>

        {/* Auth status tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161a29]/80 border border-slate-800 text-[10px] tracking-[0.1em] font-bold text-slate-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AUTH SESSION: ACTIVE
        </div>

        {/* Spinner */}
        <div className="py-8 relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-[#3b82f6] animate-spin"></div>
        </div>

        {/* Status text */}
        <div className="text-sm font-semibold text-slate-300">
          Verifying with GitHub...
        </div>

      </div>

      {/* Footer info */}
      <div className="w-full max-w-lg flex flex-col items-center space-y-3 text-[10px] text-slate-650 font-mono tracking-wider">
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <span>🔒</span> SECURE HANDSHAKE
          </span>
          <span className="flex items-center gap-1.5">
            <span>🖳</span> NODE-01-PULSE
          </span>
          <span className="flex items-center gap-1.5">
            <span>🛡️</span> OAUTH 2.0
          </span>
        </div>
        
        <div className="text-slate-700 text-[9px] uppercase tracking-widest pt-1 border-t border-slate-900 w-full text-center">
          PulseBoard Engineering First Authentication
        </div>
      </div>

    </div>
  )
}
