import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useJob } from '../useJob'
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

describe('useJob', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches job successfully', async () => {
    const mockJob = {
      id: '1',
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      result: { title: 'Example Page' }
    }

    ;(jobService.getJob as any).mockResolvedValue(mockJob)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockJob)
  })

  it('handles loading state', () => {
    ;(jobService.getJob as any).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('handles error state', async () => {
    const mockError = new Error('Job not found')
    ;(jobService.getJob as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('does not fetch when jobId is not provided', () => {
    const { result } = renderHook(() => useJob(''), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(jobService.getJob).not.toHaveBeenCalled()
  })

  it('polls for updates when job is in progress', async () => {
    const mockJob = {
      id: '1',
      url: 'https://example.com',
      status: 'in_progress',
      created_at: '2024-01-01T00:00:00Z'
    }

    ;(jobService.getJob as any).mockResolvedValue(mockJob)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.status).toBe('in_progress')
    
    // Should enable polling for in-progress jobs
    expect(jobService.getJob).toHaveBeenCalledWith('1')
  })

  it('stops polling when job is completed', async () => {
    const mockJob = {
      id: '1',
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      result: { title: 'Example Page' }
    }

    ;(jobService.getJob as any).mockResolvedValue(mockJob)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.status).toBe('completed')
    
    // Should not continue polling for completed jobs
    expect(jobService.getJob).toHaveBeenCalledTimes(1)
  })

  it('provides job status helpers', async () => {
    const mockJob = {
      id: '1',
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      result: { title: 'Example Page' }
    }

    ;(jobService.getJob as any).mockResolvedValue(mockJob)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isCompleted).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isFailed).toBe(false)
    expect(result.current.hasResults).toBe(true)
  })

  it('handles failed job status', async () => {
    const mockJob = {
      id: '1',
      url: 'https://example.com',
      status: 'failed',
      created_at: '2024-01-01T00:00:00Z',
      error_message: 'Scraping failed'
    }

    ;(jobService.getJob as any).mockResolvedValue(mockJob)

    const { result } = renderHook(() => useJob('1'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isFailed).toBe(true)
    expect(result.current.hasResults).toBe(false)
    expect(result.current.data?.error_message).toBe('Scraping failed')
  })
})