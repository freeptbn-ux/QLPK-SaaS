'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  HiOutlineBars3, 
  HiOutlineMoon, 
  HiOutlineSun, 
  HiOutlineArrowRightOnRectangle 
} from 'react-icons/hi2'
import { useThemeContext } from '@/theme/ThemeContext'
import { logoutAction } from '@/actions/auth'
import { useSettings } from '@/contexts/SettingsContext'

interface TopBarProps {
  onMenuClick?: () => void
  title?: string
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const { mode, toggleTheme, mounted } = useThemeContext()
  const { clinic_name } = useSettings()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayTitle = title || clinic_name || 'Phòng khám'

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logoutAction()
  }

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm h-16 flex items-center px-4">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors"
          aria-label="Open menu"
        >
          <HiOutlineBars3 className="w-6 h-6 text-foreground" />
        </button>
        
        <h1 className="text-lg font-bold text-foreground truncate">
          {displayTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={mounted ? `Switch to ${mode === 'light' ? 'dark' : 'light'} mode` : 'Loading...'}
        >
          {mounted && (
            mode === 'dark' ? (
              <HiOutlineSun className="w-5 h-5 text-slate-600 dark:text-amber-400" />
            ) : (
              <HiOutlineMoon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )
          )}
          {!mounted && <div className="w-5 h-5" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-divider rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
