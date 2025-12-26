'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PaintBrushIcon, SwatchIcon } from '@heroicons/react/24/solid';

export default function Sidenav({ isCollapsed }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Theme', path: '/theme', icon: SwatchIcon },
    { name: 'Design', path: '/design', icon: PaintBrushIcon },
  ];

  return (
    <div
      className={`
        fixed left-0 top-0 h-[calc(100vh-2rem)] mt-4 ml-4 z-10
        transition-all duration-300 ease-in-out p-4
        bg-secondary border border-tertiary rounded-lg
        w-64
        ${isCollapsed ? 'sidebar-hidden' : 'sidebar-visible'}
      `}
    >
      {/* Menu content */}
      <nav className="h-full flex flex-col">
        <div className="flex-1">
          <div className="space-y-4 text-gray-300">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-colors
                  hover:text-title hover:bg-tertiary
                  ${pathname === item.path ? 'text-title bg-tertiary' : 'text-label'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
