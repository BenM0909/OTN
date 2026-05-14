'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type ConversionRequest } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['benjaminbellomartin@gmail.com', 'sohmgmandhare@gmail.com']

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete',    label: 'Complete' },
]

export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<ConversionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadOrders = useCallback(async () => {
    const { data } = await supabase
      .from('conversion_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      if (!u || !ADMIN_EMAILS.includes(u.email ?? '')) {
        router.replace('/account')
        return
      }
      setUser(u)
      loadOrders().finally(() => setLoading(false))
    })
  }, [router, loadOrders])

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdating(orderId)
    await supabase
      .from('conversion_requests')
      .update({ status: newStatus })
      .eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdating(null)
  }

  async function handleDelete(orderId: string) {
    if (!confirm('Delete this order? This cannot be undone.')) return
    setDeleting(orderId)
    await supabase.from('conversion_requests').delete().eq('id', orderId)
    setOrders(prev => prev.filter(o => o.id !== orderId))
    setDeleting(null)
  }

  async function handleFileUpload(orderId: string, file: File) {
    setUploading(orderId)
    const ext = file.name.split('.').pop()
    const path = `${orderId}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('converted-files')
      .upload(path, file, { upsert: true })
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(null)
      return
    }
    const { data: { publicUrl } } = supabase.storage
      .from('converted-files')
      .getPublicUrl(path)
    await supabase
      .from('conversion_requests')
      .update({ file_url: publicUrl })
      .eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, file_url: publicUrl } : o))
    setUploading(null)
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  const total      = orders.length
  const pending    = orders.filter(o => o.status === 'pending').length
  const inProgress = orders.filter(o => o.status === 'in_progress').length
  const complete   = orders.filter(o => o.status === 'complete').length

  if (loading) {
    return (
      <section className="auth-section">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      </section>
    )
  }

  if (!user) return null

  return (
    <section className="dashboard">
      <div className="section-inner">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="dash-email">Signed in as {user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={loadOrders}>Refresh</button>
          </div>
        </div>

        {/* Stats */}
        <div className="cards dash-cards">
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('all')}>
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{total}</p>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('pending')}>
            <p className="stat-label">Pending</p>
            <p className="stat-value">{pending}</p>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('in_progress')}>
            <p className="stat-label">In Progress</p>
            <p className="stat-value">{inProgress}</p>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus('complete')}>
            <p className="stat-label">Completed</p>
            <p className="stat-value">{complete}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray)', marginRight: '0.25rem' }}>Filter:</span>
          {['all', 'pending', 'in_progress', 'complete'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
            >
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Format</th>
                <th>Qty</th>
                <th>Submitted</th>
                <th>Turnaround</th>
                <th>Delivery</th>
                <th>Notes</th>
                <th>Status</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={11}>No orders found.</td>
                </tr>
              ) : filtered.map(o => {
                const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/orders/${o.id}`)}>
                    <td style={{ fontWeight: 500 }}>{o.first_name} {o.last_name}</td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{o.email}</div>
                      {o.phone && <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{o.phone}</div>}
                    </td>
                    <td>{o.tape_type}</td>
                    <td>{o.quantity}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{date}</td>
                    <td style={{ fontSize: '0.875rem' }}>{o.turnaround ?? '—'}</td>
                    <td>{o.delivery === 'dropoff' ? 'Drop-off' : o.delivery === 'mail' ? 'Mail' : '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray)', maxWidth: '180px' }}>
                      {o.notes ? (
                        <span title={o.notes}>
                          {o.notes.length > 60 ? o.notes.slice(0, 60) + '…' : o.notes}
                        </span>
                      ) : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border, #ddd)',
                          background:
                            o.status === 'complete'    ? '#d1fae5' :
                            o.status === 'in_progress' ? '#fef3c7' :
                            '#f1f5f9',
                          cursor: updating === o.id ? 'wait' : 'pointer',
                          minWidth: '110px',
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ minWidth: '180px' }} onClick={e => e.stopPropagation()}>
                      {o.status === 'complete' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {o.file_url && (
                            <a
                              href={o.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: 'var(--black)', textDecoration: 'underline' }}
                            >
                              {uploading === o.id ? 'Replacing…' : 'Uploaded ↗'}
                            </a>
                          )}
                          <label style={{ fontSize: '0.75rem', cursor: 'pointer', color: 'var(--gray)' }}>
                            {uploading === o.id
                              ? 'Uploading…'
                              : o.file_url ? 'Replace file' : 'Upload file'}
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              disabled={uploading === o.id}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(o.id, file)
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(o.id) }}
                        disabled={deleting === o.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: deleting === o.id ? 'wait' : 'pointer',
                          color: '#ef4444',
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.4rem',
                          opacity: deleting === o.id ? 0.5 : 1,
                        }}
                      >
                        {deleting === o.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
