'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type ConversionRequest, type TapeItem, calcTapePrice } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['benjaminbellomartin@gmail.com', 'sohmgmandhare@gmail.com']

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [order, setOrder] = useState<ConversionRequest | null>(null)
  const [tapes, setTapes] = useState<TapeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [uploading, setUploading] = useState<number | null>(null)

  const initTapes = useCallback(async (order: ConversionRequest, existingTapes: TapeItem[]) => {
    if (existingTapes.length >= order.quantity) return existingTapes
    const toInsert = []
    for (let i = 1; i <= order.quantity; i++) {
      if (!existingTapes.find(t => t.tape_number === i)) {
        toInsert.push({ order_id: order.id, tape_number: i, length_hours: 0, length_minutes: 0 })
      }
    }
    if (toInsert.length === 0) return existingTapes
    const { data } = await supabase.from('tape_items').insert(toInsert).select()
    return [...existingTapes, ...(data ?? [])].sort((a, b) => a.tape_number - b.tape_number)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      if (!u) { router.replace('/account'); return }
      setUser(u)
      const admin = ADMIN_EMAILS.includes(u.email ?? '')
      setIsAdmin(admin)

      const { data: orderData } = await supabase
        .from('conversion_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (!orderData) { router.replace(admin ? '/admin' : '/account'); return }
      if (!admin && orderData.user_id !== u.id) { router.replace('/account'); return }

      setOrder(orderData)

      const { data: tapeData } = await supabase
        .from('tape_items')
        .select('*')
        .eq('order_id', id)
        .order('tape_number')

      let resolved = tapeData ?? []
      if (admin) {
        resolved = await initTapes(orderData, resolved)
      }
      setTapes(resolved)
      setLoading(false)
    })
  }, [id, router, initTapes])

  async function saveField(tapeNumber: number, field: string, value: string | number) {
    setSaving(tapeNumber)
    const tape = tapes.find(t => t.tape_number === tapeNumber)
    if (!tape) { setSaving(null); return }
    const { data } = await supabase
      .from('tape_items')
      .update({ [field]: value })
      .eq('id', tape.id)
      .select()
      .single()
    if (data) {
      setTapes(prev => prev.map(t => t.tape_number === tapeNumber ? data : t))
    }
    setSaving(null)
  }

  async function handleFileUpload(tapeNumber: number, file: File) {
    const tape = tapes.find(t => t.tape_number === tapeNumber)
    if (!tape) return
    setUploading(tapeNumber)
    const ext = file.name.split('.').pop()
    const path = `${id}/tape-${tapeNumber}.${ext}`
    const { error } = await supabase.storage
      .from('converted-files')
      .upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('converted-files').getPublicUrl(path)
    const { data } = await supabase
      .from('tape_items')
      .update({ file_url: publicUrl })
      .eq('id', tape.id)
      .select()
      .single()
    if (data) setTapes(prev => prev.map(t => t.tape_number === tapeNumber ? data : t))
    setUploading(null)
  }

  const totalPrice = tapes.reduce((sum, t) => sum + calcTapePrice(t.length_hours, t.length_minutes), 0)

  if (loading) {
    return (
      <section className="auth-section">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      </section>
    )
  }

  if (!order || !user) return null

  const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const statusLabel = order.status === 'complete' ? 'Complete' : order.status === 'in_progress' ? 'In Progress' : 'Pending'
  const statusClass = order.status === 'complete' ? 'badge-done' : 'badge-progress'

  return (
    <section className="dashboard">
      <div className="section-inner">
        <div className="dashboard-header">
          <div>
            <Link
              href={isAdmin ? '/admin' : '/account'}
              style={{ fontSize: '0.85rem', color: 'var(--gray-600)', textDecoration: 'underline', display: 'inline-block', marginBottom: '0.5rem' }}
            >
              ← Back
            </Link>
            <h1 style={{ fontSize: '1.6rem' }}>Order Details</h1>
            <p className="dash-email">Submitted {date}</p>
          </div>
          <span className={`badge ${statusClass}`} style={{ fontSize: '0.85rem', padding: '0.35rem 1rem' }}>{statusLabel}</span>
        </div>

        {/* Order summary */}
        <div style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Customer</p>
            <p style={{ fontWeight: 600 }}>{order.first_name} {order.last_name}</p>
            {isAdmin && <p style={{ fontSize: '0.83rem', color: 'var(--gray-600)' }}>{order.email}</p>}
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Format</p>
            <p style={{ fontWeight: 600 }}>{order.tape_type}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Tapes</p>
            <p style={{ fontWeight: 600 }}>{order.quantity}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Turnaround</p>
            <p style={{ fontWeight: 600 }}>{order.turnaround ?? '—'}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Delivery</p>
            <p style={{ fontWeight: 600 }}>{order.delivery === 'dropoff' ? 'Drop-off' : 'Mail'}</p>
          </div>
        </div>

        {/* Tape rows */}
        <h2 className="section-title" style={{ textAlign: 'left', fontSize: '1.2rem', marginBottom: '1rem', marginTop: 0 }}>Tapes</h2>

        {tapes.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No tape details yet.</p>
        ) : (
          <div className="order-table-wrap">
            <table className="order-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tape Name / Label</th>
                  <th>Length</th>
                  <th>Price</th>
                  {(isAdmin || tapes.some(t => t.file_url)) && <th>File</th>}
                </tr>
              </thead>
              <tbody>
                {tapes.map(tape => {
                  const price = calcTapePrice(tape.length_hours, tape.length_minutes)
                  return (
                    <tr key={tape.tape_number}>
                      <td style={{ fontWeight: 700, color: 'var(--gray-400)', width: '3rem' }}>{tape.tape_number}</td>

                      {/* Name */}
                      <td>
                        {isAdmin ? (
                          <input
                            type="text"
                            defaultValue={tape.name ?? ''}
                            placeholder="e.g. Christmas 1994"
                            disabled={saving === tape.tape_number}
                            onBlur={e => {
                              const val = e.target.value.trim()
                              if (val !== (tape.name ?? '')) saveField(tape.tape_number, 'name', val)
                            }}
                            style={{ border: '1.5px solid var(--gray-200)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.875rem', width: '100%', minWidth: '160px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.9rem' }}>{tape.name ?? <span style={{ color: 'var(--gray-400)' }}>—</span>}</span>
                        )}
                      </td>

                      {/* Length */}
                      <td>
                        {isAdmin ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              min={0}
                              max={23}
                              defaultValue={tape.length_hours}
                              disabled={saving === tape.tape_number}
                              onBlur={e => {
                                const val = parseInt(e.target.value, 10) || 0
                                if (val !== tape.length_hours) saveField(tape.tape_number, 'length_hours', val)
                              }}
                              style={{ border: '1.5px solid var(--gray-200)', borderRadius: '6px', padding: '0.4rem 0.5rem', fontSize: '0.875rem', width: '60px' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>hr</span>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              defaultValue={tape.length_minutes}
                              disabled={saving === tape.tape_number}
                              onBlur={e => {
                                const val = parseInt(e.target.value, 10) || 0
                                if (val !== tape.length_minutes) saveField(tape.tape_number, 'length_minutes', val)
                              }}
                              style={{ border: '1.5px solid var(--gray-200)', borderRadius: '6px', padding: '0.4rem 0.5rem', fontSize: '0.875rem', width: '60px' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>min</span>
                            {saving === tape.tape_number && <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>saving…</span>}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.9rem' }}>
                            {tape.length_hours > 0 || tape.length_minutes > 0
                              ? `${tape.length_hours}h ${tape.length_minutes}m`
                              : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {tape.length_hours > 0 || tape.length_minutes > 0
                          ? `$${price}`
                          : <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>—</span>}
                      </td>

                      {/* File */}
                      {(isAdmin || tapes.some(t => t.file_url)) && (
                        <td style={{ minWidth: '160px' }}>
                          {isAdmin ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {tape.file_url && (
                                <a href={tape.file_url} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: '0.75rem', color: 'var(--black)', textDecoration: 'underline' }}>
                                  {uploading === tape.tape_number ? 'Replacing…' : 'Uploaded ↗'}
                                </a>
                              )}
                              <label style={{ fontSize: '0.75rem', cursor: 'pointer', color: 'var(--gray-600)' }}>
                                {uploading === tape.tape_number ? 'Uploading…' : tape.file_url ? 'Replace' : 'Upload file'}
                                <input type="file" style={{ display: 'none' }} disabled={uploading === tape.tape_number}
                                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(tape.tape_number, f) }} />
                              </label>
                            </div>
                          ) : tape.file_url ? (
                            <a href={tape.file_url} download
                              className="btn btn-outline"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                              Download
                            </a>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              {tapes.some(t => t.length_hours > 0 || t.length_minutes > 0) && (
                <tfoot>
                  <tr>
                    <td colSpan={isAdmin || tapes.some(t => t.file_url) ? 3 : 3}
                      style={{ paddingTop: '0.85rem', paddingBottom: '0.85rem', paddingLeft: '1rem', borderTop: '2px solid var(--gray-200)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-600)' }}>
                      Estimated Total
                    </td>
                    <td style={{ paddingTop: '0.85rem', paddingBottom: '0.85rem', paddingLeft: '1rem', borderTop: '2px solid var(--gray-200)', fontWeight: 900, fontSize: '1.1rem' }}>
                      ${totalPrice}
                    </td>
                    {(isAdmin || tapes.some(t => t.file_url)) && <td style={{ borderTop: '2px solid var(--gray-200)' }} />}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {tapes.length > 0 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
            Pricing: $15 for up to 1 hr 59 min · +$2 per additional hour
          </p>
        )}

        {order.notes && (
          <div style={{ marginTop: '2rem', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>Notes</p>
            <p style={{ fontSize: '0.9rem' }}>{order.notes}</p>
          </div>
        )}
      </div>
    </section>
  )
}
