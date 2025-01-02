'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default function Sidenav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/releases', label: 'Releases' },
    // Add more nav items as needed
  ]

  return (
    <nav className="w-64 h-screen flex flex-col bg-secondary border-r border-tertiary">
      {/* Top section with nav links */}
      <div className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-tertiary text-title'
                    : 'text-label hover:text-title hover:bg-tertiary'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom section with logout */}
      <div className="p-3 border-t border-dark-tertiary">
        <LogoutButton />
      </div>
    </nav>
  )
}
