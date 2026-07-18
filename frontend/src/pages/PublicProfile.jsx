import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const fetchProfile = async (username) => {
  const { data } = await axios.get(`/api/profile/p/${username}`)
  return data
}

export default function PublicProfile() {
  const { username } = useParams()
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
    retry: false
  })

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#070913]">
      <span className="font-mono text-sm text-blue-400 animate-pulse">Loading @{username}'s board...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[#070913] px-6 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-xl font-bold text-orange-500">Profile Not Found</h2>
        <p className="font-mono text-xs text-slate-400">
          @{username} hasn't joined PulseBoard yet.
        </p>
        <div className="pt-4">
          <a 
            href="/" 
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            Create Your Board
          </a>
        </div>
      </div>
    </div>
  )

  const categories = [...new Set(profile.skills.map(s => s.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/10 via-[#0e111a] to-indigo-900/5 border-b border-slate-900/50 py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
          
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-3xl shrink-0 border border-slate-700 shadow-lg">
            ⚡
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.display_name || profile.username}</h1>
              {profile.open_to_work && (
                <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[9px] tracking-wider rounded-md font-bold">
                  OPEN TO WORK
                </span>
              )}
            </div>

            <p className="font-mono text-xs text-blue-400">@{profile.username}</p>
            
            {profile.headline && (
              <p className="text-sm text-slate-305">{profile.headline}</p>
            )}
            
            {profile.bio && (
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 justify-center sm:justify-start text-[11px] text-slate-500 font-mono">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.social_links.map(link => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {link.platform} →
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Profile Details Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* Currently Building */}
        {profile.currently_building && (
          <div className="p-5 bg-[#0e111a] border border-slate-800 rounded-xl border-l-4 border-l-blue-500 space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold font-mono block">Currently Building</span>
            <p className="text-xs text-slate-300 leading-normal">{profile.currently_building}</p>
          </div>
        )}

        {/* Skill Stack */}
        {profile.skills.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">Skill Stack</h2>
            
            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="space-y-3 p-5 bg-[#0a0d16] border border-slate-900 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold font-mono block">
                    {cat}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {profile.skills.filter(s => s.category === cat).map(skill => (
                      <div key={skill.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300">{skill.name}</span>
                          <span className="text-slate-450">{skill.proficiency}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-slate-900/50 text-center text-[10px] text-slate-650 font-mono">
          <p>
            Powered by <a href="/" className="text-blue-400 hover:underline">PulseBoard</a> · Get your board at pulseboard.duckdns.org
          </p>
        </div>

      </div>

    </div>
  )
}
