import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8000'

export const handlers = [
  // Jobs endpoints
  http.get(`${API_BASE_URL}/jobs`, () => {
    return HttpResponse.json({
      jobs: [
        {
          id: '1',
          url: 'https://example.com',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:05:00Z',
          result: {
            title: 'Example Page',
            content: 'Sample content',
          },
        },
        {
          id: '2',
          url: 'https://test.com',
          status: 'pending',
          created_at: '2024-01-01T00:10:00Z',
          updated_at: '2024-01-01T00:10:00Z',
          result: null,
        },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/jobs`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: '3',
      url: (body as any).url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      result: null,
    })
  }),

  http.get(`${API_BASE_URL}/jobs/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      id,
      url: 'https://example.com',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:05:00Z',
      result: {
        title: 'Example Page',
        content: 'Sample content',
      },
    })
  }),

  http.delete(`${API_BASE_URL}/jobs/:id`, () => {
    return HttpResponse.json({ message: 'Job deleted successfully' })
  }),

  // Health check
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({ status: 'healthy' })
  }),
]