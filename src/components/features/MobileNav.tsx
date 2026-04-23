'use client'

import React from 'react'
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import PeopleIcon from '@mui/icons-material/People'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import BarChartIcon from '@mui/icons-material/BarChart'
import CalculateIcon from '@mui/icons-material/Calculate'
import SettingsIcon from '@mui/icons-material/Settings'

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { text: 'Bệnh nhân', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Kho thuốc', icon: <LocalPharmacyIcon />, path: '/medicines' },
    { text: 'Tính liều', icon: <CalculateIcon />, path: '/dose-calculator' },
    { text: 'Thống kê', icon: <BarChartIcon />, path: '/statistics' },
    { text: 'Cài đặt', icon: <SettingsIcon />, path: '/settings' },
  ]

  // Find the current active index
  const activeIndex = navItems.findIndex(item => pathname.startsWith(item.path))

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeIndex !== -1 ? activeIndex : 0}
        onChange={(event, newValue) => {
          router.push(navItems[newValue].path)
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.text}
            label={item.text}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
