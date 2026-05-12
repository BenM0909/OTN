'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = ['benjaminbellomartin@gmail.com', 'sohmgmandhare@gmail.com']

const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/account', label: 'Account' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(ADMIN_EMAILS.includes(session?.user?.email ?? ''))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAdmin(ADMIN_EMAILS.includes(session?.user?.email ?? ''))
    })
    return () => subscription.unsubscribe()
  }, [])

  const links = isAdmin
    ? [...baseLinks, { href: '/admin', label: 'Admin' }]
    : baseLinks

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="nav-logo">
          <Image
            src="/logo_no_text.png"
            alt="OTN"
            width={63}
            height={44}
            style={{ objectFit: 'contain', height: '44px', width: 'auto' }}
            priority
          />
        </Link>
        <ul className="nav-links">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/schedule" className="btn btn-primary nav-cta">Get Started</Link>
        <button className="hamburger" onClick={() => setOpen(o => !o)}>&#9776;</button>
      </nav>

      {open && (
        <div className="mobile-menu open">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link href="/schedule" className="btn btn-primary" onClick={() => setOpen(false)}>
            Get Started
          </Link>
        </div>
      )}
    </>
  )
}
