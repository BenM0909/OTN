import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <Image
        src="/logo.png"
        alt="OTN Conversions"
        width={120}
        height={60}
        style={{ objectFit: 'contain', height: '48px', width: 'auto' }}
      />
      <p>&copy; 2026 OTN Conversions. All rights reserved.</p>
      <nav className="footer-links">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/schedule">Schedule</Link>
        <Link href="/account">Account</Link>
      </nav>
    </footer>
  )
}
