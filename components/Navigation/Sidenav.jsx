'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../LogoutButton'
import { HomeIcon, RocketLaunchIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid';

export default function Sidenav({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.refresh();
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Releases', path: '/releases', icon: RocketLaunchIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  const menuWidth = () => {
    if (isCollapsed) {
      return 'w-16';
    } else {
      return 'w-64';
    }
  };

  return (
    <div
      className={`
        relative h-[calc(100vh-3rem)] m-4 transition-all duration-300 ease-in-out p-4
        ${menuWidth()}
      `}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          absolute right-2 top-2 p-2 rounded hover:bg-tertiary text-label hover:text-title
          ${isCollapsed ? 'left-2' : 'right-2'}
        `}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Menu content */}
      <nav className="mt-8 h-full flex flex-col">

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

        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 p-2 rounded-lg transition-colors text-label
            hover:text-title hover:bg-tertiary
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </nav>
    </div>
  )
}
