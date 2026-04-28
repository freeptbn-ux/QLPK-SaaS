import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardShell from '../DashboardShell'

// Mock components to simplify testing
vi.mock('@/components/features/Sidebar', () => ({
  default: ({ open, onClose }: { open: boolean, onClose: () => void }) => (
    <div data-testid="sidebar">
      Sidebar is {open ? 'open' : 'closed'}
      <button onClick={onClose} data-testid="close-button">Close</button>
    </div>
  )
}))

vi.mock('@/components/features/TopBar', () => ({
  default: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div data-testid="topbar">
      <button onClick={onMenuClick} data-testid="menu-button">Menu</button>
    </div>
  )
}))

vi.mock('@/components/features/MobileNav', () => ({
  default: () => <div data-testid="mobilenav">MobileNav</div>
}))

describe('DashboardShell', () => {
  it('toggles mobile sidebar open and closed', () => {
    render(<DashboardShell>Content</DashboardShell>)
    
    const sidebar = screen.getByTestId('sidebar')
    const menuButton = screen.getByTestId('menu-button')
    const closeButton = screen.getByTestId('close-button')

    expect(sidebar.textContent).toContain('Sidebar is closed')

    // Open
    fireEvent.click(menuButton)
    expect(sidebar.textContent).toContain('Sidebar is open')

    // Close
    fireEvent.click(closeButton)
    expect(sidebar.textContent).toContain('Sidebar is closed')
  })

  it('renders children correctly', () => {
    render(
      <DashboardShell>
        <div data-testid="test-child">Child Content</div>
      </DashboardShell>
    )
    expect(screen.getByTestId('test-child')).toBeTruthy()
    expect(screen.getByText('Child Content')).toBeTruthy()
  })
})
