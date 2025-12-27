'use client'

import { useEffect, useState } from 'react';
import { isLightColor } from '@/utils/theme';

interface ContrastColors {
  textColor: string;
  activeColor: string;
}

/**
 * Hook that returns contrast-aware text and active colors for a given CSS variable
 * Automatically updates when the CSS variable changes (e.g., theme updates)
 *
 * @param cssVar - CSS variable name (e.g., '--color-sidemenu')
 * @returns Object with textColor and activeColor based on background luminance
 */
export function useContrastColors(cssVar: string): ContrastColors {
  const [colors, setColors] = useState<ContrastColors>({
    textColor: 'inherit',
    activeColor: 'rgba(0,0,0,0.1)',
  });

  useEffect(() => {
    const updateColors = () => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();

      if (bg) {
        const isLight = isLightColor(bg);
        setColors({
          textColor: isLight ? '#000000' : '#ffffff',
          activeColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        });
      }
    };

    updateColors();

    // Watch for theme changes on the root element
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [cssVar]);

  return colors;
}
