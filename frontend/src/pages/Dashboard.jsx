import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { 
  User, 
  MapPin, 
  Wrench, 
  BookOpen, 
  Layout, 
  Flame, 
  FileText, 
  Award, 
  BarChart2, 
  Settings as SettingsIcon, 
  Bell, 
  HelpCircle, 
  Search, 
  Copy, 
  ExternalLink, 
  Check, 
  ChevronRight, 
  ArrowLeft,
  PenTool,
  Github,
  Globe,
  Plus,
  X,
  Code,
  Terminal,
  Linkedin,
  Twitter,
  AlertTriangle
} from 'lucide-react'

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
  
  // Onboarding Wizard State (Steps 1 to 6)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [currentlyBuilding, setCurrentlyBuilding] = useState('')
  
  // Developer writing sync
  const [devtoUsername, setDevtoUsername] = useState('')
  const [hashnodeUsername, setHashnodeUsername] = useState('')
  
  // Step 4: Skills list
  const [selectedSkills, setSelectedSkills] = useState(['TypeScript'])
  const [skillInput, setSkillInput] = useState('')
  
  // Step 5: Visual Theme Look
  const [selectedTheme, setSelectedTheme] = useState('cyber')

  // Validation / check states
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  
  // Dashboard Management State
  const [editingProfile, setEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 80, category: 'Frontend' })
  const [saving, setSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const user = JSON.parse(localStorage.getItem('pb_user') || '{}')

  useEffect(() => {
    const token = localStorage.getItem('pb_token')
    if (!token) { navigate('/'); return }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (user && !loading) {
      if (!displayName) setDisplayName(user.github_name || user.github_username || '')
      if (!username) setUsername(user.github_username?.toLowerCase() || '')
    }
  }, [loading])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile/profile/me')
      setProfile(data)
      setEditForm({
        display_name: data.display_name || '',
        headline: data.headline || '',
        bio: data.bio || '',
        location: data.location || '',
        website_url: data.website_url || '',
        currently_building: data.currently_building || '',
        open_to_work: data.open_to_work,
        theme: data.theme || 'cyber',
      })
    } catch (e) {
      if (e.response?.status === 404) setError('no_profile')
      else setError('error')
    } finally {
      setLoading(false)
    }
  }

  // Handle typing inside handle field with simulated availability check
  const handleUsernameChange = (val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
    setUsername(cleanVal)
    if (!cleanVal) {
      setUsernameAvailable(false)
      return
    }
    setCheckingUsername(true)
    setTimeout(() => {
      setCheckingUsername(false)
      setUsernameAvailable(true)
    }, 300)
  }

  // Add tag to skills expertise list (Step 4)
  const handleAddSkillTag = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  // Toggle quick select skill tag (Step 4)
  const toggleQuickSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName))
    } else {
      setSelectedSkills([...selectedSkills, skillName])
    }
  }

  // Complete onboarding workflow and create DB items (Step 5 -> Step 6)
  const handleCompleteSetup = async () => {
    try {
      setSaving(true)
      
      // 1. Create main profile
      const profilePayload = {
        username: username.trim(),
        display_name: displayName.trim(),
        headline: headline.trim() || 'Software Engineer',
        bio: bio.trim() || '',
        location: location.trim() || '',
        currently_building: currentlyBuilding.trim() || '',
        theme: selectedTheme,
        is_public: true,
        open_to_work: false
      }

      const { data } = await api.post('/api/profile/profile', profilePayload)

      // 2. Add DEV.to social link if present
      if (devtoUsername.trim()) {
        await api.post('/api/profile/profile/me/social-links', {
          platform: 'DEV.to',
          url: `https://dev.to/${devtoUsername.trim()}`,
          username: devtoUsername.trim()
        })
      }

      // 3. Add Hashnode social link if present
      if (hashnodeUsername.trim()) {
        await api.post('/api/profile/profile/me/social-links', {
          platform: 'Hashnode',
          url: `https://${hashnodeUsername.trim()}.hashnode.dev`,
          username: hashnodeUsername.trim()
        })
      }

      // 4. Add Selected Skills to database
      for (const skill of selectedSkills) {
        await api.post('/api/profile/profile/me/skills', {
          name: skill,
          proficiency: 80,
          category: 'Core'
        })
      }

      // Transition to Step 6 (Success screen)
      setOnboardingStep(6)
    } catch (e) {
      alert(e.response?.data?.detail || 'Error saving onboarding profile. Username may be taken.')
    } finally {
      setSaving(false)
    }
  }

  // Go to main Dashboard from step 6 success screen
  const handleFinishOnboardingAndLoadDashboard = async () => {
    setLoading(true)
    await fetchProfile()
    setError(null)
    setLoading(false)
  }

  // Update profile parameters from dashboard settings drawer
  const saveProfileUpdates = async () => {
    try {
      setSaving(true)
      const { data } = await api.put('/api/profile/profile/me', editForm)
      setProfile(data)
      setEditingProfile(false)
    } catch (e) {
      alert('Error updating profile settings')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = async () => {
    if (!newSkill.name) return
    try {
      await api.post('/api/profile/profile/me/skills', newSkill)
      setNewSkill({ name: '', proficiency: 80, category: 'Frontend' })
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

  const copyToClipboard = () => {
    const activeUsername = profile ? profile.username : username
    const url = `${window.location.origin}/p/${activeUsername}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Generate commits matrix data
  const contributionGrid = React.useMemo(() => {
    const days = 53 * 7
    const list = []
    for (let i = 0; i < days; i++) {
      const rand = Math.random()
      if (rand < 0.6) list.push(0)
      else if (rand < 0.8) list.push(1)
      else if (rand < 0.93) list.push(2)
      else list.push(3)
    }
    return list
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060810] text-[#3b82f6]">
      <div className="w-10 h-10 rounded-full border-2 border-slate-900 border-t-[#3b82f6] animate-spin mb-4"></div>
      <span className="font-mono text-[11px] tracking-widest uppercase text-slate-500 animate-pulse">Initializing PulseBoard Dashboard...</span>
    </div>
  )

  // ONBOARDING WIZARD INTERFACE (6-STEP FUNNEL)
  if (error === 'no_profile') {
    return (
      <div className="min-h-screen bg-[#060810] text-slate-100 font-sans selection:bg-[#3b82f6] selection:text-white flex flex-col justify-between py-12 px-6 relative">
        
        {/* Top Header Logo Row */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between opacity-95">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-white font-display">
              Pulse<span className="text-orange-500">Board</span>
            </span>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
          </div>
          {onboardingStep < 6 && (
            <div className="text-[10px] tracking-wider font-mono text-slate-550 uppercase">
              Step {onboardingStep} of 5
            </div>
          )}
        </div>

        <div className="max-w-xl w-full mx-auto space-y-8 my-6">
          
          {/* Header Progress Indicators */}
          <div className="space-y-4">
            {/* 6-segment Progress Bar */}
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((step) => {
                let isActive = false
                let isGreen = onboardingStep === 6 // Success page is fully green
                
                if (isGreen) isActive = true
                else {
                  if (onboardingStep === 1 && step <= 1) isActive = true
                  if (onboardingStep === 2 && step <= 2) isActive = true
                  if (onboardingStep === 3 && step <= 3) isActive = true
                  if (onboardingStep === 4 && step <= 4) isActive = true
                  if (onboardingStep === 5 && step <= 5) isActive = true
                }
                
                return (
                  <div 
                    key={step} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isGreen 
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                        : isActive 
                          ? 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]' 
                          : 'bg-[#161a29]'
                    }`}
                  />
                )
              })}
            </div>

            {/* Label and completion text */}
            {onboardingStep < 6 && (
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-slate-500">
                <span>
                  {onboardingStep === 1 && "STEP 1: IDENTITY"}
                  {onboardingStep === 2 && "STEP 2: ABOUT / STORY"}
                  {onboardingStep === 3 && "STEP 3: WRITING"}
                  {onboardingStep === 4 && "STEP 4: REFINE PROFILE"}
                  {onboardingStep === 5 && "STEP 5: YOUR LOOK"}
                </span>
                <span>
                  {onboardingStep === 1 && "16% Complete"}
                  {onboardingStep === 2 && "33% Complete"}
                  {onboardingStep === 3 && "50% Complete"}
                  {onboardingStep === 4 && "66% Complete"}
                  {onboardingStep === 5 && "83% Complete"}
                </span>
              </div>
            )}
          </div>

          {/* ONBOARDING STEP 1: IDENTITY */}
          {onboardingStep === 1 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to PulseBoard</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Let's set up your profile to start tracking your engineering velocity.
                </p>
              </div>

              {/* Avatar circle */}
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <img 
                    src={user.github_avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                    alt="GitHub avatar" 
                    className="w-24 h-24 rounded-full border-2 border-[#1e2338] object-cover"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-[#161a29] border border-[#1e2338] hover:border-slate-650 rounded-full text-slate-400 hover:text-white transition-all shadow-md">
                    <PenTool size={13} />
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#182235] text-[10px] font-bold text-[#3b82f6] font-mono tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                  GITHUB SYNCED
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Display Name</label>
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                      value={displayName}
                      placeholder="Alex Rivera"
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <div className="absolute right-4 top-3.5 text-slate-500">
                      <User size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-500 text-sm font-mono">@</span>
                    <input 
                      type="text"
                      className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 pl-8 pr-24 text-sm text-white placeholder-slate-650 focus:outline-none transition-colors font-mono"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="arivera_dev"
                    />
                    
                    <div className="absolute right-4 top-3.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-mono">
                      {checkingUsername ? (
                        <span className="text-slate-550 animate-pulse">Checking...</span>
                      ) : usernameAvailable && username ? (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <Check size={12} /> Available
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-550 font-mono">
                    This will be your unique URL: <span className="text-slate-400">pulseboard.duckdns.org/p/{username || 'username'}</span>
                  </p>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex justify-end pt-4">
                <button
                  disabled={!displayName || !username || checkingUsername}
                  onClick={() => setOnboardingStep(2)}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING STEP 2: ABOUT / STORY */}
          {onboardingStep === 2 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Story</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Help the community get to know the engineer behind the code.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Headline</label>
                  <input 
                    type="text"
                    className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 px-4 text-sm text-white placeholder-slate-650"
                    placeholder="Fullstack Dev | Rust Enthusiast | Building the future of SaaS"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Bio</label>
                    <span className={`text-[10px] font-mono ${bio.length > 160 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                      {bio.length} / 160
                    </span>
                  </div>
                  <textarea 
                    className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 px-4 text-sm text-white placeholder-slate-650 min-h-[90px] resize-none"
                    placeholder="I transform caffeine into scalable microservices. Currently deep diving into distributed systems and contributing to open-source UI libraries."
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Location</label>
                    <div className="relative">
                      <input 
                        type="text"
                        className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-slate-650"
                        placeholder="San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <div className="absolute right-4 top-3.5 text-slate-500">
                        <MapPin size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Currently Building</label>
                    <div className="relative">
                      <input 
                        type="text"
                        className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-xl py-3 pl-4 pr-10 text-sm text-white placeholder-slate-650"
                        placeholder="PulseBoard OSS"
                        value={currentlyBuilding}
                        onChange={(e) => setCurrentlyBuilding(e.target.value)}
                      />
                      <div className="absolute right-4 top-3.5 text-slate-500">
                        <Wrench size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-900 border border-[#1a1f33] text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  disabled={!headline}
                  onClick={() => setOnboardingStep(3)}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING STEP 3: WRITING */}
          {onboardingStep === 3 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Writing</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your technical writing platforms to sync your articles and engagement metrics automatically.
                </p>
              </div>

              <div className="space-y-4">
                {/* DEV.to Card */}
                <div className="p-4 bg-[#060810] border border-[#1a1f33] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-slate-800 text-white font-extrabold text-sm font-mono">
                        DEV
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">DEV.to</h4>
                        <p className="text-[10px] text-slate-550">The software developer community</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-[#0e111a] hover:bg-slate-900 border border-[#1a1f33] text-[10px] font-bold tracking-wider uppercase text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                      Connect
                    </button>
                  </div>
                  <div className="pt-2">
                    <input 
                      type="text"
                      className="w-full bg-[#0e111a] border border-[#161a29] focus:border-[#3b82f6] rounded-lg py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                      placeholder="DEV.to Username"
                      value={devtoUsername}
                      onChange={(e) => setDevtoUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Hashnode Card */}
                <div className="p-4 bg-[#060810] border border-[#1a1f33] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#2942e1]/10 flex items-center justify-center border border-[#2942e1]/20 text-[#2942e1]">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Hashnode</h4>
                        <p className="text-[10px] text-slate-550">Blogging for developers</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-[#0e111a] hover:bg-slate-900 border border-[#1a1f33] text-[10px] font-bold tracking-wider uppercase text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                      Connect
                    </button>
                  </div>
                  <div className="pt-2">
                    <input 
                      type="text"
                      className="w-full bg-[#0e111a] border border-[#161a29] focus:border-[#3b82f6] rounded-lg py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors font-mono"
                      placeholder="Hashnode Subdomain/Username"
                      value={hashnodeUsername}
                      onChange={(e) => setHashnodeUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setOnboardingStep(4)}
                    className="text-[10px] text-[#3b82f6] hover:text-[#2563eb] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Skip this step for now
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-900 border border-[#1a1f33] text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  onClick={() => setOnboardingStep(4)}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING STEP 4: REFINE PROFILE (SKILLS EXPERTISE) */}
          {onboardingStep === 4 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Refine your profile</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your top 3 skills to help us personalize your developer dashboard and project matches.
                </p>
              </div>

              <div className="space-y-4">
                {/* Search/input expertise tags box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Your Expertise</label>
                  <div className="w-full bg-[#060810] border border-[#1a1f33] focus-within:border-[#3b82f6] rounded-xl p-2.5 flex flex-wrap gap-2 items-center min-h-[48px] transition-all">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-[#182035] border border-[#3b82f6]/20 text-xs font-semibold text-[#3b82f6]">
                        {skill}
                        <button 
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          className="hover:bg-[#2c3a5d] rounded-full p-0.5 transition-colors text-slate-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text"
                      className="bg-transparent text-sm text-white placeholder-slate-650 focus:outline-none flex-grow min-w-[120px] font-sans"
                      placeholder={selectedSkills.length === 0 ? "Add a skill..." : ""}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkillTag}
                    />
                  </div>
                </div>

                {/* Validation check */}
                {selectedSkills.length < 3 ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-orange-400/90 font-sans">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Please select at least {3 - selectedSkills.length} more skill{3 - selectedSkills.length > 1 ? 's' : ''}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 font-sans">
                    <Check size={14} className="shrink-0" />
                    <span>Skills list qualified</span>
                  </div>
                )}

                {/* Suggested options based on github activity */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Based on your GitHub activity</span>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { name: 'Rust', icon: <Code size={12} /> },
                      { name: 'Go', icon: <Code size={12} /> },
                      { name: 'React', icon: <Layout size={12} /> },
                      { name: 'Node.js', icon: <Terminal size={12} /> },
                    ].map(item => {
                      const isSelected = selectedSkills.includes(item.name)
                      return (
                        <button
                          key={item.name}
                          onClick={() => toggleQuickSkill(item.name)}
                          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#182035] border-[#3b82f6] text-[#3b82f6]' 
                              : 'bg-[#060810] border-[#1a1f33] text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-900 border border-[#1a1f33] text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  disabled={selectedSkills.length < 3}
                  onClick={() => setOnboardingStep(5)}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-xs font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING STEP 5: YOUR LOOK (THEME SELECTION) */}
          {onboardingStep === 5 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Look</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose a visual identity that matches your engineering workflow.
                </p>
              </div>

              {/* Grid of 3 Theme items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    id: 'cyber', 
                    title: 'Cyber', 
                    desc: 'Deep neon & dark', 
                    previewStyle: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-[#3b82f6]/20'
                  },
                  { 
                    id: 'minimal', 
                    title: 'Minimal', 
                    desc: 'Clean & clinical', 
                    previewStyle: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800'
                  },
                  { 
                    id: 'terminal', 
                    title: 'Terminal', 
                    desc: 'Classic hacker green', 
                    previewStyle: 'bg-gradient-to-br from-black via-[#040c06] to-black border-emerald-950/40'
                  },
                ].map(theme => {
                  const isSelected = selectedTheme === theme.id
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`relative flex flex-col p-4 rounded-xl border text-left transition-all group overflow-hidden cursor-pointer ${
                        isSelected 
                          ? 'border-[#3b82f6] bg-[#101524]' 
                          : 'border-[#1a1f33] bg-[#060810] hover:border-slate-800'
                      }`}
                    >
                      {/* Checkmark box */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#3b82f6] text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}

                      {/* Mockup screen preview */}
                      <div className={`w-full h-16 rounded-lg mb-4 border relative overflow-hidden ${theme.previewStyle}`}>
                        {theme.id === 'cyber' && (
                          <div className="p-2 space-y-1.5">
                            <div className="w-1/3 h-1 bg-[#3b82f6] rounded"></div>
                            <div className="flex gap-1">
                              <div className="w-full h-4 bg-[#182035] rounded border border-[#3b82f6]/10"></div>
                              <div className="w-1/2 h-4 bg-[#182035] rounded border border-[#3b82f6]/10"></div>
                            </div>
                          </div>
                        )}
                        {theme.id === 'minimal' && (
                          <div className="p-2 space-y-1.5">
                            <div className="w-1/4 h-1.5 bg-slate-400 rounded"></div>
                            <div className="w-2/3 h-1 bg-slate-650 rounded"></div>
                            <div className="w-1/2 h-1 bg-slate-700 rounded"></div>
                          </div>
                        )}
                        {theme.id === 'terminal' && (
                          <div className="p-2 font-mono text-[6px] text-emerald-500 space-y-0.5">
                            <div>$ pb --init</div>
                            <div className="text-emerald-300">➜ environment ready</div>
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-white group-hover:text-[#3b82f6] transition-colors">{theme.title}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 leading-normal">{theme.desc}</span>
                    </button>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-900 border border-[#1a1f33] text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  onClick={handleCompleteSetup}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {saving ? 'Creating Profile...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING STEP 6: YOUR LINK IS LIVE (SUCCESS SCREEN) */}
          {onboardingStep === 6 && (
            <div className="bg-[#0e111a] border border-[#1e2338] rounded-2xl p-8 shadow-xl text-center space-y-6">
              
              {/* Circular green success circle */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-md">
                  <Check size={32} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Link is Live</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Your developer profile is ready to share with the world. We've synchronized your repositories and tech stack into a single, high-velocity link.
                </p>
              </div>

              {/* Public link copy display box */}
              <div className="space-y-2 text-left max-w-sm mx-auto">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Public Profile URL</label>
                <div className="w-full bg-[#060810] border border-[#1a1f33] rounded-xl px-4 py-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="truncate">pulseboard.duckdns.org/p/{username}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="max-w-sm mx-auto space-y-4">
                <button
                  onClick={copyToClipboard}
                  className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy size={14} /> {copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-2.5 bg-[#060810] border border-[#1a1f33] hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Linkedin size={14} className="text-[#3b82f6]" /> LinkedIn
                  </button>
                  <button className="py-2.5 bg-[#060810] border border-[#1a1f33] hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Twitter size={14} className="text-white" /> X / Twitter
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1f33]/40">
                <button
                  onClick={handleFinishOnboardingAndLoadDashboard}
                  className="text-xs font-semibold text-[#3b82f6] hover:text-[#2563eb] transition-colors flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
                >
                  Go to Dashboard <ChevronRight size={14} />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer info text */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between py-4 text-[10px] text-slate-600 font-mono">
          <span>&copy; 2026 PulseBoard Inc.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Help Center</span>
          </div>
        </div>

      </div>
    )
  }

  // MAIN DASHBOARD INTERFACE
  return (
    <div className="min-h-screen bg-[#060810] text-[#e3e3e3] font-sans selection:bg-[#3b82f6] selection:text-white flex">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-[#1a1f33] bg-[#090c15] p-6 hidden md:flex flex-col justify-between shrink-0">
        
        <div className="space-y-8">
          {/* Sidebar Header Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white font-display">
                Pulse<span className="text-orange-500">Board</span>
              </span>
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
            </div>
          </div>

          {/* User profile card */}
          <div className="flex items-center gap-3 p-3 bg-[#0d111d] border border-[#161a29] rounded-xl">
            <img 
              src={user.github_avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
              alt="avatar" 
              className="w-10 h-10 rounded-full object-cover border border-[#1e2338]"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate leading-snug">{profile.display_name}</h4>
              <p className="text-[10px] text-slate-500 truncate leading-snug font-mono">@{profile.username}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { label: 'Dashboard', icon: <Layout size={15} />, active: true },
              { label: 'Profile', icon: <User size={15} /> },
              { label: 'Skills', icon: <Flame size={15} /> },
              { label: 'Projects', icon: <Wrench size={15} /> },
              { label: 'Blog', icon: <FileText size={15} /> },
              { label: 'Certifications', icon: <Award size={15} /> },
            ].map((link) => (
              <button 
                key={link.label}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  link.active 
                    ? 'bg-[#182035] text-[#3b82f6]' 
                    : 'text-slate-400 hover:text-white hover:bg-[#0c101b]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Lower navigation elements */}
        <div className="space-y-6">
          <nav className="space-y-1 pt-4 border-t border-[#1a1f33]/40">
            {[
              { label: 'Analytics', icon: <BarChart2 size={15} /> },
              { label: 'Settings', icon: <SettingsIcon size={15} />, onClick: () => setEditingProfile(!editingProfile) },
            ].map((link) => (
              <button 
                key={link.label}
                onClick={link.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#0c101b] rounded-lg transition-all cursor-pointer"
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Promo Widget */}
          <div className="p-4 bg-gradient-to-br from-[#101424] to-[#0e111a] border border-[#1c223c] rounded-xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-2xl rounded-full"></div>
            <div className="text-[10px] text-slate-500 font-mono">WEEKLY VIEWS</div>
            <div className="text-xl font-bold text-white font-mono">142</div>
            <button className="w-full py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-[10px] font-bold uppercase tracking-wider text-white rounded-lg transition-colors cursor-pointer">
              Upgrade to Pro
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Header bar */}
        <header className="h-16 border-b border-[#1a1f33] bg-[#090c15] px-6 flex items-center justify-between shrink-0">
          
          {/* Search container */}
          <div className="relative max-w-xs w-full hidden sm:block">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              placeholder="Search resources, projects, or peers..." 
              className="w-full bg-[#060810] border border-[#161a29] focus:border-[#3b82f6] rounded-lg py-1.5 pl-9 pr-4 text-xs placeholder-slate-600 focus:outline-none text-white transition-colors"
            />
          </div>

          <div className="sm:hidden flex items-center gap-1.5">
            <span className="text-base font-extrabold text-white">
              P<span className="text-orange-500">B</span>
            </span>
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
          </div>

          {/* Actions & Public Profile link */}
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors">
                <Bell size={15} />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors">
                <HelpCircle size={15} />
              </button>
            </div>

            {/* Profile URL Badge */}
            <div className="flex items-center gap-2 bg-[#101424] border border-[#1b223c] rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-slate-500 font-medium font-mono hidden lg:inline">Profile URL:</span>
              <a 
                href={`/p/${profile.username}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-[#3b82f6] hover:underline font-mono truncate max-w-[120px] sm:max-w-none"
              >
                pulseboard.duckdns.org/p/{profile.username}
              </a>
              <button 
                onClick={copyToClipboard}
                className="p-1 text-slate-500 hover:text-white transition-colors ml-1"
                title="Copy Link"
              >
                {copiedLink ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              </button>
            </div>

            <button 
              onClick={logout}
              className="px-3 py-1.5 bg-[#161a29] border border-slate-800 hover:bg-[#1f253a] text-[10px] uppercase tracking-wider font-bold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

        </header>

        {/* Scrollable page body */}
        <div className="flex-grow p-6 lg:p-8 overflow-y-auto space-y-8 max-w-5xl w-full mx-auto">
          
          {/* Welcome Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {profile.display_name || user.github_name}</h1>
              <p className="text-xs text-slate-450 leading-relaxed">
                Your developer ecosystem is up and running. <span className="text-[#3b82f6] font-semibold">12 new visitors</span> since yesterday.
              </p>
            </div>

            {/* Quick action profile edit toggler */}
            <button 
              onClick={() => setEditingProfile(!editingProfile)}
              className="px-4 py-2 bg-[#182035] hover:bg-[#1e2947] border border-[#2b395d] text-xs font-semibold text-[#3b82f6] rounded-xl transition-all self-start sm:self-auto cursor-pointer"
            >
              {editingProfile ? 'Close Editor' : 'Edit Profile Parameters'}
            </button>
          </div>

          {/* Profile Editor Panel */}
          {editingProfile && (
            <div className="p-6 bg-[#0e111a] border border-[#1e2338] rounded-xl shadow-lg space-y-6">
              <h3 className="text-sm font-bold text-white">Edit Profile Fields</h3>
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
                      className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors"
                      value={editForm[key] || ''}
                      onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    />
                  </div>
                ))}
                
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Bio</label>
                  <textarea
                    className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-white focus:outline-none min-h-[70px] resize-y transition-colors"
                    value={editForm.bio || ''}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                </div>
                
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">Currently Building</label>
                  <input
                    className="w-full bg-[#060810] border border-[#1a1f33] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-white focus:outline-none transition-colors"
                    value={editForm.currently_building || ''}
                    onChange={e => setEditForm({ ...editForm, currently_building: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <button 
                    onClick={saveProfileUpdates} 
                    disabled={saving} 
                    className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setEditingProfile(false)} 
                    className="px-4 py-2 bg-slate-900 border border-[#1e2338] text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4 Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: Total Repos */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Total Repos</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">42</h3>
                <span className="text-[9px] text-[#3b82f6] font-semibold mt-1 block">+3 this month</span>
              </div>
              <div className="p-3 bg-[#111626] border border-[#1c223c] rounded-xl text-[#3b82f6]">
                <Github size={20} />
              </div>
            </div>

            {/* CARD 2: Active Skills */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Active Skills</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">{profile.skills?.length || 18}</h3>
                <span className="text-[9px] text-slate-455 mt-1 block truncate">Top: React, Go, K8s</span>
              </div>
              <div className="p-3 bg-[#111626] border border-[#1c223c] rounded-xl text-orange-500">
                <Flame size={20} />
              </div>
            </div>

            {/* CARD 3: Blog Posts */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Blog Posts</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">12</h3>
                <span className="text-[9px] text-emerald-500 font-semibold mt-1 block">1.2k reads</span>
              </div>
              <div className="p-3 bg-[#111626] border border-[#1c223c] rounded-xl text-emerald-500">
                <FileText size={20} />
              </div>
            </div>

            {/* CARD 4: Completeness */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">Completeness</span>
                <h3 className="text-2xl font-bold text-white font-mono mt-1">85%</h3>
                <div className="w-24 h-1.5 bg-[#060810] border border-slate-900 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3b82f6] to-indigo-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div className="p-3 bg-[#111626] border border-[#1c223c] rounded-xl text-indigo-400">
                <Award size={20} />
              </div>
            </div>

          </div>

          {/* Middle Row: Developer Velocity + Pulse Profile Ready Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Developer Velocity Chart */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-6 rounded-xl lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 font-mono">Developer Velocity</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">482 contributions in the last year</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 select-none">
                  <span>Less</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#161a29]" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#1e293b]" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]/40" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                  <span>More</span>
                </div>
              </div>

              {/* Commits Grid Container */}
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[640px]">
                  {contributionGrid.map((val, idx) => {
                    let color = 'bg-[#121625]'
                    if (val === 1) color = 'bg-[#1e293b]'
                    if (val === 2) color = 'bg-[#3b82f6]/40'
                    if (val === 3) color = 'bg-[#3b82f6]'
                    
                    return (
                      <div 
                        key={idx} 
                        className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 hover:ring-1 hover:ring-white/40 cursor-crosshair ${color}`}
                        title={`${val === 0 ? 'No' : val * 3} contributions`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Profile Ready Notice */}
            <div className="bg-gradient-to-br from-[#101424] to-[#0e111a] border border-[#1b223c] p-6 rounded-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
              
              <div className="space-y-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] border border-[#3b82f6]/20">
                  <Check size={18} />
                </div>
                <h3 className="text-sm font-bold text-white">Pulse Profile Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {profile.display_name || 'Alex'}, your public profile is now discoverable by technical recruiters and collaborators globally.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button 
                  onClick={() => window.open(`/p/${profile.username}`, '_blank')}
                  className="py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-semibold text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={13} /> View Profile
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="py-2.5 bg-[#161a29] border border-slate-800 hover:bg-[#1f253a] text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Completeness (Circular Chart) + Recent Profile Views */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Completeness Checklist */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-6 rounded-xl space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 font-mono">Profile Completeness</h3>
              
              <div className="flex items-center gap-8">
                
                {/* SVG Donut Chart */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      className="stroke-[#121625]" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      className="stroke-[#3b82f6]" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * 85) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-base font-extrabold text-white font-mono">85%</span>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  {[
                    { label: 'Verify LinkedIn', checked: true },
                    { label: 'Add 3 Projects', checked: true },
                    { label: 'Link Hashnode', checked: profile.social_links?.some(l => l.platform.toLowerCase() === 'hashnode') },
                    { label: 'Upload Resume', checked: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-xs font-medium font-sans">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        item.checked 
                          ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                          : 'border-slate-800 text-transparent'
                      }`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className={item.checked ? 'text-slate-350' : 'text-slate-505'}>{item.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Recent Profile Views */}
            <div className="bg-[#0e111a] border border-[#1a1f33] p-6 rounded-xl lg:col-span-2 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 font-mono">Recent Profile Views</h3>
                
                <div className="divide-y divide-[#1a1f33]/40 space-y-3.5">
                  {[
                    { title: 'Senior Recruiter', company: 'Meta', time: '2h ago', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80' },
                    { title: 'Engineering Lead', company: 'Stripe', time: '5h ago', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=80&h=80&q=80' },
                    { title: 'Founder', company: 'Stealth Startup', time: '1d ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80' },
                  ].map((view, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-3.5 first:pt-0 text-xs">
                      <div className="flex items-center gap-3">
                        <img 
                          src={view.avatar} 
                          alt="Recruiter avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-[#1c223c]" 
                        />
                        <div>
                          <span className="font-semibold text-white">{view.title}</span>{' '}
                          <span className="text-slate-500">at</span>{' '}
                          <span className="text-[#3b82f6] font-medium">{view.company}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{view.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1f33]/40">
                <button className="text-[11px] text-[#3b82f6] hover:text-[#2563eb] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                  View All Activity <ChevronRight size={14} />
                </button>
              </div>

            </div>

          </div>

          {/* Skills Management Section */}
          <div className="bg-[#0e111a] border border-[#1a1f33] p-6 rounded-xl space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-455 font-mono">Profile Skill Stack</h3>
            
            {/* Existing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.skills?.map(skill => (
                <div key={skill.id} className="p-3 bg-[#060810] border border-[#161a29] rounded-lg flex items-center justify-between">
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate">{skill.name}</span>
                      <span className="font-mono text-slate-500">{skill.proficiency}%</span>
                    </div>
                    <div className="h-1.5 bg-[#0e111a] border border-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3b82f6] to-indigo-500 rounded-full" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteSkill(skill.id)}
                    className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-red-500/5 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {profile.skills?.length === 0 && (
                <div className="text-xs text-slate-500 italic font-mono col-span-2 py-2">
                  No skills linked to your profile stack yet. Add them below!
                </div>
              )}
            </div>

            {/* Add Skill form fields */}
            <div className="pt-4 border-t border-[#1a1f33]/40 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. TypeScript"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full bg-[#060810] border border-[#161a29] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Proficiency ({newSkill.proficiency}%)</label>
                <div className="flex items-center h-10 px-2 bg-[#060810] border border-[#161a29] rounded-lg">
                  <input 
                    type="range" 
                    min="1" 
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
                    className="w-28 accent-[#3b82f6] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full bg-[#060810] border border-[#161a29] focus:border-[#3b82f6] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Database">Database</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button 
                onClick={addSkill}
                disabled={!newSkill.name}
                className="w-full md:w-auto px-5 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
              >
                Add Skill
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  )
}
