'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const tapeFormats = ['VHS', 'VHS-C', 'Betamax', 'Hi8 / 8mm', 'MiniDV', 'Super 8', 'Film Reel', 'Audio Cassette', 'Other']
const outputFormats = ['MP4 (recommended)', 'MOV', 'AVI', 'USB Drive (+$15)', 'DVD (+$10 per disc)']

export default function Schedule() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const fd = new FormData(form)
    const delivery = (form.querySelector('input[name="delivery"]:checked') as HTMLInputElement)?.value

    const { data: { session } } = await supabase.auth.getSession()

    const payload = {
      first_name:    (fd.get('firstName') as string).trim(),
      last_name:     (fd.get('lastName') as string).trim(),
      email:         (fd.get('email') as string).trim(),
      phone:         (fd.get('phone') as string)?.trim() || null,
      tape_type:     fd.get('tapeType') as string,
      quantity:      parseInt(fd.get('quantity') as string, 10),
      output_format: (fd.get('outputFormat') as string) || null,
      turnaround:    fd.get('rush') as string,
      delivery,
      notes:         (fd.get('notes') as string)?.trim() || null,
      user_id:       session?.user.id ?? null,
    }

    const { error } = await supabase.from('conversion_requests').insert(payload)

    setLoading(false)

    if (error) {
      alert('Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="form-section">
        <div className="section-inner form-inner">
          <div className="success-msg" style={{ display: 'flex' }}>
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Request Received!</h2>
            <p>Thanks for reaching out. We&apos;ll confirm your conversion order via email within one business day.</p>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="section-inner">
          <p className="hero-eyebrow">Let&apos;s Get Started</p>
          <h1>Schedule a Conversion</h1>
          <p className="hero-sub">Fill out the form below and we&apos;ll reach out within one business day to confirm your order.</p>
        </div>
      </section>

      <section className="form-section">
        <div className="section-inner form-inner">
          <form className="conversion-form" onSubmit={handleSubmit}>

            <fieldset>
              <legend>Your Information</legend>
              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name="firstName" placeholder="Jane" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" placeholder="Smith" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="jane@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="(555) 000-0000" />
              </div>
            </fieldset>

            <fieldset>
              <legend>Tape Details</legend>
              <div className="form-group">
                <label htmlFor="tapeType">Tape Format</label>
                <select id="tapeType" name="tapeType" required defaultValue="">
                  <option value="" disabled>Select a format…</option>
                  {tapeFormats.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Number of Tapes</label>
                <input type="number" id="quantity" name="quantity" min="1" max="200" placeholder="e.g. 5" required />
              </div>
              <div className="form-group">
                <label htmlFor="outputFormat">Preferred Output Format</label>
                <select id="outputFormat" name="outputFormat" defaultValue="">
                  <option value="" disabled>Select an output format…</option>
                  {outputFormats.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="rush">Turnaround</label>
                <select id="rush" name="rush">
                  <option>Standard (5–7 business days)</option>
                  <option>Rush (2–3 business days, +$25)</option>
                </select>
              </div>
            </fieldset>

            <fieldset>
              <legend>Delivery</legend>
              <div className="form-group">
                <label>How will you send your tapes?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="delivery" value="mail" defaultChecked /> Mail them to OTN
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="delivery" value="dropoff" /> Local drop-off
                  </label>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Additional Notes</legend>
              <div className="form-group">
                <label htmlFor="notes">Anything else we should know?</label>
                <textarea id="notes" name="notes" rows={4} placeholder="Special instructions, tape condition, labels, etc." />
              </div>
            </fieldset>

            <div className="form-footer">
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
              <p className="form-note">We&apos;ll confirm your order via email within one business day.</p>
            </div>

          </form>
        </div>
      </section>
    </>
  )
}
