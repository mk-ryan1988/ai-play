"use client";

import "./globals.css";
import { useState } from "react";
import { guestRoutes } from './routes'
import { usePathname } from 'next/navigation';
import { useWindowWidth } from '../hooks/useWindowWidth';
import Sidenav from '@/components/Navigation/Sidenav';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { DialogProvider } from "@/contexts/DialogContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useWindowWidth();

  const isGuestRoute = guestRoutes.includes(pathname)

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <OrganizationProvider>
          <DialogProvider>
            <div className="flex gap-2 min-h-screen max-w-screen bg-primary">
              {/* Side Menu */}
              {!isGuestRoute && <Sidenav
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />}

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
          </DialogProvider>
        </OrganizationProvider>
      </body>
    </html>
  );
}
