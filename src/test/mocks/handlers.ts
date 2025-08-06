import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8000'

export const handlers = [
  // Jobs endpoints
  http.get(`${API_BASE_URL}/api/v1/jobs`, () => {
    return HttpResponse.json({
      jobs: [
        {
          job_id: '1',
          url: 'https://example.com',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:05:00Z',
          completed_at: '2024-01-01T00:05:00Z',
          error_message: null,
          job_metadata: {
            priority: 'normal',
            retries: 0,
          },
          result: {
            title: 'Example Page',
            content: 'Sample content',
          },
          data: {
            title: 'Example Page',
            content: 'Sample content',
          },
        },
        {
          job_id: '2',
          url: 'https://test.com',
          status: 'pending',
          created_at: '2024-01-01T00:10:00Z',
          updated_at: '2024-01-01T00:10:00Z',
          completed_at: null,
          error_message: null,
          job_metadata: {
            priority: 'high',
            retries: 1,
          },
          result: null,
          data: null,
        },
        {
          job_id: '3',
          url: 'https://failed-example.com',
          status: 'failed',
          created_at: '2024-01-01T00:15:00Z',
          updated_at: '2024-01-01T00:20:00Z',
          completed_at: null,
          error_message: 'Network timeout after 30 seconds',
          job_metadata: {
            priority: 'low',
            retries: 3,
          },
          result: null,
          data: null,
        },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/jobs`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      job_id: '4',
      url: (body as any).url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
      job_metadata: {
        priority: 'normal',
        retries: 0,
        ...(body as any).job_metadata,
      },
      result: null,
      data: null,
    })
  }),

  // POST /api/v1/scrape endpoint for job creation and retry
  http.post(`${API_BASE_URL}/api/v1/scrape`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      job_id: '4',
      url: (body as any).url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
      job_metadata: {
        priority: 'normal',
        retries: 0,
        ...(body as any).job_metadata,
      },
      result: null,
      data: null,
    })
  }),

  http.get(`${API_BASE_URL}/api/v1/scrape/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      job_id: id,
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:05:00Z',
      completed_at: '2024-01-01T00:05:00Z',
      error_message: null,
      job_metadata: {
        priority: 'normal',
        retries: 0,
      },
      result: {
        title: 'Example Page',
        content: 'Sample content',
      },
      data: {
        title: 'Example Page',
        content: 'Sample content',
      },
    })
  }),

  http.delete(`${API_BASE_URL}/api/v1/scrape/:id`, () => {
    return HttpResponse.json({ message: 'Job deleted successfully' })
  }),

  // Results endpoint
  http.get(`${API_BASE_URL}/results/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      job_id: id,
      url: 'https://example.com',
      status: 'completed',
      data: {
        title: 'Example Page',
        content: 'Sample scraped content',
        metadata: {
          word_count: 150,
          links_found: 5,
        },
      },
      raw_html: '<html><head><title>Example Page</title></head><body><h1>Example Page</h1><p>Sample scraped content</p></body></html>',
      screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      scraped_at: '2024-01-01T00:05:00Z',
      processing_time: 2500,
      error_message: null,
    })
  }),

  // Health check
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 3600,
    })
  }),

  // Add API v1 health endpoint
  http.get(`${API_BASE_URL}/api/v1/health`, () => {
    return HttpResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      version: '1.0.0',
      uptime: 3600,
    })
  }),
]