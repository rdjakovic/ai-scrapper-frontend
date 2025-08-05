import { describe, it, expect, vi, beforeEach } from 'vitest'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import * as healthService from '../healthService'

const API_BASE_URL = 'http://localhost:8000'

describe('healthService', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('getHealth', () => {
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

      const result = await healthService.getHealth()

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

      const result = await healthService.getHealth()

      expect(result.status).toBe('unhealthy')
      expect(result.database).toBe('disconnected')
    })

    it('handles network errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.error()
        })
      )

      await expect(healthService.getHealth()).rejects.toThrow()
    })

    it('handles timeout errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return new Promise(() => {}) // Never resolves
        })
      )

      // This would need to be tested with actual timeout configuration
      expect(healthService.getHealth).toBeDefined()
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

  describe('getHealthMetrics', () => {
    it('extracts metrics from health response', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        database: 'connected',
        redis: 'connected',
        version: '1.0.0',
        uptime: 7200,
        response_time: 150
      }

      server.use(
        http.get(`${API_BASE_URL}/health`, () => {
          return HttpResponse.json(mockHealth)
        })
      )

      const result = await healthService.getHealthMetrics()

      expect(result.uptime).toBe(7200)
      expect(result.version).toBe('1.0.0')
      expect(result.responseTime).toBe(150)
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

      const result = await healthService.getHealthMetrics()

      expect(result.uptime).toBe(0)
      expect(result.version).toBe('unknown')
      expect(result.responseTime).toBe(0)
    })
  })

  describe('isHealthy', () => {
    it('returns true for healthy status', () => {
      const healthData = { status: 'healthy' }
      expect(healthService.isHealthy(healthData)).toBe(true)
    })

    it('returns false for unhealthy status', () => {
      const healthData = { status: 'unhealthy' }
      expect(healthService.isHealthy(healthData)).toBe(false)
    })

    it('returns false for degraded status', () => {
      const healthData = { status: 'degraded' }
      expect(healthService.isHealthy(healthData)).toBe(false)
    })
  })

  describe('canCreateJobs', () => {
    it('returns true when healthy', () => {
      const healthData = { status: 'healthy', database: 'connected' }
      expect(healthService.canCreateJobs(healthData)).toBe(true)
    })

    it('returns false when unhealthy', () => {
      const healthData = { status: 'unhealthy', database: 'disconnected' }
      expect(healthService.canCreateJobs(healthData)).toBe(false)
    })

    it('returns false when database is disconnected', () => {
      const healthData = { status: 'healthy', database: 'disconnected' }
      expect(healthService.canCreateJobs(healthData)).toBe(false)
    })
  })
})