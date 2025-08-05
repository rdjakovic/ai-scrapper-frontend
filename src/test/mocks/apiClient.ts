import { vi } from 'vitest'

// Mock API client for testing
export class MockApiClient {
  private static instance: MockApiClient
  private mockResponses: Map<string, any> = new Map()
  private mockErrors: Map<string, Error> = new Map()

  static getInstance(): MockApiClient {
    if (!MockApiClient.instance) {
      MockApiClient.instance = new MockApiClient()
    }
    return MockApiClient.instance
  }

  // Set mock response for a specific endpoint
  setMockResponse(endpoint: string, response: any): void {
    this.mockResponses.set(endpoint, response)
  }

  // Set mock error for a specific endpoint
  setMockError(endpoint: string, error: Error): void {
    this.mockErrors.set(endpoint, error)
  }

  // Clear all mocks
  clearMocks(): void {
    this.mockResponses.clear()
    this.mockErrors.clear()
  }

  // Mock HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    if (this.mockErrors.has(endpoint)) {
      throw this.mockErrors.get(endpoint)
    }
    
    if (this.mockResponses.has(endpoint)) {
      return this.mockResponses.get(endpoint)
    }
    
    // Default responses for common endpoints
    return this.getDefaultResponse(endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    if (this.mockErrors.has(endpoint)) {
      throw this.mockErrors.get(endpoint)
    }
    
    if (this.mockResponses.has(endpoint)) {
      return this.mockResponses.get(endpoint)
    }
    
    return this.getDefaultPostResponse(endpoint, data)
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    if (this.mockErrors.has(endpoint)) {
      throw this.mockErrors.get(endpoint)
    }
    
    if (this.mockResponses.has(endpoint)) {
      return this.mockResponses.get(endpoint)
    }
    
    return this.getDefaultResponse(endpoint)
  }

  async delete<T>(endpoint: string): Promise<T> {
    if (this.mockErrors.has(endpoint)) {
      throw this.mockErrors.get(endpoint)
    }
    
    if (this.mockResponses.has(endpoint)) {
      return this.mockResponses.get(endpoint)
    }
    
    return { message: 'Deleted successfully' } as T
  }

  private getDefaultResponse(endpoint: string): any {
    // Default responses based on endpoint patterns
    if (endpoint === '/health') {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        redis: 'connected',
        version: '1.0.0',
        uptime: 3600
      }
    }
    
    if (endpoint === '/jobs') {
      return {
        jobs: [
          {
            id: '1',
            url: 'https://example.com',
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:05:00Z',
            result: { title: 'Example Page' }
          }
        ],
        total: 1
      }
    }
    
    if (endpoint.startsWith('/jobs/')) {
      const jobId = endpoint.split('/')[2]
      return {
        id: jobId,
        url: 'https://example.com',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:05:00Z',
        result: { title: 'Example Page' }
      }
    }
    
    if (endpoint.startsWith('/results/')) {
      const jobId = endpoint.split('/')[2]
      return {
        job_id: jobId,
        url: 'https://example.com',
        status: 'completed',
        data: { title: 'Example Page', content: 'Sample content' },
        scraped_at: '2024-01-01T00:05:00Z',
        processing_time: 1500
      }
    }
    
    return {}
  }

  private getDefaultPostResponse(endpoint: string, data: any): any {
    if (endpoint === '/jobs') {
      return {
        id: 'new-job-id',
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    if (endpoint.includes('/retry')) {
      return {
        id: 'retry-job-id',
        url: data.url || 'https://example.com',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    return data
  }
}

// Factory functions for creating mock data
export const createMockJob = (overrides = {}) => ({
  id: '1',
  url: 'https://example.com',
  status: 'completed' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:05:00Z',
  result: { title: 'Example Page' },
  ...overrides
})

export const createMockJobList = (count = 3) => ({
  jobs: Array.from({ length: count }, (_, i) => createMockJob({
    id: `${i + 1}`,
    url: `https://example${i + 1}.com`
  })),
  total: count
})

export const createMockHealth = (overrides = {}) => ({
  status: 'healthy',
  timestamp: '2024-01-01T00:00:00Z',
  database: 'connected',
  redis: 'connected',
  version: '1.0.0',
  uptime: 3600,
  ...overrides
})

export const createMockResults = (overrides = {}) => ({
  job_id: '1',
  url: 'https://example.com',
  status: 'completed' as const,
  data: { title: 'Example Page', content: 'Sample content' },
  scraped_at: '2024-01-01T00:05:00Z',
  processing_time: 1500,
  ...overrides
})

// Mock service functions
export const mockJobService = {
  getJobs: vi.fn(),
  getJob: vi.fn(),
  createJob: vi.fn(),
  cancelJob: vi.fn(),
  retryJob: vi.fn()
}

export const mockHealthService = {
  getHealth: vi.fn(),
  checkConnectivity: vi.fn(),
  getHealthMetrics: vi.fn(),
  isHealthy: vi.fn(),
  canCreateJobs: vi.fn()
}

export const mockResultsService = {
  getResults: vi.fn(),
  getResultsWithHtml: vi.fn(),
  getResultsWithScreenshot: vi.fn()
}

// Helper to reset all mocks
export const resetAllMocks = () => {
  MockApiClient.getInstance().clearMocks()
  vi.clearAllMocks()
  
  Object.values(mockJobService).forEach(mock => mock.mockReset())
  Object.values(mockHealthService).forEach(mock => mock.mockReset())
  Object.values(mockResultsService).forEach(mock => mock.mockReset())
}

// Helper to setup common mock scenarios
export const setupMockScenarios = {
  healthyApi: () => {
    mockHealthService.getHealth.mockResolvedValue(createMockHealth())
    mockHealthService.isHealthy.mockReturnValue(true)
    mockHealthService.canCreateJobs.mockReturnValue(true)
  },
  
  unhealthyApi: () => {
    mockHealthService.getHealth.mockResolvedValue(createMockHealth({ status: 'unhealthy' }))
    mockHealthService.isHealthy.mockReturnValue(false)
    mockHealthService.canCreateJobs.mockReturnValue(false)
  },
  
  jobsLoaded: (count = 3) => {
    mockJobService.getJobs.mockResolvedValue(createMockJobList(count))
  },
  
  jobsError: () => {
    mockJobService.getJobs.mockRejectedValue(new Error('Failed to load jobs'))
  },
  
  jobCreated: () => {
    mockJobService.createJob.mockResolvedValue(createMockJob({ id: 'new-job' }))
  },
  
  jobCreationError: () => {
    mockJobService.createJob.mockRejectedValue(new Error('Failed to create job'))
  }
}