import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJobs } from '../useJobs'
import * as jobService from '../../services/jobService'

// Mock the job service
vi.mock('../../services/jobService')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches jobs successfully', async () => {
    const mockJobs = [
      { id: '1', url: 'https://example.com', status: 'completed' },
      { id: '2', url: 'https://test.com', status: 'pending' }
    ]

    ;(jobService.getJobs as any).mockResolvedValue({ jobs: mockJobs, total: 2 })

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.jobs).toEqual(mockJobs)
    expect(result.current.data?.total).toBe(2)
  })

  it('handles loading state', () => {
    ;(jobService.getJobs as any).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('handles error state', async () => {
    const mockError = new Error('Failed to fetch jobs')
    ;(jobService.getJobs as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('supports pagination', async () => {
    const mockJobs = [{ id: '1', url: 'https://example.com', status: 'completed' }]
    ;(jobService.getJobs as any).mockResolvedValue({ jobs: mockJobs, total: 10 })

    const { result } = renderHook(() => useJobs({ page: 2, limit: 5 }), { 
      wrapper: createWrapper() 
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(jobService.getJobs).toHaveBeenCalledWith({ page: 2, limit: 5 })
  })

  it('supports filtering by status', async () => {
    const mockJobs = [{ id: '1', url: 'https://example.com', status: 'completed' }]
    ;(jobService.getJobs as any).mockResolvedValue({ jobs: mockJobs, total: 1 })

    const { result } = renderHook(() => useJobs({ status: 'completed' }), { 
      wrapper: createWrapper() 
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(jobService.getJobs).toHaveBeenCalledWith({ status: 'completed' })
  })

  it('refetches data when enabled', async () => {
    const mockJobs = [{ id: '1', url: 'https://example.com', status: 'pending' }]
    ;(jobService.getJobs as any).mockResolvedValue({ jobs: mockJobs, total: 1 })

    const { result } = renderHook(() => useJobs({ refetchInterval: 1000 }), { 
      wrapper: createWrapper() 
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should call getJobs multiple times due to refetch interval
    await waitFor(() => {
      expect(jobService.getJobs).toHaveBeenCalledTimes(1)
    }, { timeout: 2000 })
  })

  it('provides helper functions', async () => {
    const mockJobs = [
      { id: '1', url: 'https://example.com', status: 'completed' },
      { id: '2', url: 'https://test.com', status: 'pending' },
      { id: '3', url: 'https://failed.com', status: 'failed' }
    ]

    ;(jobService.getJobs as any).mockResolvedValue({ jobs: mockJobs, total: 3 })

    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.completedJobs).toHaveLength(1)
    expect(result.current.pendingJobs).toHaveLength(1)
    expect(result.current.failedJobs).toHaveLength(1)
  })
})