'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PaintBrushIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { useContrastColors } from '@/hooks/useContrastColors';

export default function Sidenav({ isCollapsed }) {
  const pathname = usePathname();
  const { textColor, activeColor } = useContrastColors('--color-sidemenu');

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
        border-primary shadow-primary rounded-lg
        w-64
        ${isCollapsed ? 'sidebar-hidden' : 'sidebar-visible'}
      `}
      style={{ backgroundColor: 'var(--color-sidemenu, var(--color-secondary))' }}
    >
      {/* Menu content */}
      <nav className="h-full flex flex-col">
        <div className="flex-1">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                style={{
                  color: textColor,
                  backgroundColor: pathname === item.path ? activeColor : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = activeColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.path) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
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
