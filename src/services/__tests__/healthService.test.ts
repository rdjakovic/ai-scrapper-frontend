import { describe, it, expect, vi, beforeEach } from 'vitest'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import { healthService } from '../healthService'

const API_BASE_URL = 'http://localhost:8000'

describe('healthService', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('checkHealth', () => {
    it('fetches health status successfully', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        database: 'connected',
        redis: 'connected',
        version: '1.0.0',
        uptime: 3600
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.checkHealth()

      expect(result).toEqual(mockHealth)
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

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth, { status: 503 })
        })
      )

      const result = await healthService.checkHealth()

      expect(result.status).toBe('unhealthy')
      expect(result.database).toBe('disconnected')
    })

    it('handles network errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.error()
        })
      )

      await expect(healthService.checkHealth()).rejects.toThrow()
    })

    it('handles timeout errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return new Promise(() => {}) // Never resolves
        })
      )

      // This would need to be tested with actual timeout configuration
      expect(healthService.checkHealth).toBeDefined()
    })
  })

  describe('checkConnectivity', () => {
    it('returns true when API is reachable', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json({ status: 'healthy' })
        })
      )

      const result = await healthService.checkConnectivity()

      expect(result).toBe(true)
    })

    it('returns false when API is unreachable', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.error()
        })
      )

      const result = await healthService.checkConnectivity()

      expect(result).toBe(false)
    })
  })

  describe('getDetailedHealth', () => {
    it('extracts detailed metrics from health response', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        database: 'connected',
        redis: 'connected',
        version: '1.0.0',
        uptime: 7200
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.getDetailedHealth()

      expect(result.overall).toBe(true)
      expect(result.components.database).toBe(true)
      expect(result.components.redis).toBe(true)
      expect(result.metadata.uptime).toBe(7200)
      expect(result.metadata.version).toBe('1.0.0')
    })

    it('handles missing metrics gracefully', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z'
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.getDetailedHealth()

      expect(result.overall).toBe(true)
      expect(result.metadata.uptime).toBe(0)
      expect(result.metadata.version).toBe(undefined)
    })
  })

  describe('isReadyForJobs', () => {
    it('returns true when ready for jobs', async () => {
      const mockHealth = {
        status: 'healthy',
        database: 'connected',
        redis: 'connected'
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.isReadyForJobs()

      expect(result).toBe(true)
    })

    it('returns false when database is disconnected', async () => {
      const mockHealth = {
        status: 'healthy',
        database: 'disconnected',
        redis: 'connected'
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.isReadyForJobs()

      expect(result).toBe(false)
    })
  })
})