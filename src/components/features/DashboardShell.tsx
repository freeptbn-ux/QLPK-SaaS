'use client'

import React, { useState, useCallback } from 'react'
import Sidebar from '@/components/features/Sidebar'
import TopBar from '@/components/features/TopBar'
import MobileNav from '@/components/features/MobileNav'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev)
  }, [])

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <TopBar onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerClose} />
      <main className="flex-1 px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-24 md:ml-60 mb-16 md:mb-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
