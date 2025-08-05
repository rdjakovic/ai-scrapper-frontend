import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, beforeEach } from 'vitest'
import { server } from './mocks/server'

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Setup DOM elements needed for tests
beforeEach(() => {
  // Add toast container for ErrorToast component
  const toastContainer = document.createElement('div')
  toastContainer.id = 'toast-container'
  document.body.appendChild(toastContainer)
})

afterEach(() => {
  // Clean up toast container
  const toastContainer = document.getElementById('toast-container')
  if (toastContainer) {
    document.body.removeChild(toastContainer)
  }
})

// Mock environment variables
Object.defineProperty(globalThis, '__APP_VERSION__', {
  value: '1.0.0',
  writable: true
})

Object.defineProperty(globalThis, '__BUILD_TIME__', {
  value: new Date().toISOString(),
  writable: true
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock URL.createObjectURL for file downloads
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: () => 'mock-url'
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: () => {}
})