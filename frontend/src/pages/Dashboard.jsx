import { useState, useEffect } from 'react'
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

  if (loading) return <div style={styles.center}>Loading...</div>

  if (error === 'no_profile') return (
    <div style={styles.center}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--cyan)', marginBottom: '16px' }}>Welcome to PulseBoard</h2>
        <p style={{ color: 'var(--muted)', fontFamily: 'monospace', marginBottom: '24px' }}>
          You don't have a profile yet. Create one to get your public link.
        </p>
        <button onClick={createProfile} disabled={saving} style={styles.btn}>
          {saving ? 'Creating...' : 'Create My Profile'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '20px' }}>Pulse</span>
            <span style={{ color: 'var(--orange)', fontWeight: 800, fontSize: '20px' }}>Board</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {profile && (
              <Link to={`/p/${profile.username}`} style={{
                fontFamily: 'monospace', fontSize: '11px', color: 'var(--cyan)',
                background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)',
                padding: '6px 14px', borderRadius: '2px'
              }}>
                pulseboard.duckdns.org/p/{profile.username}
              </Link>
            )}
            <button onClick={logout} style={{ ...styles.btnSm, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Logout
            </button>
          </div>
        </div>

        {profile && (
          <>
            {/* Profile Card */}
            <div style={styles.card}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img src={user.github_avatar_url} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid var(--border)' }} />
                <div style={{ flex: 1 }}>
                  {editing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        ['display_name', 'Display Name'],
                        ['headline', 'Headline'],
                        ['location', 'Location'],
                        ['website_url', 'Website URL'],
                      ].map(([key, label]) => (
                        <div key={key}>
                          <label style={styles.label}>{label}</label>
                          <input
                            style={styles.input}
                            value={form[key] || ''}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={styles.label}>Bio</label>
                        <textarea
                          style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                          value={form.bio || ''}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                        />
                      </div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={styles.label}>Currently Building</label>
                        <input
                          style={styles.input}
                          value={form.currently_building || ''}
                          onChange={e => setForm({ ...form, currently_building: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', gridColumn: '1/-1' }}>
                        <button onClick={saveProfile} disabled={saving} style={styles.btn}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(false)} style={{ ...styles.btn, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{profile.display_name || profile.username}</h2>
                        <button onClick={() => setEditing(true)} style={styles.btnSm}>Edit</button>
                      </div>
                      <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--cyan)', marginBottom: '6px' }}>@{profile.username}</p>
                      {profile.headline && <p style={{ color: 'var(--muted)', marginBottom: '6px' }}>{profile.headline}</p>}
                      {profile.bio && <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.7 }}>{profile.bio}</p>}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)' }}>
                        {profile.location && <span>📍 {profile.location}</span>}
                        {profile.currently_building && <span>🔨 {profile.currently_building}</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Skills</h3>
              <div style={{ marginBottom: '20px' }}>
                {profile.skills.map(skill => (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ minWidth: '140px', fontFamily: 'monospace', fontSize: '12px' }}>{skill.name}</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${skill.proficiency}%`, height: '100%', background: 'var(--cyan)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ minWidth: '35px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)', textAlign: 'right' }}>{skill.proficiency}%</span>
                    <button onClick={() => deleteSkill(skill.id)} style={{ ...styles.btnSm, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', padding: '2px 8px', fontSize: '10px' }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={styles.label}>Skill Name</label>
                  <input style={styles.input} placeholder="e.g. React" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Proficiency ({newSkill.proficiency}%)</label>
                  <input type="range" min="1" max="100" value={newSkill.proficiency} onChange={e => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })} style={{ width: '120px' }} />
                </div>
                <div>
                  <label style={styles.label}>Category</label>
                  <select style={styles.input} value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}>
                    <option>DevOps</option>
                    <option>Backend</option>
                    <option>Frontend</option>
                    <option>Cloud</option>
                    <option>Database</option>
                    <option>Other</option>
                  </select>
                </div>
                <button onClick={addSkill} style={styles.btn}>Add Skill</button>
              </div>
            </div>

            {/* Social Links */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Social Links</h3>
              {profile.social_links.map(link => (
                <div key={link.id} style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--cyan)', marginBottom: '8px' }}>
                  {link.platform}: <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                </div>
              ))}
              {profile.social_links.length === 0 && (
                <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)' }}>No social links yet. Add them via the API for now.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg)', color: 'var(--text)',
    fontFamily: 'monospace'
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '6px', padding: '24px', marginBottom: '20px'
  },
  sectionTitle: {
    fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px'
  },
  btn: {
    background: 'var(--cyan)', color: '#07090f', border: 'none',
    padding: '10px 20px', borderRadius: '3px', fontSize: '12px',
    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px'
  },
  btnSm: {
    background: 'rgba(0,229,255,0.08)', color: 'var(--cyan)',
    border: '1px solid rgba(0,229,255,0.25)', padding: '4px 12px',
    borderRadius: '2px', fontSize: '11px', cursor: 'pointer'
  },
  input: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '8px 12px', borderRadius: '3px',
    fontSize: '12px', fontFamily: 'monospace', width: '100%', outline: 'none'
  },
  label: {
    display: 'block', fontFamily: 'monospace', fontSize: '10px',
    color: 'var(--muted)', marginBottom: '4px', letterSpacing: '1px'
  }
}
