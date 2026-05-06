import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TopBar from './TopBar'
import { useThemeContext } from '@/theme/ThemeContext'
import { useSettings } from '@/contexts/SettingsContext'

// Mock the contexts
vi.mock('@/theme/ThemeContext', () => ({
  useThemeContext: vi.fn(),
}))

vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}))

vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}))

describe('TopBar', () => {
  it('renders correctly in light mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({ mode: 'light', toggleTheme: vi.fn(), mounted: true })
    vi.mocked(useSettings).mockReturnValue({ clinic_name: 'Test Clinic', settings: { clinic_name: 'Test Clinic' } })

    render(<TopBar />)
    
    // In light mode, Moon icon should be present and have correct classes
    const moonIcon = document.querySelector('svg.text-slate-600')
    expect(moonIcon).toBeTruthy()
    expect(moonIcon?.classList.contains('dark:text-slate-300')).toBe(true)
  })

  it('renders correctly in dark mode', () => {
    vi.mocked(useThemeContext).mockReturnValue({ mode: 'dark', toggleTheme: vi.fn(), mounted: true })
    vi.mocked(useSettings).mockReturnValue({ clinic_name: 'Test Clinic', settings: { clinic_name: 'Test Clinic' } })

    render(<TopBar />)
    
    // In dark mode, Sun icon should be present and have correct classes
    const sunIcon = document.querySelector('svg.text-slate-600')
    expect(sunIcon).toBeTruthy()
    expect(sunIcon?.classList.contains('dark:text-amber-400')).toBe(true)
  })
})
