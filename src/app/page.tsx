import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">Preserve Your Memories</p>
          <h1>VHS to Digital.<br />Done Right.</h1>
          <p className="hero-sub">
            OTN Conversions transforms your old tapes into high-quality digital files —
            fast, secure, and handled with care.
          </p>
          <div className="hero-actions">
            <Link href="/schedule" className="btn btn-primary btn-lg">Schedule a Conversion</Link>
            <Link href="/about" className="btn btn-outline btn-lg">Learn More</Link>
          </div>
        </div>
        <div className="hero-graphic">
          <Image src="/logo.png" alt="OTN Conversions" width={280} height={280} style={{ objectFit: 'contain' }} priority />
        </div>
      </section>

      <section className="features">
        <div className="section-inner">
          <h2 className="section-title">Why OTN?</h2>
          <div className="cards">
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="m22 8-4 4 4 4M2 8l4 4-4 4"/>
                </svg>
              </div>
              <h3>High-Quality Output</h3>
              <p>Every tape is digitized at the highest possible resolution, preserving every detail of your original recording.</p>
            </div>
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Safe &amp; Secure</h3>
              <p>Your tapes are handled with white-glove care and returned to you along with your digital files.</p>
            </div>
            <div className="card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Fast Turnaround</h3>
              <p>Most conversions are completed within 5–7 business days. Rush options available on request.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-inner">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Schedule</h3>
              <p>Book your conversion online in minutes. Tell us what you have and how many tapes.</p>
            </div>
            <div className="step-arrow">&#8594;</div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Send or Drop Off</h3>
              <p>Mail your tapes to us or drop them off locally. We&apos;ll confirm receipt immediately.</p>
            </div>
            <div className="step-arrow">&#8594;</div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Receive Your Files</h3>
              <p>Get a secure download link and your original tapes back — memories preserved forever.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to preserve your memories?</h2>
        <Link href="/schedule" className="btn btn-white btn-lg">Schedule a Conversion</Link>
      </section>
    </>
  )
}
