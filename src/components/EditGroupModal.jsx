import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { X, Upload, Sparkles, MapPin, Calendar, FileText, Image } from 'lucide-react'
import { getCurrencyByLocation } from '../lib/countries'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY

export default function EditGroupModal({ group, onClose, onSaved }) {
  const fileInputRef = useRef()
  const [form, setForm] = useState({
  name: group.name || '',
  description: group.description || '',
  location: group.location || '',
  start_date: group.start_date || '',
  end_date: group.end_date || '',
  currency: group.currency || 'INR',
})
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(group.image_url || null)
  const [loading, setLoading] = useState(false)
  const [suggestingPhoto, setSuggestingPhoto] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)) }
  }

  const suggestPhoto = async () => {
    if (!form.name.trim()) return setError('Group name is needed to suggest a photo')
    setSuggestingPhoto(true); setError('')
    try {
      const query = form.location
        ? `${form.name} ${form.location} travel`
        : `${form.name} adventure travel`
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`)
      const data = await res.json()
      if (data.results?.[0]) {
        setImagePreview(data.results[0].urls.regular)
        setImage(null)
      } else {
        setImagePreview('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70')
      }
    } catch {
      setImagePreview('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70')
    }
    setSuggestingPhoto(false)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Group name is required')
    setLoading(true); setError('')

    let imageUrl = imagePreview

    if (image) {
      const ext = image.name.split('.').pop()
      const fileName = `${group.id}-${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('group-images').upload(fileName, image, { upsert: true })
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('group-images').getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    }

    const currency = form.currency || getCurrencyByLocation(form.location)?.currency || group.currency

    const { error: updateError } = await supabase.from('groups').update({
      name: form.name.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      image_url: imageUrl || null,
      currency,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }).eq('id', group.id)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    onSaved(); onClose(); setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, overflowY: 'auto'
    }}>
      <div className="glass" style={{
        width: '100%', maxWidth: 560, borderRadius: 24,
        maxHeight: '95vh', overflowY: 'auto',
        padding: '28px 24px', margin: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--cream)' }}>Edit Group</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Cover image */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Image size={12} /> Cover Photo
            </label>
            <div style={{
              borderRadius: 14, overflow: 'hidden', position: 'relative',
              aspectRatio: '16/7', background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer'
            }} onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null) }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <X size={13} />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'rgba(245,240,232,0.3)' }}>
                  <Upload size={22} />
                  <span style={{ fontSize: 13 }}>Click to upload a photo</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            <button onClick={suggestPhoto} disabled={suggestingPhoto} style={{
              marginTop: 8, display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 10,
              background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)',
              color: 'var(--accent)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              <Sparkles size={13} />
              {suggestingPhoto ? 'Finding photo...' : 'Suggest a photo'}
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="label">Group Name *</label>
            <input name="name" type="text" value={form.name} onChange={handleChange}
              placeholder="Group name" className="input-field" style={{ paddingLeft: 14 }} />
          </div>

          {/* Description */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={12} /> Description
              <span style={{ color: 'rgba(245,240,232,0.25)', textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="What's this group about?"
              rows={3} className="input-field" style={{ paddingLeft: 14, paddingTop: 12, resize: 'none', lineHeight: 1.6 }} />
          </div>

          {/* Location */}
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} /> Location
              <span style={{ color: 'rgba(245,240,232,0.25)', textTransform: 'none', fontSize: 11 }}>(optional)</span>
            </label>
            <input name="location" type="text" value={form.location} onChange={handleChange}
              placeholder="e.g. Bali, Indonesia" className="input-field" style={{ paddingLeft: 14 }} />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--accent)' }}>💱 Currency:</span>
              <select
                value={form.currency || getCurrencyByLocation(form.location)?.currency || 'USD'}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="input-field"
                style={{ paddingLeft: 10, fontSize: 13, padding: '6px 10px', width: 'auto' }}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.currency}>
                    {c.currency} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={12} /> Start Date
              </label>
              <input name="start_date" type="date" value={form.start_date} onChange={handleChange}
                className="input-field" style={{ paddingLeft: 14, colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={12} /> End Date
              </label>
              <input name="end_date" type="date" value={form.end_date} onChange={handleChange}
                className="input-field" style={{ paddingLeft: 14, colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <button onClick={onClose} style={{
              padding: '13px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
              cursor: 'pointer', color: 'var(--cream)',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}