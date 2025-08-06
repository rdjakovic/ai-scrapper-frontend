import { describe, it, expect, vi } from 'vitest'
import {
  handleApiError,
  formatErrorMessage,
  isNetworkError,
  isValidationError,
  createErrorToast,
  logError
} from '../errorHandling'

// Mock console methods
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('errorHandling utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleApiError', () => {
    it('handles network errors', () => {
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'
      
      const result = handleApiError(networkError)
      
      expect(result.type).toBe('network')
      expect(result.message).toContain('Network')
      expect(result.userMessage).toBe('Unable to connect to the server. Please check your internet connection.')
    })

    it('handles validation errors', () => {
      const validationError = {
        response: {
          status: 400,
          data: { error: 'Invalid URL format' }
        }
      }
      
      const result = handleApiError(validationError)
      
      expect(result.type).toBe('validation')
      expect(result.message).toBe('Invalid URL format')
      expect(result.userMessage).toBe('Invalid URL format')
    })

    it('handles server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      }
      
      const result = handleApiError(serverError)
      
      expect(result.type).toBe('server')
      expect(result.message).toBe('Internal server error')
      expect(result.userMessage).toBe('A server error occurred. Please try again later.')
    })

    it('handles timeout errors', () => {
      const timeoutError = new Error('timeout of 5000ms exceeded')
      
      const result = handleApiError(timeoutError)
      
      expect(result.type).toBe('timeout')
      expect(result.userMessage).toBe('The request timed out. Please try again.')
    })

    it('handles unknown errors', () => {
      const unknownError = new Error('Something went wrong')
      
      const result = handleApiError(unknownError)
      
      expect(result.type).toBe('unknown')
      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('formatErrorMessage', () => {
    it('formats simple error messages', () => {
      const error = new Error('Simple error')
      expect(formatErrorMessage(error)).toBe('Simple error')
    })

    it('formats API error responses', () => {
      const apiError = {
        response: {
          data: { error: 'API error message' }
        }
      }
      expect(formatErrorMessage(apiError)).toBe('API error')
    })

    it('handles errors without messages', () => {
      const emptyError = {}
      expect(formatErrorMessage(emptyError)).toBe('An unknown error occurred')
    })

    it('handles string errors', () => {
      expect(formatErrorMessage('String error')).toBe('String error')
    })
  })

  describe('isNetworkError', () => {
    it('identifies network errors', () => {
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'
      expect(isNetworkError(networkError)).toBe(true)
    })

    it('identifies connection errors', () => {
      const connectionError = new Error('ERR_NETWORK')
      expect(isNetworkError(connectionError)).toBe(true)
    })

    it('rejects non-network errors', () => {
      const regularError = new Error('Regular error')
      expect(isNetworkError(regularError)).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('identifies validation errors by status code', () => {
      const validationError = {
        response: { status: 400 }
      }
      expect(isValidationError(validationError)).toBe(true)
    })

    it('identifies validation errors by status code 422', () => {
      const validationError = {
        response: { status: 422 }
      }
      expect(isValidationError(validationError)).toBe(true)
    })

    it('rejects non-validation errors', () => {
      const serverError = {
        response: { status: 500 }
      }
      expect(isValidationError(serverError)).toBe(false)
    })
  })

  describe('createErrorToast', () => {
    it('creates error toast with message', () => {
      const toast = createErrorToast('Error message')
      
      expect(toast.type).toBe('error')
      expect(toast.message).toBe('Error message')
      expect(toast.duration).toBe(5000)
    })

    it('creates error toast with custom duration', () => {
      const toast = createErrorToast('Error message', 3000)
      
      expect(toast.duration).toBe(3000)
    })

    it('includes retry action when provided', () => {
      const retryFn = vi.fn()
      const toast = createErrorToast('Error message', 5000, retryFn)
      
      expect(toast.action).toBeDefined()
      expect(toast.action?.label).toBe('Retry')
      expect(toast.action?.onClick).toBe(retryFn)
    })
  })

  describe('logError', () => {
    it('logs errors to console', () => {
      const error = new Error('Test error')
      logError(error, 'Test context')
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unknown Error:',
        '[Test context] Test error',
        error
      )
    })

    it('logs errors without context', () => {
      const error = new Error('Test error')
      logError(error)
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unknown Error:',
        'Test error',
        error
      )
    })

    it('handles non-Error objects', () => {
      const errorObj = { message: 'Error object' }
      logError(errorObj, 'Test context')
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unknown Error:',
        '[Test context] Error object',
        errorObj
      )
    })
  })
})