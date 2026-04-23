'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HiOutlineUsers, 
  HiOutlineBeaker, 
  HiOutlineChartBar, 
  HiOutlineCalculator, 
  HiOutlineCog6Tooth,
  HiUsers,
  HiBeaker,
  HiChartBar,
  HiCalculator,
  HiCog6Tooth
} from 'react-icons/hi2'

export default function MobileNav() {
  const pathname = usePathname()

  const navItems = [
    { 
      text: 'Bệnh nhân', 
      icon: <HiOutlineUsers className="w-6 h-6" />, 
      activeIcon: <HiUsers className="w-6 h-6" />, 
      path: '/patients' 
    },
    { 
      text: 'Kho thuốc', 
      icon: <HiOutlineBeaker className="w-6 h-6" />, 
      activeIcon: <HiBeaker className="w-6 h-6" />, 
      path: '/medicines' 
    },
    { 
      text: 'Tính liều', 
      icon: <HiOutlineCalculator className="w-6 h-6" />, 
      activeIcon: <HiCalculator className="w-6 h-6" />, 
      path: '/dose-calculator' 
    },
    { 
      text: 'Thống kê', 
      icon: <HiOutlineChartBar className="w-6 h-6" />, 
      activeIcon: <HiChartBar className="w-6 h-6" />, 
      path: '/statistics' 
    },
    { 
      text: 'Cài đặt', 
      icon: <HiOutlineCog6Tooth className="w-6 h-6" />, 
      activeIcon: <HiCog6Tooth className="w-6 h-6" />, 
      path: '/settings' 
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface dark:bg-surface-dark border-t border-divider shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="text-[10px] font-medium truncate w-full text-center px-1">
                {item.text}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
