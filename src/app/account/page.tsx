'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, type ConversionRequest } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type View = 'loading' | 'auth' | 'dashboard'
type Tab = 'login' | 'signup'

export default function Account() {
  const router = useRouter()
  const [view, setView] = useState<View>('loading')
  const [tab, setTab] = useState<Tab>('login')
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<ConversionRequest[]>([])
  const [authError, setAuthError] = useState('')
  const [authInfo, setAuthInfo] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setView('dashboard')
        loadOrders(session.user.id)
      } else {
        setView('auth')
      }
    })
  }, [])

  async function loadOrders(userId: string) {
    const { data } = await supabase
      .from('conversion_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginLoading(true)
    setAuthError('')
    setAuthInfo('')
    const fd = new FormData(e.currentTarget)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })
    setLoginLoading(false)
    if (error) { setAuthError(error.message); return }
    setUser(data.user)
    setView('dashboard')
    loadOrders(data.user.id)
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSignupLoading(true)
    setAuthError('')
    setAuthInfo('')
    const fd = new FormData(e.currentTarget)
    const { data, error } = await supabase.auth.signUp({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      options: { data: { first_name: fd.get('firstName'), last_name: fd.get('lastName') } },
    })
    setSignupLoading(false)
    if (error) { setAuthError(error.message); return }
    if (data.session) {
      setUser(data.user!)
      setView('dashboard')
      loadOrders(data.user!.id)
    } else {
      setAuthInfo('Account created! Check your email to confirm, then sign in.')
      setTab('login')
    }
  }

  async function handleDelete(orderId: string) {
    if (!confirm('Delete this order? This cannot be undone.')) return
    setDeleting(orderId)
    await supabase.from('conversion_requests').delete().eq('id', orderId)
    setOrders(prev => prev.filter(o => o.id !== orderId))
    setDeleting(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setOrders([])
    setAuthError('')
    setAuthInfo('')
    setTab('login')
    setView('auth')
  }

  const name = user?.user_metadata?.first_name ?? user?.email?.split('@')[0] ?? ''
  const total    = orders.length
  const progress = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length
  const done     = orders.filter(o => o.status === 'complete').length

  if (view === 'loading') {
    return (
      <section className="auth-section">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      </section>
    )
  }

  if (view === 'auth') {
    return (
      <section className="auth-section">
        <div className="auth-card">
          <Image src="/logo.png" alt="OTN Conversions" width={160} height={80} className="auth-logo" style={{ objectFit: 'contain' }} />

          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setAuthError(''); setAuthInfo('') }}>
              Sign In
            </button>
            <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setAuthError(''); setAuthInfo('') }}>
              Create Account
            </button>
          </div>

          {authError && <div className="auth-error" style={{ display: 'block' }}>{authError}</div>}
          {authInfo  && <div className="auth-success" style={{ display: 'block' }}>{authInfo}</div>}

          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input type="email" id="loginEmail" name="email" placeholder="jane@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input type="password" id="loginPassword" name="password" placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="auth-note"><a href="#">Forgot your password?</a></p>
            </form>
          )}

          {tab === 'signup' && (
            <form className="auth-form" onSubmit={handleSignup}>
              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="signupFirst">First Name</label>
                  <input type="text" id="signupFirst" name="firstName" placeholder="Jane" required />
                </div>
                <div className="form-group">
                  <label htmlFor="signupLast">Last Name</label>
                  <input type="text" id="signupLast" name="lastName" placeholder="Smith" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="signupEmail">Email</label>
                <input type="email" id="signupEmail" name="email" placeholder="jane@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <input type="password" id="signupPassword" name="password" placeholder="At least 8 characters" minLength={8} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={signupLoading}>
                {signupLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard">
      <div className="section-inner">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {name}!</h1>
            <p className="dash-email">{user?.email}</p>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
        </div>

        <div className="cards dash-cards">
          <div className="card">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{total}</p>
          </div>
          <div className="card">
            <p className="stat-label">In Progress</p>
            <p className="stat-value">{progress}</p>
          </div>
          <div className="card">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{done}</p>
          </div>
        </div>

        <h2 className="section-title" style={{ textAlign: 'left', marginTop: '2.5rem' }}>Your Orders</h2>
        <div className="order-table-wrap">
          <table className="order-table">
            <thead>
              <tr>
                <th>Format</th>
                <th>Tapes</th>
                <th>Submitted</th>
                <th>Turnaround</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Download</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={8}>
                    No orders yet.{' '}
                    <Link href="/schedule" style={{ color: 'var(--black)', textDecoration: 'underline' }}>
                      Schedule one.
                    </Link>
                  </td>
                </tr>
              ) : orders.map(o => {
                const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                const statusClass = o.status === 'complete' ? 'badge-done' : 'badge-progress'
                const statusLabel = o.status === 'complete' ? 'Complete' : o.status === 'in_progress' ? 'In Progress' : 'Pending'
                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/orders/${o.id}`)}>
                    <td>{o.tape_type}</td>
                    <td>{o.quantity}</td>
                    <td>{date}</td>
                    <td>{o.turnaround ?? '—'}</td>
                    <td>{o.delivery === 'dropoff' ? 'Drop-off' : 'Mail'}</td>
                    <td><span className={`badge ${statusClass}`}>{statusLabel}</span></td>
                    <td>
                      {o.file_url ? (
                        <a
                          href={o.file_url}
                          download
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        >
                          Download
                        </a>
                      ) : '—'}
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

        <div style={{ marginTop: '2rem' }}>
          <Link href="/schedule" className="btn btn-primary">+ New Conversion</Link>
        </div>
      </div>
    </section>
  )
}
