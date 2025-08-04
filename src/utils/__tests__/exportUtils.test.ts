import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON } from '../exportUtils'
import { createMockJob } from '../../test/utils'

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

Object.defineProperty(global.URL, 'createObjectURL', {
  value: mockCreateObjectURL,
})

Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
})

// Mock document.createElement and click
const mockClick = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

const mockAnchorElement = {
  href: '',
  download: '',
  click: mockClick,
}

vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any
  }
  return {} as any
})

vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToCSV', () => {
    it('exports jobs to CSV format', () => {
      const jobs = [
        createMockJob({ id: '1', url: 'https://example.com', status: 'completed' }),
        createMockJob({ id: '2', url: 'https://test.com', status: 'pending' }),
      ]

      exportToCSV(jobs, 'test-export')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockAnchorElement.download).toBe('test-export.csv')
      expect(mockClick).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement)
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchorElement)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('handles empty jobs array', () => {
      exportToCSV([], 'empty-export')

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportToJSON', () => {
    it('exports jobs to JSON format', () => {
      const jobs = [
        createMockJob({ id: '1', url: 'https://example.com' }),
      ]

      exportToJSON(jobs, 'test-export')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      expect(mockAnchorElement.download).toBe('test-export.json')
      expect(mockClick).toHaveBeenCalled()
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement)
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchorElement)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('creates properly formatted JSON', () => {
      const jobs = [createMockJob()]
      
      exportToJSON(jobs, 'test')

      const blobCall = mockCreateObjectURL.mock.calls[0][0]
      expect(blobCall.type).toBe('application/json')
    })
  })
})