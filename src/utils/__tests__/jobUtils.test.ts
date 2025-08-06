import { mapJobToFormData, mapJobToFormDataWithCreationData } from '../jobUtils';
import { Job, JobStatus } from '../../types';
import { JobFormData } from '../../schemas/jobSchema';

describe('jobUtils', () => {
  const mockJob: Job = {
    job_id: 'test-job-123',
    status: JobStatus.COMPLETED,
    url: 'https://example.com',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:05:00Z',
    completed_at: '2024-01-15T10:05:00Z',
    job_metadata: {
      priority: 'high',
      retries: 3,
      isTest: true,
    },
  };

  describe('mapJobToFormData', () => {
    it('should map basic job properties to form data', () => {
      const result = mapJobToFormData(mockJob);

      expect(result.url).toBe('https://example.com');
      expect(result.job_metadata).toEqual({
        priority: 'high',
        retries: 3,
        isTest: true,
      });
    });

    it('should handle job without metadata', () => {
      const jobWithoutMetadata: Job = {
        ...mockJob,
        job_metadata: undefined,
      };

      const result = mapJobToFormData(jobWithoutMetadata);

      expect(result.url).toBe('https://example.com');
      expect(result.job_metadata).toBeUndefined();
    });

    it('should handle job with empty metadata', () => {
      const jobWithEmptyMetadata: Job = {
        ...mockJob,
        job_metadata: {},
      };

      const result = mapJobToFormData(jobWithEmptyMetadata);

      expect(result.url).toBe('https://example.com');
      expect(result.job_metadata).toBeUndefined();
    });

    it('should filter out invalid metadata types', () => {
      const jobWithInvalidMetadata: Job = {
        ...mockJob,
        job_metadata: {
          validString: 'test',
          validNumber: 123,
          validBoolean: true,
          invalidObject: { nested: 'object' },
          invalidArray: ['array', 'values'],
        },
      };

      const result = mapJobToFormData(jobWithInvalidMetadata);

      expect(result.job_metadata).toEqual({
        validString: 'test',
        validNumber: 123,
        validBoolean: true,
      });
    });
  });

  describe('mapJobToFormData edge cases', () => {
    it('should handle jobs with complex nested metadata', () => {
      const complexJob: Job = {
        job_id: 'complex-job',
        status: JobStatus.COMPLETED,
        url: 'https://complex.com',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: {
          priority: 'high',
          config: {
            nested: {
              value: 'should-be-filtered'
            }
          },
          array: ['item1', 'item2'],
          validNumber: 42,
          validBoolean: false,
          validString: 'test',
          nullValue: null,
          undefinedValue: undefined
        }
      }

      const result = mapJobToFormData(complexJob)

      expect(result.job_metadata).toEqual({
        priority: 'high',
        validNumber: 42,
        validBoolean: false,
        validString: 'test'
      })
      expect(result.url).toBe('https://complex.com')
    })

    it('should handle job with null metadata', () => {
      const jobWithNullMetadata: Job = {
        job_id: 'null-metadata',
        status: JobStatus.PENDING,
        url: 'https://null.com',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: null as any
      }

      const result = mapJobToFormData(jobWithNullMetadata)

      expect(result.url).toBe('https://null.com')
      expect(result.job_metadata).toBeUndefined()
    })

    it('should handle job with extremely large metadata objects', () => {
      const largeMetadata: Record<string, any> = {}
      for (let i = 0; i < 1000; i++) {
        largeMetadata[`key${i}`] = `value${i}`
      }

      const largeJob: Job = {
        job_id: 'large-job',
        status: JobStatus.COMPLETED,
        url: 'https://large.com',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: largeMetadata
      }

      const result = mapJobToFormData(largeJob)

      expect(result.url).toBe('https://large.com')
      expect(Object.keys(result.job_metadata || {})).toHaveLength(1000)
      expect(result.job_metadata?.[`key0`]).toBe('value0')
      expect(result.job_metadata?.[`key999`]).toBe('value999')
    })

    it('should handle special string values in metadata', () => {
      const specialJob: Job = {
        job_id: 'special-job',
        status: JobStatus.COMPLETED,
        url: 'https://special.com',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:05:00Z',
        job_metadata: {
          emptyString: '',
          whitespace: '   ',
          newlines: '\n\r\t',
          unicode: '🚀 Unicode test 中文',
          jsonString: '{"nested": "json"}',
          numberString: '123',
          booleanString: 'true'
        }
      }

      const result = mapJobToFormData(specialJob)

      expect(result.job_metadata).toEqual({
        emptyString: '',
        whitespace: '   ',
        newlines: '\n\r\t',
        unicode: '🚀 Unicode test 中文',
        jsonString: '{"nested": "json"}',
        numberString: '123',
        booleanString: 'true'
      })
    })

    it('should handle all job status types', () => {
      const statuses = [JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]
      
      statuses.forEach(status => {
        const job: Job = {
          job_id: `job-${status}`,
          status,
          url: 'https://status-test.com',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:05:00Z',
          job_metadata: { status: status }
        }

        const result = mapJobToFormData(job)
        expect(result.url).toBe('https://status-test.com')
        expect(result.job_metadata?.status).toBe(status)
      })
    })
  })

  describe('mapJobToFormDataWithCreationData', () => {
    const mockCreationData = {
      selectors: {
        title: 'h1',
        price: '.price',
      },
      wait_for: '.content',
      timeout: 30,
      javascript: true,
      user_agent: 'Custom User Agent',
      headers: {
        'X-Custom-Header': 'value',
      },
    };

    it('should merge job data with creation data', () => {
      const result = mapJobToFormDataWithCreationData(mockJob, mockCreationData);

      expect(result.url).toBe('https://example.com');
      expect(result.selectors).toEqual({
        title: 'h1',
        price: '.price',
      });
      expect(result.wait_for).toBe('.content');
      expect(result.timeout).toBe(30);
      expect(result.javascript).toBe(true);
      expect(result.user_agent).toBe('Custom User Agent');
      expect(result.headers).toEqual({
        'X-Custom-Header': 'value',
      });
      expect(result.job_metadata).toEqual({
        priority: 'high',
        retries: 3,
        isTest: true,
      });
    });

    it('should work without creation data', () => {
      const result = mapJobToFormDataWithCreationData(mockJob);

      expect(result.url).toBe('https://example.com');
      expect(result.selectors).toBeUndefined();
      expect(result.wait_for).toBeUndefined();
      expect(result.timeout).toBeUndefined();
      expect(result.javascript).toBeUndefined();
      expect(result.user_agent).toBeUndefined();
      expect(result.headers).toBeUndefined();
      expect(result.job_metadata).toEqual({
        priority: 'high',
        retries: 3,
        isTest: true,
      });
    });

    it('should handle empty selectors and headers', () => {
      const creationDataWithEmpty = {
        ...mockCreationData,
        selectors: {},
        headers: {},
      };

      const result = mapJobToFormDataWithCreationData(mockJob, creationDataWithEmpty);

      expect(result.selectors).toBeUndefined();
      expect(result.headers).toBeUndefined();
      expect(result.wait_for).toBe('.content');
      expect(result.timeout).toBe(30);
    });

    it('should handle partial creation data', () => {
      const partialCreationData = {
        timeout: 60,
        javascript: false,
      };

      const result = mapJobToFormDataWithCreationData(mockJob, partialCreationData);

      expect(result.url).toBe('https://example.com');
      expect(result.timeout).toBe(60);
      expect(result.javascript).toBe(false);
      expect(result.selectors).toBeUndefined();
      expect(result.wait_for).toBeUndefined();
      expect(result.user_agent).toBeUndefined();
      expect(result.headers).toBeUndefined();
    });

    it('should handle empty string values correctly', () => {
      const creationDataWithEmptyStrings = {
        wait_for: '',
        user_agent: '',
      };

      const result = mapJobToFormDataWithCreationData(mockJob, creationDataWithEmptyStrings);

      expect(result.wait_for).toBeUndefined();
      expect(result.user_agent).toBeUndefined();
    });
  });
});
