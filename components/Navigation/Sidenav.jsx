'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HomeIcon, Cog6ToothIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/solid';
import Card from '../Card';

export default function Sidenav({ isCollapsed, setIsCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();
  const [organisation, setOrganisation] = useState(null);

  const fetchOrganisation = async () => {
    try {
      // fetch the organisation from the api route
      const response = await fetch('/api/organisation');
      const data = await response.json();
      setOrganisation(data.organisation);
    } catch (err) {
      console.error('Error in fetchOrganisation:', err);
    }
  };

  useEffect(() => {
    fetchOrganisation();
  }, []);

  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();

    if (!error) {
      router.refresh();
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
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
      {/* Menu content */}
      <nav className="mt-8 h-full flex flex-col">

        {organisation && (
          <Card className="mb-4 p-2">
            <h1>{organisation.name}</h1>
          </Card>
        )}

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
