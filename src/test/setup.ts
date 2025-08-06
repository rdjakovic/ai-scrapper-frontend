import '@testing-library/jest-dom'
import React from 'react'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { server } from './mocks/server'
import { loadEnv } from 'vite'
import { TextEncoder, TextDecoder } from 'util'

// Mock ErrorToast component
vi.mock('../components/ErrorToast', () => ({
  default: ({ toasts, onDismiss }: any) => {
    if (!toasts || toasts.length === 0) return null
    return React.createElement('div', { 'data-testid': 'error-toast' }, 'Mock toast')
  }
}))

// Polyfill TextEncoder and TextDecoder for jsdom
// This fixes the esbuild issue with "TextEncoder" instanceof Uint8Array
Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
  writable: true,
  configurable: true
})
Object.defineProperty(global, 'TextDecoder', {
  value: TextDecoder,
  writable: true,
  configurable: true
})

// Also set on window for browser compatibility
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'TextEncoder', {
    value: TextEncoder,
    writable: true,
    configurable: true
  })
  Object.defineProperty(window, 'TextDecoder', {
    value: TextDecoder,
    writable: true,
    configurable: true
  })
}

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

// Mock import.meta.env for happy-dom
const env = loadEnv('test', process.cwd(), '')
if (!(globalThis as any).import) {
  (globalThis as any).import = {}
}
(globalThis as any).import.meta = { env }
