import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About — OTN Conversions' }

const formats = ['VHS', 'VHS-C', 'Betamax', 'Hi8 / 8mm', 'MiniDV', 'Super 8', 'Film Reels', 'Audio Cassette']

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="section-inner">
          <p className="hero-eyebrow">Our Story</p>
          <h1>About OTN Conversions</h1>
          <p className="hero-sub">We believe every memory is worth preserving. That belief is at the heart of everything we do.</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="section-inner two-col">
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>
              OTN Conversions was founded with one goal: to make sure no memory is lost to a failing tape.
              VHS tapes degrade over time — and once they&apos;re gone, they&apos;re gone. We exist to change that.
            </p>
            <p>
              We combine professional-grade digitization equipment with careful, hands-on handling to produce
              digital files that look as good as the day they were recorded. Every conversion is done in-house,
              by people who care.
            </p>
          </div>
          <div className="about-logo-wrap">
            <Image src="/logo.png" alt="OTN Conversions" width={300} height={300} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </section>

      <section className="values">
        <div className="section-inner">
          <h2 className="section-title">What We Stand For</h2>
          <div className="cards">
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3>Care</h3>
              <p>We treat every tape like it&apos;s irreplaceable — because it is. Your memories are handled with the same care we&apos;d give our own.</p>
            </div>
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Quality</h3>
              <p>We never cut corners. Every conversion goes through a quality check before delivery, every time.</p>
            </div>
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Trust</h3>
              <p>Your originals are returned. Your files are delivered securely. No surprises, no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="formats">
        <div className="section-inner">
          <h2 className="section-title">Formats We Convert</h2>
          <div className="format-grid">
            {formats.map(f => <div key={f} className="format-item">{f}</div>)}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Let&apos;s preserve your memories together.</h2>
        <Link href="/schedule" className="btn btn-white btn-lg">Schedule a Conversion</Link>
      </section>
    </>
  )
}
