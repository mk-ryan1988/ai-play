"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import { HomeIcon, RocketLaunchIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid';
import { guestRoutes } from './routes'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useWindowWidth();
  const router = useRouter();

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

  const isGuestRoute = guestRoutes.includes(pathname)

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex gap-2 min-h-screen max-w-screen bg-primary">
          {/* Side Menu */}
          {!isGuestRoute && <div
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
                {!isCollapsed ? (
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
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col items-center text-gray-400">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`
                          p-2 rounded-lg transition-colors
                          hover:text-title hover:bg-tertiary
                          ${pathname === item.path ? 'text-title bg-tertiary' : 'text-label'}
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                      </Link>
                    ))}
                  </div>
                )}
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
          </div>}

          {/* Main Content */}
          <main className={`
            flex-1 transition-all duration-300 my-4 mr-4
            bg-secondary border border-tertiary rounded-lg p-4
            ${isCollapsed && isMobile ? 'blur-sm' : ''}
            ${isGuestRoute ? 'ml-4' : ''}
          `}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
