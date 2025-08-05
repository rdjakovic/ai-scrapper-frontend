import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../providers/ToastProvider'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          {children}
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockJob = (overrides = {}) => ({
  job_id: '1',
  url: 'https://example.com',
  status: 'completed' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:05:00Z',
  result: {
    title: 'Example Page',
    content: 'Sample content',
  },
  ...overrides,
})

export const createMockPendingJob = (overrides = {}) => ({
  job_id: '2',
  url: 'https://test.com',
  status: 'pending' as const,
  created_at: '2024-01-01T00:10:00Z',
  updated_at: '2024-01-01T00:10:00Z',
  result: null,
  ...overrides,
})

export const createMockFailedJob = (overrides = {}) => ({
  job_id: '3',
  url: 'https://failed.com',
  status: 'failed' as const,
  created_at: '2024-01-01T00:15:00Z',
  updated_at: '2024-01-01T00:20:00Z',
  result: null,
  error_message: 'Failed to scrape URL',
  ...overrides,
})