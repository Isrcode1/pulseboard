import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const api = axios.create({ baseURL: '' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pb_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 80, category: 'DevOps' })
  const [saving, setSaving] = useState(false)

  const user = JSON.parse(localStorage.getItem('pb_user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('pb_token')
    if (!token) { navigate('/'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile/profile/me')
      setProfile(data)
      setForm({
        display_name: data.display_name || '',
        headline: data.headline || '',
        bio: data.bio || '',
        location: data.location || '',
        website_url: data.website_url || '',
        currently_building: data.currently_building || '',
        open_to_work: data.open_to_work,
        theme: data.theme,
      })
    } catch (e) {
      if (e.response?.status === 404) setError('no_profile')
      else setError('error')
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    try {
      setSaving(true)
      const { data } = await api.post('/api/profile/profile', {
        username: user.github_username?.toLowerCase(),
        display_name: user.github_name || user.github_username,
        theme: 'cyber',
      })
      setProfile(data)
      setError(null)
    } catch (e) {
      alert(e.response?.data?.detail || 'Error creating profile')
    } finally {
      setSaving(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      const { data } = await api.put('/api/profile/profile/me', form)
      setProfile(data)
      setEditing(false)
    } catch (e) {
      alert('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = async () => {
    if (!newSkill.name) return
    try {
      await api.post('/api/profile/profile/me/skills', newSkill)
      setNewSkill({ name: '', proficiency: 80, category: 'DevOps' })
      fetchProfile()
    } catch (e) {
      alert('Error adding skill')
    }
  }

  const deleteSkill = async (skillId) => {
    try {
      await api.delete(`/api/profile/profile/me/skills/${skillId}`)
      fetchProfile()
    } catch (e) {
      alert('Error deleting skill')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#070913]">
      <span className="font-mono text-xs text-blue-400 animate-pulse">Loading dashboard...</span>
    </div>
  )

  if (error === 'no_profile') return (
    <div className="flex items-center justify-center min-h-screen bg-[#070913] px-6 text-center">
      <div className="max-w-md space-y-6">
        <h2 className="text-2xl font-extrabold text-white font-display">Welcome to PulseBoard</h2>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          You don't have a profile yet. Create one to claim your custom link and start showcasing your work.
        </p>
        <button 
          onClick={createProfile} 
          disabled={saving} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Creating Board...' : 'Create My Profile'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-blue-500 selection:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-white font-display">
              Pulse<span className="text-orange-500">Board</span>
            </span>
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <Link 
                to={`/p/${profile.username}`} 
                className="hidden sm:inline-block px-3 py-1.5 bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 font-mono text-[10px] rounded-lg transition-all"
              >
                pulseboard.duckdns.org/p/{profile.username}
              </Link>
            )}
            <button 
              onClick={logout} 
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {profile && (
          <div className="space-y-8">
            
            {/* 1. PROFILE INFO CARD */}
            <div className="p-6 bg-[#0e111a] border border-slate-800 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img 
                  src={user.github_avatar_url} 
                  alt="avatar" 
                  className="w-16 h-16 rounded-full border border-slate-800 shadow-md shrink-0 object-cover"
                />
                
                <div className="flex-1 w-full space-y-4">
                  {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        ['display_name', 'Display Name'],
                        ['headline', 'Headline'],
                        ['location', 'Location'],
                        ['website_url', 'Website URL'],
                      ].map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">{label}</label>
                          <input
                            className="w-full bg-[#0a0d16] border border-slate-900 focus:border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                            value={form[key] || ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                          />
                        </div>
                      ))}
                      
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Bio</label>
                        <textarea
                          className="w-full bg-[#0a0d16] border border-slate-900 focus:border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none min-h-[80px] resize-y transition-colors"
                          value={form.bio || ''}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                        />
                      </div>
                      
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Currently Building</label>
                        <input
                          className="w-full bg-[#0a0d16] border border-slate-900 focus:border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                          value={form.currently_building || ''}
                          onChange={e => setForm({ ...form, currently_building: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <button 
                          onClick={saveProfile} 
                          disabled={saving} 
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg shadow transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                          onClick={() => setEditing(false)} 
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 justify-between sm:justify-start">
                        <h2 className="text-xl font-extrabold text-white">{profile.display_name || profile.username}</h2>
                        <button 
                          onClick={() => setEditing(true)} 
                          className="px-3 py-1 bg-blue-950/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      </div>
                      
                      <p className="font-mono text-xs text-blue-400">@{profile.username}</p>
                      {profile.headline && <p className="text-xs text-slate-350">{profile.headline}</p>}
                      {profile.bio && <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{profile.bio}</p>}
                      
                      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-[10px] text-slate-500 font-mono">
                        {profile.location && <span>📍 {profile.location}</span>}
                        {profile.currently_building && <span>🔨 {profile.currently_building}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. SKILL STACK CARD */}
            <div className="p-6 bg-[#0e111a] border border-slate-800 rounded-xl shadow-lg space-y-6">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">Skills Stack</h3>
              
              {/* Existing Skills List */}
              <div className="space-y-3">
                {profile.skills.map(skill => (
                  <div key={skill.id} className="flex items-center gap-4 text-xs font-mono">
                    <span className="min-w-[120px] text-slate-300 truncate">{skill.name}</span>
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                    <span className="min-w-[35px] text-right text-slate-500">{skill.proficiency}%</span>
                    <button 
                      onClick={() => deleteSkill(skill.id)} 
                      className="px-2 py-0.5 rounded border border-red-500/20 text-red-500/80 hover:bg-red-500/10 text-[9px] font-semibold transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {profile.skills.length === 0 && (
                  <p className="text-xs text-slate-500 font-mono italic">No skills added yet.</p>
                )}
              </div>

              {/* Add Skill Form */}
              <div className="pt-4 border-t border-slate-900/50 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Skill Name</label>
                  <input 
                    className="w-full bg-[#0a0d16] border border-slate-900 focus:border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. React" 
                    value={newSkill.name} 
                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-1 w-full sm:w-auto">
                  <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Proficiency ({newSkill.proficiency}%)</label>
                  <div className="flex items-center h-8">
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={newSkill.proficiency} 
                      onChange={e => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })} 
                      className="w-full sm:w-28 accent-blue-500" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1 w-full sm:w-auto">
                  <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Category</label>
                  <select 
                    className="w-full bg-[#0a0d16] border border-slate-900 focus:border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    value={newSkill.category} 
                    onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                  >
                    <option>DevOps</option>
                    <option>Backend</option>
                    <option>Frontend</option>
                    <option>Cloud</option>
                    <option>Database</option>
                    <option>Other</option>
                  </select>
                </div>

                <button 
                  onClick={addSkill} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg shadow transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Add Skill
                </button>
              </div>

            </div>

            {/* 3. SOCIAL LINKS CARD */}
            <div className="p-6 bg-[#0e111a] border border-slate-800 rounded-xl shadow-lg space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">Social Links</h3>
              
              <div className="space-y-2">
                {profile.social_links.map(link => (
                  <div key={link.id} className="text-xs font-mono text-slate-300">
                    <span className="text-blue-400 font-semibold">{link.platform}:</span>{' '}
                    <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline text-slate-400">
                      {link.url}
                    </a>
                  </div>
                ))}
                {profile.social_links.length === 0 && (
                  <p className="text-xs text-slate-500 font-mono italic">No social links added yet. Add them via API calls.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
