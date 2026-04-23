'use client'

import React, { useState } from 'react'
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material'
import Sidebar from '@/components/features/Sidebar'
import TopBar from '@/components/features/TopBar'
import MobileNav from '@/components/features/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <TopBar onMenuClick={handleDrawerToggle} />

      {/* Sidebar Navigation */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mb: { xs: 7, md: 0 }, // Space for bottom nav on mobile
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>

      {/* Bottom Navigation for Mobile */}
      <MobileNav />
    </Box>
  )
}
