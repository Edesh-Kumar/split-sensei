import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PageBackground from '../components/PageBackground'
import EditGroupModal from '../components/EditGroupModal'
import {
  ArrowLeft, Plus, Users, Receipt, BarChart2, Clock,
  MapPin, Calendar, X, SlidersHorizontal, Edit2, Image, ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const TABS = [
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'summary', label: 'Summary', icon: Users },
  { id: 'trends', label: 'Trends', icon: BarChart2 },
  { id: 'timeline', label: 'Timeline', icon: Clock },
]

const TAG_COLORS = {
  food: '#e8a87c', transport: '#7ec8e3', stay: '#a8d8a8',
  activity: '#d4a8d4', drinks: '#f7dc6f', shopping: '#f1948a', other: '#aab7b8'
}
const TAG_ICONS = {
  food: '🍽️', transport: '🚗', stay: '🏨',
  activity: '🎯', drinks: '🍻', shopping: '🛍️', other: '📌'
}


function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function Avatar({ name, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--accent), #a8833f)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#1c1c1e', flexShrink: 0
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

// ── Settlement Modal ───────────────────────────────────────────────
function SettlementModal({ debt, group, members, onClose, onSaved }) {
  const { profile } = useAuth()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const fromMember = members.find(m => m.display_name === debt.from)
  const toMember = members.find(m => m.display_name === debt.to)

  const handleSettle = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('settlements').insert({
      group_id: group.id,
      from_member: fromMember?.id,
      to_member: toMember?.id,
      amount: debt.amount,
      note: note.trim() || null
    })

    await supabase.from('activity_log').insert({
      group_id: group.id, action_type: 'settlement',
      actor_id: user.id, actor_name: profile?.name || 'Someone',
      metadata: { from: debt.from, to: debt.to, amount: debt.amount, currency: group.currency }
    })

    onSaved(); onClose(); setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--cream)' }}>Record Settlement</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px', borderRadius: 16, marginBottom: 24, background: 'rgba(107,203,119,0.08)', border: '1px solid rgba(107,203,119,0.2)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar name={debt.from} size={44} />
              <div style={{ fontSize: 13, color: '#ff8a80', marginTop: 6, fontWeight: 500 }}>{debt.from}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>pays</div>
              <div className="font-display" style={{ fontSize: 22, color: 'var(--accent)' }}>{formatCurrency(debt.amount, group.currency)}</div>
              <div style={{ fontSize: 18 }}>→</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar name={debt.to} size={44} />
              <div style={{ fontSize: 13, color: '#6bcb77', marginTop: 6, fontWeight: 500 }}>{debt.to}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="label">Note <span style={{ textTransform: 'none', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>(optional)</span></label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="e.g. Paid via UPI, Cash handed over..."
            className="input-field" style={{ paddingLeft: 14 }} />
        </div>

        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
          This will record that <strong style={{ color: 'var(--cream)' }}>{debt.from}</strong> has paid <strong style={{ color: 'var(--cream)' }}>{debt.to}</strong> and update the balances.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: 'pointer', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          <button onClick={handleSettle} disabled={loading} style={{ padding: '12px', background: 'rgba(107,203,119,0.15)', border: '1px solid rgba(107,203,119,0.3)', borderRadius: 12, cursor: 'pointer', color: '#6bcb77', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {loading ? 'Recording...' : '✓ Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Expense Form ───────────────────────────────────────────────────
function ExpenseForm({ group, members, existing, onClose, onSaved }) {
  const { profile } = useAuth()
  const receiptRef = useRef()

  const [form, setForm] = useState({
    name: existing?.name || '',
    amount: existing?.amount || '',
    tag: existing?.tag || 'other',
    date: existing?.date || new Date().toISOString().split('T')[0],
    notes: existing?.notes || ''
  })

  const initPayers = existing?.expense_payers?.length
    ? existing.expense_payers.map(p => ({ member_id: p.member_id, amount: p.amount_paid }))
    : [{ member_id: '', amount: '' }]

  const initSplits = members.map(m => {
    const existingSplit = existing?.expense_splits?.find(s => s.member_id === m.id)
    return {
      member_id: m.id, name: m.display_name,
      percentage: existingSplit ? existingSplit.percentage : Math.round(100 / members.length),
      amount: existingSplit ? existingSplit.amount_owed : 0
    }
  })

  const [payers, setPayers] = useState(initPayers)
  const [splits, setSplits] = useState(initSplits)
  const [splitMode, setSplitMode] = useState('equal')
  const [receipt, setReceipt] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(existing?.receipt_url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = parseFloat(form.amount) || 0
  const totalPaid = payers.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const totalSplitPct = splits.reduce((s, sp) => s + sp.percentage, 0)

  useEffect(() => {
    if (splitMode === 'equal' && totalAmount > 0 && splits.length > 0) {
      const each = parseFloat((totalAmount / splits.length).toFixed(2))
      const pct = parseFloat((100 / splits.length).toFixed(2))
      setSplits(splits.map(s => ({ ...s, percentage: pct, amount: each })))
    }
  }, [form.amount, splitMode])

  useEffect(() => {
    if (payers.length === 1 && totalAmount > 0) {
      setPayers([{ ...payers[0], amount: totalAmount }])
    }
  }, [form.amount])

  const updateSplitPercentage = (i, val) => {
    const newPct = parseFloat(val) || 0
    const updated = [...splits]
    updated[i].percentage = newPct
    updated[i].amount = parseFloat(((totalAmount * newPct) / 100).toFixed(2))
    const otherIndices = splits.map((_, idx) => idx).filter(idx => idx !== i)
    const remaining = 100 - newPct
    if (otherIndices.length > 0 && remaining >= 0) {
      const currentOtherTotal = otherIndices.reduce((s, idx) => s + splits[idx].percentage, 0)
      otherIndices.forEach(idx => {
        const ratio = currentOtherTotal > 0 ? splits[idx].percentage / currentOtherTotal : 1 / otherIndices.length
        const newOtherPct = parseFloat((remaining * ratio).toFixed(2))
        updated[idx].percentage = newOtherPct
        updated[idx].amount = parseFloat(((totalAmount * newOtherPct) / 100).toFixed(2))
      })
    }
    setSplits(updated)
  }

  const handleReceipt = (e) => {
    const file = e.target.files[0]
    if (file) { setReceipt(file); setReceiptPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Expense name is required')
    if (!totalAmount || totalAmount <= 0) return setError('Enter a valid amount')
    const validPayers = payers.filter(p => p.member_id && p.amount)
    if (validPayers.length === 0) return setError('Select who paid')
    const payerTotal = validPayers.reduce((s, p) => s + parseFloat(p.amount || 0), 0)
    if (Math.abs(payerTotal - totalAmount) > 0.01)
      return setError(`Payer total (${formatCurrency(payerTotal, group.currency)}) must equal expense amount (${formatCurrency(totalAmount, group.currency)})`)
    const splitTotal = splits.reduce((s, sp) => s + sp.percentage, 0)
    if (Math.abs(splitTotal - 100) > 1)
      return setError(`Split must add to 100% (currently ${splitTotal.toFixed(1)}%)`)

    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()

    let receiptUrl = existing?.receipt_url || null
    if (receipt) {
      const ext = receipt.name.split('.').pop()
      const fileName = `${group.id}-${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage.from('receipts').upload(fileName, receipt, { upsert: true })
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path)
        receiptUrl = urlData.publicUrl
      }
    }

    if (existing) {
      await supabase.from('expenses').update({ name: form.name.trim(), amount: totalAmount, tag: form.tag, date: form.date, notes: form.notes.trim() || null, receipt_url: receiptUrl }).eq('id', existing.id)
      await supabase.from('expense_payers').delete().eq('expense_id', existing.id)
      await supabase.from('expense_splits').delete().eq('expense_id', existing.id)
      await supabase.from('expense_payers').insert(validPayers.map(p => ({ expense_id: existing.id, member_id: p.member_id, amount_paid: parseFloat(p.amount) })))
      await supabase.from('expense_splits').insert(splits.map(s => ({ expense_id: existing.id, member_id: s.member_id, amount_owed: s.amount, percentage: s.percentage })))
      await supabase.from('activity_log').insert({ group_id: group.id, action_type: 'expense_edited', actor_id: user.id, actor_name: profile?.name || 'Someone', metadata: { expense_name: form.name, amount: totalAmount, currency: group.currency } })
    } else {
      const { data: expense } = await supabase.from('expenses').insert({ group_id: group.id, name: form.name.trim(), amount: totalAmount, currency: group.currency, tag: form.tag, date: form.date, notes: form.notes.trim() || null, created_by: user.id, receipt_url: receiptUrl }).select().single()
      await supabase.from('expense_payers').insert(validPayers.map(p => ({ expense_id: expense.id, member_id: p.member_id, amount_paid: parseFloat(p.amount) })))
      await supabase.from('expense_splits').insert(splits.map(s => ({ expense_id: expense.id, member_id: s.member_id, amount_owed: s.amount, percentage: s.percentage })))
      const payerNames = validPayers.map(p => members.find(m => m.id === p.member_id)?.display_name).filter(Boolean).join(', ')
      await supabase.from('activity_log').insert({ group_id: group.id, action_type: 'expense_added', actor_id: user.id, actor_name: profile?.name || 'Someone', metadata: { expense_name: form.name, amount: totalAmount, currency: group.currency, paid_by: payerNames } })
    }

    onSaved(); onClose(); setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 560, borderRadius: 24, maxHeight: '95vh', overflowY: 'auto', padding: '28px 24px', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--cream)' }}>{existing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)', padding: 4 }}><X size={20} /></button>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Expense Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dinner at the resort" className="input-field" style={{ paddingLeft: 14 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Amount ({group.currency})</label>
              <input type="number" min="0" step="0.01" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" className="input-field" style={{ paddingLeft: 14 }} />
            </div>
            <div>
              <label className="label">Tag</label>
              <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}
                className="input-field" style={{ paddingLeft: 14 }}>
                {Object.entries(TAG_ICONS).map(([key, icon]) => (
                  <option key={key} value={key}>{icon} {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="input-field" style={{ paddingLeft: 14, colorScheme: 'dark' }} />
          </div>

          <div>
            <label className="label">Who Paid?</label>
            {payers.map((payer, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={payer.member_id} onChange={e => { const u = [...payers]; u[i].member_id = e.target.value; setPayers(u) }}
                  className="input-field" style={{ paddingLeft: 14 }}>
                  <option value="">Select member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
                </select>
                <input type="number" min="0" step="0.01" value={payer.amount}
                  onChange={e => { const u = [...payers]; u[i].amount = e.target.value; setPayers(u) }}
                  placeholder="Amount" className="input-field" style={{ paddingLeft: 14 }} />
                {payers.length > 1
                  ? <button onClick={() => setPayers(payers.filter((_, idx) => idx !== i))} style={{ width: 36, height: 36, background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8a80' }}><X size={14} /></button>
                  : <div style={{ width: 36 }} />}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <button onClick={() => setPayers([...payers, { member_id: '', amount: '' }])}
                style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                + Add another payer
              </button>
              {totalAmount > 0 && (
                <span style={{ fontSize: 12, color: Math.abs(totalPaid - totalAmount) < 0.01 ? '#6bcb77' : '#ff8a80' }}>
                  {formatCurrency(totalPaid, group.currency)} / {formatCurrency(totalAmount, group.currency)}
                </span>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={12} /> Split
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['equal', 'custom'].map(mode => (
                  <button key={mode} onClick={() => setSplitMode(mode)} style={{
                    padding: '4px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                    background: splitMode === mode ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    border: splitMode === mode ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: splitMode === mode ? '#1c1c1e' : 'rgba(245,240,232,0.6)',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: splitMode === mode ? 600 : 400
                  }}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
                ))}
              </div>
            </div>
            {splits.map((split, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={split.name} size={28} />
                <span style={{ flex: 1, fontSize: 14, color: 'var(--cream)', minWidth: 60 }}>{split.name}</span>
                {splitMode === 'custom' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <input type="range" min="0" max="100" step="1" value={Math.round(split.percentage)}
                      onChange={e => updateSplitPercentage(i, e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--accent)', minWidth: 80 }} />
                    <span style={{ fontSize: 13, color: 'var(--accent)', minWidth: 38, textAlign: 'right' }}>{split.percentage.toFixed(0)}%</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', minWidth: 38, textAlign: 'right' }}>{split.percentage.toFixed(0)}%</span>
                )}
                <span style={{ fontSize: 13, color: 'var(--accent)', minWidth: 80, textAlign: 'right' }}>{formatCurrency(split.amount, group.currency)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12, color: Math.abs(totalSplitPct - 100) < 1 ? '#6bcb77' : '#ff8a80', marginTop: 4 }}>
              Total: {totalSplitPct.toFixed(0)}% {Math.abs(totalSplitPct - 100) < 1 ? '✓' : '(must be 100%)'}
            </div>
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Image size={12} /> Receipt <span style={{ textTransform: 'none', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>(optional)</span>
            </label>
            <div onClick={() => receiptRef.current?.click()} style={{ borderRadius: 12, border: '1px dashed rgba(255,255,255,0.15)', padding: receiptPreview ? 0 : '16px', cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}>
              {receiptPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={receiptPreview} alt="receipt" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                  <button onClick={e => { e.stopPropagation(); setReceipt(null); setReceiptPreview(null) }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(245,240,232,0.3)' }}>
                  <Image size={18} /><span style={{ fontSize: 14 }}>Upload receipt or photo</span>
                </div>
              )}
            </div>
            <input ref={receiptRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReceipt} />
          </div>

          <div>
            <label className="label">Notes <span style={{ textTransform: 'none', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>(optional)</span></label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notes..." rows={2} className="input-field" style={{ paddingLeft: 14, paddingTop: 12, resize: 'none' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : existing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Expense Detail Modal ───────────────────────────────────────────
function ExpenseDetailModal({ expense, group, members, onClose, onEdit, onSaved }) {
  const { profile } = useAuth()
  const [deleting, setDeleting] = useState(false)

  const payerNames = expense.expense_payers?.map(p => {
    const m = members.find(m => m.id === p.member_id)
    return m ? `${m.display_name} (${formatCurrency(p.amount_paid, group.currency)})` : null
  }).filter(Boolean) || []

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return
    setDeleting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('expenses').delete().eq('id', expense.id)
    await supabase.from('activity_log').insert({ group_id: group.id, action_type: 'expense_deleted', actor_id: user.id, actor_name: profile?.name || 'Someone', metadata: { expense_name: expense.name, amount: expense.amount, currency: group.currency } })
    onSaved(); onClose(); setDeleting(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 480, borderRadius: 24, padding: '28px 24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${TAG_COLORS[expense.tag]}20`, border: `1px solid ${TAG_COLORS[expense.tag]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {TAG_ICONS[expense.tag]}
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: 20, color: 'var(--cream)' }}>{expense.name}</h2>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: `${TAG_COLORS[expense.tag]}20`, color: TAG_COLORS[expense.tag] }}>{expense.tag}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)' }}><X size={20} /></button>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
          <div className="font-display" style={{ fontSize: 40, color: 'var(--accent)' }}>{formatCurrency(expense.amount, group.currency)}</div>
          <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: 14, marginTop: 4 }}>
            {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Paid By</div>
          {payerNames.map((name, i) => <div key={i} style={{ fontSize: 14, color: 'var(--cream)', padding: '4px 0' }}>💳 {name}</div>)}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Split</div>
          {expense.expense_splits?.map((split, i) => {
            const m = members.find(m => m.id === split.member_id)
            return m ? (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar name={m.display_name} size={28} />
                <span style={{ flex: 1, fontSize: 14, color: 'var(--cream)' }}>{m.display_name}</span>
                <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)' }}>{parseFloat(split.percentage).toFixed(0)}%</span>
                <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, minWidth: 80, textAlign: 'right' }}>{formatCurrency(split.amount_owed, group.currency)}</span>
              </div>
            ) : null
          })}
        </div>

        {expense.notes && (
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 14, color: 'rgba(245,240,232,0.7)', fontStyle: 'italic' }}>{expense.notes}</div>
          </div>
        )}

        {expense.receipt_url && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Receipt</div>
            <img src={expense.receipt_url} alt="receipt" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => window.open(expense.receipt_url, '_blank')} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <button onClick={() => { onClose(); onEdit(expense) }} style={{ padding: '12px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 12, cursor: 'pointer', color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 500 }}>
            <Edit2 size={14} /> Edit
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '12px', background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 12, cursor: 'pointer', color: '#ff8a80', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
            {deleting ? 'Deleting...' : '🗑 Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Member Modal ───────────────────────────────────────────────
function AddMemberModal({ group, onClose, onSaved }) {
  const { profile } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Name is required')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('group_members').insert({ group_id: group.id, display_name: name.trim(), description: description.trim() || null })
    await supabase.from('activity_log').insert({ group_id: group.id, action_type: 'member_added', actor_id: user.id, actor_name: profile?.name || 'Someone', metadata: { member_name: name.trim() } })
    onSaved(); onClose(); setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--cream)' }}>Add Member</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)' }}><X size={20} /></button>
        </div>
        {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Member name" className="input-field" style={{ paddingLeft: 14 }} />
          </div>
          <div>
            <label className="label">Note <span style={{ textTransform: 'none', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>(optional)</span></label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Why added later, role, etc." className="input-field" style={{ paddingLeft: 14 }} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary">{loading ? 'Adding...' : 'Add Member'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Remove Member Modal ────────────────────────────────────────────
function RemoveMemberModal({ member, group, balances, onClose, onSaved }) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const balance = balances.find(b => b.id === member.id)
  const hasBalance = balance && Math.abs(balance.net) > 0.01

  const handleRemove = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('group_members').update({ removed_at: new Date().toISOString() }).eq('id', member.id)
    await supabase.from('activity_log').insert({ group_id: group.id, action_type: 'member_removed', actor_id: user.id, actor_name: profile?.name || 'Someone', metadata: { member_name: member.display_name } })
    onSaved(); onClose(); setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 22, color: 'var(--cream)' }}>Remove Member</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.5)' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
          <Avatar name={member.display_name} size={40} />
          <div>
            <div style={{ color: 'var(--cream)', fontWeight: 500 }}>{member.display_name}</div>
            {hasBalance && <div style={{ fontSize: 13, color: balance.net > 0 ? '#6bcb77' : '#ff8a80', marginTop: 2 }}>
              {balance.net > 0 ? `Is owed ${formatCurrency(balance.net, group.currency)}` : `Owes ${formatCurrency(Math.abs(balance.net), group.currency)}`}
            </div>}
          </div>
        </div>
        {hasBalance && <div style={{ padding: '12px 14px', background: 'rgba(255,200,100,0.1)', border: '1px solid rgba(255,200,100,0.2)', borderRadius: 10, marginBottom: 16, fontSize: 14, color: 'rgba(245,240,232,0.7)' }}>⚠️ Unsettled balance exists. Consider settling before removing.</div>}
        <p style={{ color: 'rgba(245,240,232,0.55)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Remove <strong style={{ color: 'var(--cream)' }}>{member.display_name}</strong>? Expense history will be preserved.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: 'pointer', color: 'var(--cream)', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          <button onClick={handleRemove} disabled={loading} style={{ padding: '12px', background: 'rgba(220,80,80,0.15)', border: '1px solid rgba(220,80,80,0.3)', borderRadius: 12, cursor: 'pointer', color: '#ff8a80', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{loading ? 'Removing...' : 'Remove'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────
export default function GroupDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')

  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [viewingExpense, setViewingExpense] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [removingMember, setRemovingMember] = useState(null)
  const [settlingDebt, setSettlingDebt] = useState(null)
  const [showEditGroup, setShowEditGroup] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: g }, { data: m }, { data: e }, { data: al }] = await Promise.all([
      supabase.from('groups').select('*').eq('id', id).single(),
      supabase.from('group_members').select('*').eq('group_id', id).is('removed_at', null).order('joined_at'),
      supabase.from('expenses').select('*, expense_payers(*), expense_splits(*)').eq('group_id', id).order('date', { ascending: false }),
      supabase.from('activity_log').select('*').eq('group_id', id).order('created_at', { ascending: false })
    ])
    setGroup(g); setMembers(m || []); setExpenses(e || []); setActivityLog(al || [])
    setLoading(false)
  }

  const calculateBalances = () => {
    const balances = {}
    members.forEach(m => { balances[m.id] = { id: m.id, name: m.display_name, paid: 0, owed: 0, net: 0 } })
    expenses.forEach(exp => {
      exp.expense_payers?.forEach(p => { if (balances[p.member_id]) balances[p.member_id].paid += Number(p.amount_paid) })
      exp.expense_splits?.forEach(s => { if (balances[s.member_id]) balances[s.member_id].owed += Number(s.amount_owed) })
    })
    Object.values(balances).forEach(b => { b.net = b.paid - b.owed })
    return Object.values(balances)
  }

  const calculateDebts = (balances) => {
    const creds = balances.filter(b => b.net > 0.01).sort((a, b) => b.net - a.net).map(b => ({ ...b }))
    const debs = balances.filter(b => b.net < -0.01).sort((a, b) => a.net - b.net).map(b => ({ ...b }))
    const debts = []
    let ci = 0, di = 0
    while (ci < creds.length && di < debs.length) {
      const amount = Math.min(creds[ci].net, Math.abs(debs[di].net))
      debts.push({ from: debs[di].name, to: creds[ci].name, amount })
      creds[ci].net -= amount; debs[di].net += amount
      if (Math.abs(creds[ci].net) < 0.01) ci++
      if (Math.abs(debs[di].net) < 0.01) di++
    }
    return debts
  }

  const balances = calculateBalances()
  const debts = calculateDebts(balances)
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)

  const trendsData = () => {
    const byDay = {}
    expenses.forEach(e => { if (!byDay[e.date]) byDay[e.date] = 0; byDay[e.date] += Number(e.amount) })
    return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14)
      .map(([date, amount]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: parseFloat(amount.toFixed(2)) }))
  }

  const tagData = () => {
    const byTag = {}
    expenses.forEach(e => { if (!byTag[e.tag]) byTag[e.tag] = 0; byTag[e.tag] += Number(e.amount) })
    return Object.entries(byTag).map(([tag, amount]) => ({ name: `${TAG_ICONS[tag]} ${tag}`, value: parseFloat(amount.toFixed(2)), color: TAG_COLORS[tag] || '#aab7b8' }))
  }

  const activityText = (log) => {
    const m = log.metadata || {}
    switch (log.action_type) {
      case 'expense_added': return `${log.actor_name} added "${m.expense_name}" — ${formatCurrency(m.amount, m.currency)}`
      case 'expense_edited': return `${log.actor_name} edited "${m.expense_name}"`
      case 'expense_deleted': return `${log.actor_name} deleted "${m.expense_name}"`
      case 'member_added': return `${log.actor_name} added ${m.member_name} to the group`
      case 'member_removed': return `${log.actor_name} removed ${m.member_name} from the group`
      case 'group_created': return `${log.actor_name} created the group`
      case 'settlement': return `${m.from} settled ${formatCurrency(m.amount, m.currency)} with ${m.to}`
      default: return log.action_type
    }
  }

  const activityIcon = (type) => ({ expense_added: '💸', expense_edited: '✏️', expense_deleted: '🗑️', member_added: '👤', member_removed: '🚪', group_created: '🏕️', settlement: '✅' }[type] || '📌')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0e0e12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>🧭</div><div style={{ color: 'rgba(245,240,232,0.4)' }}>Loading...</div></div>
    </div>
  )

  if (!group) return (
    <div style={{ minHeight: '100vh', background: '#0e0e12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
        <div style={{ color: 'rgba(245,240,232,0.4)' }}>Group not found</div>
        <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <PageBackground image={group?.image_url} />
      {showAddExpense && <ExpenseForm group={group} members={members} onClose={() => setShowAddExpense(false)} onSaved={fetchAll} />}
      {editingExpense && <ExpenseForm group={group} members={members} existing={editingExpense} onClose={() => setEditingExpense(null)} onSaved={fetchAll} />}
      {viewingExpense && <ExpenseDetailModal expense={viewingExpense} group={group} members={members} onClose={() => setViewingExpense(null)} onEdit={exp => setEditingExpense(exp)} onSaved={fetchAll} />}
      {showAddMember && <AddMemberModal group={group} onClose={() => setShowAddMember(false)} onSaved={fetchAll} />}
      {removingMember && <RemoveMemberModal member={removingMember} group={group} balances={balances} onClose={() => setRemovingMember(null)} onSaved={fetchAll} />}
      {showEditGroup && <EditGroupModal group={group} onClose={() => setShowEditGroup(false)} onSaved={fetchAll} />}
      {settlingDebt && <SettlementModal debt={settlingDebt} group={group} members={members} onClose={() => setSettlingDebt(null)} onSaved={fetchAll} />}

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 2, height: 260, overflow: 'hidden' }}>
       <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.25) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 20px 24px', maxWidth: 1100, margin: '0 auto', left: 0, right: 0 }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', color: 'var(--cream)', fontSize: 13, fontFamily: 'DM Sans, sans-serif', width: 'fit-content' }}>
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {group.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: 'rgba(245,240,232,0.8)' }}><MapPin size={10} />{group.location}</span>}
              {group.start_date && <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: 'rgba(245,240,232,0.8)' }}><Calendar size={10} />{new Date(group.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{group.end_date && ` → ${new Date(group.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</span>}
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(24px, 5vw, 36px)', color: 'var(--cream)', marginBottom: 6 }}>{group.name}</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)' }}>{members.length} members</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{formatCurrency(totalSpent, group.currency)} spent</span>
              <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)' }}>{expenses.length} expenses</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '0 16px 60px' }}>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', paddingTop: 6 }}>
          <button onClick={() => setShowAddExpense(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'linear-gradient(135deg, #c9a96e, #a8833f)', border: 'none', borderRadius: 12, cursor: 'pointer', color: '#1c1c1e', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            <Plus size={15} /> Add Expense
          </button>
          <button onClick={() => setShowAddMember(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, cursor: 'pointer', color: 'var(--cream)', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            <Users size={15} /> Add Member
          </button>
          <button onClick={() => setShowEditGroup(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, cursor: 'pointer',
            color: 'var(--cream)', fontSize: 14,
            fontFamily: 'DM Sans, sans-serif'
          }}>
            <Edit2 size={15} /> Edit Group
          </button>
        </div>

        {/* Members strip */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 40 }}>
              <Avatar name={m.display_name} size={24} />
              <span style={{ fontSize: 13, color: 'var(--cream)' }}>{m.display_name}</span>
              <button onClick={() => setRemovingMember(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.2)', display: 'flex', padding: 0, marginLeft: 2, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff8a80'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.2)'}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, width: 'fit-content', minWidth: '100%' }}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: active ? 'rgba(201,169,110,0.15)' : 'transparent',
                  color: active ? 'var(--accent)' : 'rgba(245,240,232,0.45)',
                  fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.2s', flex: 1, justifyContent: 'center'
                }}>
                  <Icon size={14} />{tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
              <div className="font-display" style={{ fontSize: 22, color: 'var(--cream)', marginBottom: 8 }}>No expenses yet</div>
              <div style={{ color: 'rgba(245,240,232,0.4)', marginBottom: 20 }}>Add your first expense to get started</div>
              <button onClick={() => setShowAddExpense(true)} className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />Add Expense
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {expenses.map(exp => {
                const payerNames = exp.expense_payers?.map(p => members.find(m => m.id === p.member_id)?.display_name).filter(Boolean) || []
                return (
                  <div key={exp.id} onClick={() => setViewingExpense(exp)} className="glass-light" style={{ borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${TAG_COLORS[exp.tag]}18`, border: `1px solid ${TAG_COLORS[exp.tag]}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {TAG_ICONS[exp.tag]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 500, color: 'var(--cream)', fontSize: 15 }}>{exp.name}</span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 5, background: `${TAG_COLORS[exp.tag]}18`, color: TAG_COLORS[exp.tag] }}>{exp.tag}</span>
                        {exp.receipt_url && <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>📎</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {payerNames.length > 0 && ` · ${payerNames.join(', ')}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="font-display" style={{ fontSize: 16, color: 'var(--accent)' }}>{formatCurrency(exp.amount, group.currency)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>{exp.expense_splits?.length || 0} way split</div>
                    </div>
                    <ChevronRight size={14} color="rgba(245,240,232,0.2)" style={{ flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="glass-light" style={{ borderRadius: 20, padding: '20px' }}>
              <h3 className="font-display" style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 16 }}>Balances</h3>
              {balances.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Avatar name={b.name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)' }}>Paid {formatCurrency(b.paid, group.currency)}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: b.net >= 0 ? '#6bcb77' : '#ff8a80', flexShrink: 0 }}>
                    {b.net >= 0 ? '+' : ''}{formatCurrency(b.net, group.currency)}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13 }}>Total Spent</span>
                  <span style={{ color: 'var(--cream)', fontWeight: 600, fontSize: 13 }}>{formatCurrency(totalSpent, group.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13 }}>Per Person</span>
                  <span style={{ color: 'var(--cream)', fontWeight: 600, fontSize: 13 }}>{members.length > 0 ? formatCurrency(totalSpent / members.length, group.currency) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="glass-light" style={{ borderRadius: 20, padding: '20px' }}>
              <h3 className="font-display" style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 16 }}>Who Owes Whom</h3>
              {debts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(245,240,232,0.4)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>All settled up!
                </div>
              ) : debts.map((d, i) => (
                <div key={i} style={{ marginBottom: 12, padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Avatar name={d.from} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: '#ff8a80', fontWeight: 500, fontSize: 13 }}>{d.from}</span>
                      <span style={{ color: 'rgba(245,240,232,0.4)', fontSize: 12 }}> owes </span>
                      <span style={{ color: '#6bcb77', fontWeight: 500, fontSize: 13 }}>{d.to}</span>
                    </div>
                    <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>{formatCurrency(d.amount, group.currency)}</div>
                  </div>
                  <button onClick={() => setSettlingDebt(d)} style={{
                    width: '100%', padding: '8px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(107,203,119,0.1)', border: '1px solid rgba(107,203,119,0.25)',
                    color: '#6bcb77', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,203,119,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(107,203,119,0.1)'}>
                    ✓ Mark as Settled
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-light" style={{ borderRadius: 20, padding: '20px' }}>
              <h3 className="font-display" style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 20 }}>Spending by Day</h3>
              {trendsData().length === 0
                ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,240,232,0.4)' }}>No data yet</div>
                : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendsData()}>
                    <XAxis dataKey="date" tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--cream)', fontSize: 13 }} />
                    <Bar dataKey="amount" fill="var(--accent)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>}
            </div>
            <div className="glass-light" style={{ borderRadius: 20, padding: '20px' }}>
              <h3 className="font-display" style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 20 }}>By Category</h3>
              {tagData().length === 0
                ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,240,232,0.4)' }}>No data yet</div>
                : <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <PieChart width={180} height={180}>
                    <Pie data={tagData()} cx={85} cy={85} innerRadius={50} outerRadius={82} paddingAngle={3} dataKey="value">
                      {tagData().map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--cream)', fontSize: 13 }} />
                  </PieChart>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tagData().map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: 13, color: 'var(--cream)' }}>{item.name}</span>
                        <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(item.value, group.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          activityLog.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(245,240,232,0.4)' }}>No activity yet</div>
            : <div style={{ position: 'relative', paddingLeft: 26 }}>
              <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.07)' }} />
              {activityLog.map(log => (
                <div key={log.id} style={{ position: 'relative', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', left: -21, top: 6, width: 20, height: 20, borderRadius: '50%', background: '#1c1c2e', border: '1.5px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                    {activityIcon(log.action_type)}
                  </div>
                  <div className="glass-light" style={{ borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, color: 'var(--cream)', lineHeight: 1.5 }}>{activityText(log)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 4 }}>
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>
    </div>
  )
}