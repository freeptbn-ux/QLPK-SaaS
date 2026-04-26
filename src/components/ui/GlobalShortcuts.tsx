'use client';

import { useEffect } from 'react';

export default function GlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+F or Cmd+F
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        const searchInput = document.querySelector('input[name="search"]') as HTMLInputElement | null;
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
