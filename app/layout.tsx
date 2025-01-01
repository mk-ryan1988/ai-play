"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', path: '/', icon: '📝' },
    { name: 'Releases', path: '/releases', icon: '📊' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex gap-2 min-h-screen max-w-screen bg-background">
          {/* Side Menu */}
          <div
            className={`
              relative h-[calc(100vh-2rem)] m-4 transition-all duration-300 ease-in-out p-4
              ${isCollapsed ? 'w-16' : 'w-64'}
            `}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                absolute right-2 top-2 p-2 rounded hover:bg-dark-tertiary text-gray-400 hover:text-text-dark
                ${isCollapsed ? 'left-2' : 'right-2'}
              `}
            >
              {isCollapsed ? '→' : '←'}
            </button>

            {/* Menu content */}
            <nav className="mt-8">
              {!isCollapsed ? (
                <div className="space-y-4 text-gray-300">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`
                        flex items-center gap-3 p-2 rounded-lg transition-colors
                        hover:text-text-dark hover:bg-dark-tertiary
                        ${pathname === item.path ? 'text-text-dark bg-dark-tertiary' : ''}
                      `}
                    >
                      <span>{item.icon}</span>
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
                        hover:text-text-dark hover:bg-dark-tertiary
                        ${pathname === item.path ? 'text-text-dark bg-dark-tertiary' : ''}
                      `}
                    >
                      {item.icon}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <main className={`
            flex-1 transition-all duration-300 my-4 mr-4
            bg-dark-secondary border border-dark-tertiary rounded-lg p-4
            ${!isCollapsed && window?.innerWidth < 768 ? 'blur-sm' : ''}
          `}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
