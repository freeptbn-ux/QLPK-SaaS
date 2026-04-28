'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { 
  HiOutlineUsers, 
  HiOutlineBeaker, 
  HiOutlineChartBar, 
  HiOutlineCalculator, 
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark
} from 'react-icons/hi2'
import { logoutAction } from '@/actions/auth'
import Link from 'next/link'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { text: 'Bệnh nhân', icon: <HiOutlineUsers className="w-5 h-5" />, path: '/patients' },
    { text: 'Kho thuốc', icon: <HiOutlineBeaker className="w-5 h-5" />, path: '/medicines' },
    { text: 'Tính liều', icon: <HiOutlineCalculator className="w-5 h-5" />, path: '/dose-calculator' },
    { text: 'Thống kê', icon: <HiOutlineChartBar className="w-5 h-5" />, path: '/statistics' },
    { text: 'Cài đặt', icon: <HiOutlineCog6Tooth className="w-5 h-5" />, path: '/settings' },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Mobile Header */}
      <div className="h-16 flex items-center px-6 border-b border-divider md:hidden">
        <span className="font-bold text-lg text-foreground">QLPK SaaS</span>
        <button 
          onClick={onClose}
          className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onClose()}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                  : 'text-foreground-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-primary-600 group-hover:text-primary-700 dark:text-primary-400'}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.text}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-divider">
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-3 w-full px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors group"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          <span className="font-medium text-sm">Đăng xuất</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile Drawer */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-72 z-[70] transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 z-40 pt-16">
        {SidebarContent}
      </aside>
    </>
  )
}
