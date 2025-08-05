import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useHealth } from '../useHealth'
import * as healthService from '../../services/healthService'

// Mock the health service
vi.mock('../../services/healthService')

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

describe('useHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches health status successfully', async () => {
    const mockHealth = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 3600
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockHealth)
  })

  it('handles loading state', () => {
    ;(healthService.getHealth as any).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('handles error state', async () => {
    const mockError = new Error('Health check failed')
    ;(healthService.getHealth as any).mockRejectedValue(mockError)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('provides health status helpers', async () => {
    const mockHealth = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 3600
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isHealthy).toBe(true)
    expect(result.current.isDegraded).toBe(false)
    expect(result.current.canCreateJobs).toBe(true)
  })

  it('handles degraded health status', async () => {
    const mockHealth = {
      status: 'degraded',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'connected',
      redis: 'disconnected',
      version: '1.0.0',
      uptime: 3600
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isHealthy).toBe(false)
    expect(result.current.isDegraded).toBe(true)
    expect(result.current.canCreateJobs).toBe(false)
  })

  it('handles unhealthy status', async () => {
    const mockHealth = {
      status: 'unhealthy',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'disconnected',
      redis: 'disconnected',
      version: '1.0.0',
      uptime: 0
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.isHealthy).toBe(false)
    expect(result.current.isDegraded).toBe(false)
    expect(result.current.canCreateJobs).toBe(false)
  })

  it('polls health status periodically', async () => {
    const mockHealth = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 3600
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth({ refetchInterval: 5000 }), { 
      wrapper: createWrapper() 
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(healthService.getHealth).toHaveBeenCalledTimes(1)
  })

  it('formats uptime correctly', async () => {
    const mockHealth = {
      status: 'healthy',
      timestamp: '2024-01-01T00:00:00Z',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 7200 // 2 hours
    }

    ;(healthService.getHealth as any).mockResolvedValue(mockHealth)

    const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.formattedUptime).toBe('2h')
  })
})