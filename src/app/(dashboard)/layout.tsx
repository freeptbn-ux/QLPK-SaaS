'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/features/Sidebar'
import TopBar from '@/components/features/TopBar'
import MobileNav from '@/components/features/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-background-dark">
      {/* Top App Bar */}
      <TopBar onMenuClick={handleDrawerToggle} />

      {/* Sidebar Navigation */}
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 md:ml-60 pt-20 mb-16 md:mb-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </div>
  )
}
