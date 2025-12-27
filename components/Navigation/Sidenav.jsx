'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PaintBrushIcon, SwatchIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useContrastColors } from '@/hooks/useContrastColors';
import { useModel } from '@/contexts/ModelContext';
import { useState, useRef, useEffect } from 'react';

export default function Sidenav({ isCollapsed }) {
  const pathname = usePathname();
  const { textColor, activeColor } = useContrastColors('--color-sidemenu');
  const { selectedModel, setSelectedModel, availableModels } = useModel();
  const [showModelMenu, setShowModelMenu] = useState(false);
  const modelMenuRef = useRef(null);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelMenu(false);
      }
    };

    if (showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelMenu]);

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

        {/* Model selector - pinned to bottom */}
        {!isCollapsed && (
          <div className="pt-4 border-t" style={{ borderColor: activeColor }} ref={modelMenuRef}>
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="w-full flex items-center justify-between gap-2 p-2 rounded-lg transition-colors text-sm"
                style={{
                  color: textColor,
                  backgroundColor: showModelMenu ? activeColor : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!showModelMenu) e.currentTarget.style.backgroundColor = activeColor;
                }}
                onMouseLeave={(e) => {
                  if (!showModelMenu) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{selectedModel.name}</span>
                  {selectedModel.supportsFunctionCalling && (
                    <span
                      className="shrink-0 px-1 py-0.5 text-[10px] rounded"
                      style={{
                        backgroundColor: `${textColor}15`,
                        color: textColor
                      }}
                    >
                      fn
                    </span>
                  )}
                </div>
                <ChevronUpDownIcon className="w-4 h-4 shrink-0" style={{ color: textColor }} />
              </button>

              {showModelMenu && (
                <div
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-lg shadow-lg overflow-hidden border"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-tertiary)'
                  }}
                >
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between hover:bg-tertiary ${
                        model.id === selectedModel.id ? 'bg-tertiary' : ''
                      }`}
                    >
                      <div>
                        <div className="text-body">{model.name}</div>
                        {model.description && (
                          <div className="text-xs text-label">{model.description}</div>
                        )}
                      </div>
                      {model.supportsFunctionCalling && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-accent/10 text-accent rounded ml-2">fn</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}
