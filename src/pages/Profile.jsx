import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Camera, Globe, User, Mail, Save } from 'lucide-react'
import { countries } from '../lib/countries'
import PageBackground from '../components/PageBackground'

const BG = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80'

export default function Profile() {
    const navigate = useNavigate()
    const { profile, fetchProfile, user } = useAuth()
    const fileInputRef = useRef()

    const [form, setForm] = useState({
        name: profile?.name || '',
        country: profile?.country || '',
    })
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

    const handleAvatar = (e) => {
        const file = e.target.files[0]
        if (file) { setAvatar(file); setAvatarPreview(URL.createObjectURL(file)) }
    }

    const handleSave = async () => {
        if (!form.name.trim()) return setError('Name is required')
        setLoading(true); setError(''); setSuccess(false)

        let avatarUrl = profile?.avatar_url || null

        if (avatar) {
            const ext = avatar.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${ext}`
            const { data: uploadData } = await supabase.storage
                .from('avatars').upload(fileName, avatar, { upsert: true })
            if (uploadData) {
                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
                avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
            }
        }

        const selectedCountry = countries.find(c => c.code === form.country)
        const { error: updateError } = await supabase.from('profiles').update({
            name: form.name.trim(),
            country: form.country,
            currency: selectedCountry?.currency || profile?.currency || 'USD',
            avatar_url: avatarUrl
        }).eq('id', user.id)

        if (updateError) { setError(updateError.message) }
        else {
            await fetchProfile(user.id)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        }
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            <PageBackground />

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 520, margin: '0 auto', padding: '32px 20px 80px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                    <button onClick={() => navigate('/dashboard')} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', color: 'var(--cream)'
                    }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="font-display" style={{ fontSize: 28, color: 'var(--cream)' }}>Your Profile</h1>
                        <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 13, marginTop: 2 }}>Manage your account details</p>
                    </div>
                </div>

                <div className="glass" style={{ borderRadius: 24, padding: '32px 24px' }}>

                    {/* Avatar */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                        <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}>
                            <div style={{
                                width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                                border: '3px solid var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'linear-gradient(135deg, var(--accent), #a8833f)',
                                fontSize: 36, fontWeight: 700, color: '#1c1c1e'
                            }}>
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : profile?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: 2, right: 2,
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #0e0e12'
                            }}>
                                <Camera size={13} color="#1c1c1e" />
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
                        </label>
                    </div>

                    {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

                    {success && (
                        <div style={{
                            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                            background: 'rgba(107,203,119,0.15)',
                            border: '1px solid rgba(107,203,119,0.3)',
                            color: '#6bcb77', fontSize: 14, textAlign: 'center'
                        }}>
                            ✅ Profile updated successfully!
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Mail size={12} /> Email
                            </label>
                            <div style={{
                                padding: '14px 16px', borderRadius: 12,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: 'rgba(245,240,232,0.4)', fontSize: 15
                            }}>
                                {profile?.email || user?.email}
                            </div>
                            <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.25)', marginTop: 4 }}>Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={12} /> Full Name
                            </label>
                            <input name="name" type="text" value={form.name} onChange={handleChange}
                                placeholder="Your name" className="input-field" style={{ paddingLeft: 14 }} />
                        </div>

                        <div>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Globe size={12} /> Country
                            </label>
                            <select name="country" value={form.country} onChange={handleChange}
                                className="input-field" style={{ paddingLeft: 14 }}>
                                <option value="">Select your country</option>
                                {countries.map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                                ))}
                            </select>
                        </div>

                        {form.country && (
                            <div style={{
                                padding: '12px 16px', borderRadius: 10,
                                background: 'rgba(201,169,110,0.08)',
                                border: '1px solid rgba(201,169,110,0.2)',
                                fontSize: 13, color: 'rgba(245,240,232,0.6)'
                            }}>
                                💱 Default currency: <strong style={{ color: 'var(--accent)' }}>
                                    {countries.find(c => c.code === form.country)?.currency || 'USD'}
                                </strong>
                            </div>
                        )}

                        <button onClick={handleSave} disabled={loading} className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Save size={15} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="glass" style={{ borderRadius: 20, padding: '20px 24px', marginTop: 16 }}>
                    <h3 style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</h3>
                    <button onClick={async () => { await supabase.auth.signOut(); navigate('/login') }} style={{
                        width: '100%', padding: '12px', borderRadius: 12,
                        background: 'rgba(220,80,80,0.08)',
                        border: '1px solid rgba(220,80,80,0.2)',
                        cursor: 'pointer', color: '#ff8a80',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500
                    }}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}