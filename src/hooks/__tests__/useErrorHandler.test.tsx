import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useErrorHandler } from '../useErrorHandler'
import { ToastProvider } from '../../providers/ToastProvider'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useErrorHandler', () => {
  it('handles errors and provides error state', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: ToastProvider
    })

    expect(result.current.error).toBeNull()
    expect(result.current.hasError).toBe(false)

    act(() => {
      result.current.handleError(new Error('Test error'))
    })

    expect(result.current.error).toEqual(new Error('Test error'))
    expect(result.current.hasError).toBe(true)
  })

  it('clears error state', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: ToastProvider
    })

    act(() => {
      result.current.handleError(new Error('Test error'))
    })

    expect(result.current.hasError).toBe(true)

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.hasError).toBe(false)
  })

  it('handles string errors', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: ToastProvider
    })

    act(() => {
      result.current.handleError('String error')
    })

    expect(result.current.error).toEqual(new Error('String error'))
    expect(result.current.hasError).toBe(true)
  })

  it('handles axios errors with response', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: ToastProvider
    })

    const axiosError = {
      isAxiosError: true,
      response: {
        data: { message: 'API Error' },
        status: 400,
      },
    }

    act(() => {
      result.current.handleError(axiosError)
    })

    expect(result.current.error?.message).toBe('API Error')
  })

  it('handles axios errors without response', () => {
    const { result } = renderHook(() => useErrorHandler(), {
      wrapper: ToastProvider
    })

    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
    }

    act(() => {
      result.current.handleError(axiosError)
    })

    expect(result.current.error?.message).toBe('Network Error')
  })
})