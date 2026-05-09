import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MedicineList from './MedicineList'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// Mock the dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@/actions/medicines', () => ({
  deleteMedicine: vi.fn(),
}))

const mockData = [
  {
    id: '1',
    name: 'Paracetamol',
    packing_spec: 'Vỉ 10 viên',
    price: 5000,
    stock_quantity: 100,
    min_stock_level: 20,
    category_id: 'cat1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
]

describe('MedicineList', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ refresh: vi.fn(), push: vi.fn() } as any)
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any)
    vi.mocked(usePathname as any).mockReturnValue('/medicines')
  })

  it('renders table with high contrast borders in dark mode', () => {
    render(<MedicineList initialData={mockData} totalCount={1} currentPage={1} limit={10} />)
    
    // Check thead border class
    const thead = document.querySelector('thead')
    expect(thead).toBeTruthy()
    expect(thead?.className).toContain('dark:border-slate-700')
    
    // Check tbody divide class
    const tbody = document.querySelector('tbody')
    expect(tbody).toBeTruthy()
    expect(tbody?.className).toContain('dark:divide-slate-700')
  })

  it('has responsive classes for search and filters', () => {
    render(<MedicineList initialData={mockData} totalCount={1} currentPage={1} limit={10} />)
    
    const container = document.querySelector('.flex.flex-col.md\\:flex-row')
    expect(container).toBeTruthy()
  })
})
