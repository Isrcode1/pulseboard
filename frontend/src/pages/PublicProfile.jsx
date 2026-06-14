import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const fetchProfile = async (username) => {
  const { data } = await axios.get(`/p/${username}`)
  return data
}

export default function PublicProfile() {
  const { username } = useParams()
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
  })

  if (isLoading) return (
    <div style={styles.center}>
      <span style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>Loading {username}...</span>
    </div>
  )

  if (error) return (
    <div style={styles.center}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--orange)', marginBottom: '12px' }}>Profile not found</h2>
        <p style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>@{username} hasn't joined PulseBoard yet.</p>
      </div>
    </div>
  )

  const categories = [...new Set(profile.skills.map(s => s.category).filter(Boolean))]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(255,107,53,0.04))',
        borderBottom: '1px solid var(--border)', padding: '48px 24px 32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', flexShrink: 0, border: '2px solid var(--border)'
          }}>
            ⚡
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{profile.display_name || profile.username}</h1>
              {profile.open_to_work && (
                <span style={{
                  background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)',
                  color: 'var(--green)', fontSize: '10px', fontFamily: 'monospace',
                  padding: '3px 10px', borderRadius: '2px', letterSpacing: '1px'
                }}>OPEN TO WORK</span>
              )}
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--cyan)', marginBottom: '8px' }}>
              @{profile.username}
            </p>
            {profile.headline && (
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '10px' }}>{profile.headline}</p>
            )}
            {profile.bio && (
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '12px', maxWidth: '600px' }}>{profile.bio}</p>
            )}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {profile.location && (
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)' }}>📍 {profile.location}</span>
              )}
              {profile.social_links.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                  style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--cyan)' }}>
                  {link.platform} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Currently Building */}
        {profile.currently_building && (
          <div style={{
            background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)',
            borderLeft: '3px solid var(--cyan)', borderRadius: '4px',
            padding: '16px 20px', marginBottom: '24px'
          }}>
            <p style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--cyan)', letterSpacing: '2px', marginBottom: '6px' }}>CURRENTLY BUILDING</p>
            <p style={{ fontSize: '14px', color: 'var(--text)' }}>{profile.currently_building}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={styles.sectionTitle}>Skill Stack</h2>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '10px' }}>{cat.toUpperCase()}</p>
                {profile.skills.filter(s => s.category === cat).map(skill => (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ minWidth: '150px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text)' }}>{skill.name}</span>
                    <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${skill.proficiency}%`, height: '100%',
                        background: `linear-gradient(90deg, var(--cyan), var(--purple))`,
                        borderRadius: '3px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)', minWidth: '35px', textAlign: 'right' }}>{skill.proficiency}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)' }}>
            Powered by{' '}
            <a href="/" style={{ color: 'var(--cyan)' }}>PulseBoard</a>
            {' '}· Get your profile at pulseboard.duckdns.org
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg)'
  },
  sectionTitle: {
    fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px'
  }
}
