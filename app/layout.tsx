"use client";

import "./globals.css";
import { useState } from "react";
import { guestRoutes } from './routes'
import { usePathname } from 'next/navigation';
import { useWindowWidth } from '../hooks/useWindowWidth';
import Sidenav from '@/components/Navigation/Sidenav';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { DialogProvider } from "@/contexts/DialogContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SidebarToggle from "@/components/Navigation/SidebarToggle";
import { themePropertyMap } from "@/utils/theme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useWindowWidth();

  const isGuestRoute = guestRoutes.includes(pathname);

  return (
    <html lang="en">
      <head>
        {/* Inline script to prevent theme flicker - loads theme before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = JSON.parse(localStorage.getItem('app-theme') || '{}');
                  var root = document.documentElement;

                  // CSS variable mapping (generated from theme.ts)
                  var map = ${JSON.stringify(themePropertyMap)};

                  // Apply colors
                  if (theme.colors) {
                    for (var key in theme.colors) {
                      var cssVar = map['colors.' + key];
                      if (cssVar && theme.colors[key]) {
                        root.style.setProperty(cssVar, theme.colors[key]);
                      }
                    }
                  }

                  // Apply border radius
                  if (theme.borderRadius) {
                    for (var key in theme.borderRadius) {
                      var cssVar = map['borderRadius.' + key];
                      if (cssVar && theme.borderRadius[key]) {
                        root.style.setProperty(cssVar, theme.borderRadius[key]);
                      }
                    }
                  }

                  // Apply shadows
                  if (theme.shadows) {
                    for (var key in theme.shadows) {
                      var cssVar = map['shadows.' + key];
                      if (cssVar && theme.shadows[key]) {
                        root.style.setProperty(cssVar, theme.shadows[key]);
                      }
                    }
                  }
                } catch (e) {
                  // Fail silently - default theme will be used
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased`}>
        <ThemeProvider autoLoad={true}>
          <OrganizationProvider>
            <DialogProvider>
              <div className="flex gap-2 min-h-screen max-w-screen bg-primary">
                {/* Side Menu */}
                {!isGuestRoute && <Sidenav
                  isCollapsed={isCollapsed}
                />}

                {/* Main Content */}
                <main className={`
                  flex flex-col flex-1 transition-all duration-300 my-4 mr-4
                  bg-secondary border border-tertiary rounded-lg
                  h-[calc(100vh-2rem)] overflow-hidden
                  ${isCollapsed && isMobile ? 'blur-sm' : ''}
                  ${isGuestRoute ? 'ml-4' : ''}
                  ${!isGuestRoute && !isCollapsed ? 'ml-[288px]' : 'ml-4'}
                `}>
                  {/* Sticky header with toggle button */}
                  <div className="sticky top-0 z-10 p-2 border-b border-tertiary bg-secondary">
                    <div popoverTarget="sidebar">
                      <SidebarToggle
                        isOpen={!isCollapsed}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                      />
                    </div>
                  </div>

                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {children}
                  </div>
                </main>
              </div>
            </DialogProvider>
          </OrganizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
