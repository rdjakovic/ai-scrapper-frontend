import { describe, it, expect } from 'vitest'
import {
  validateUrl,
  validateSelector,
  validateTimeout,
  validateHeaders,
  sanitizeInput,
  isValidJobData
} from '../validation'

describe('validation utilities', () => {
  describe('validateUrl', () => {
    it('validates correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://test.org')).toBe(true)
      expect(validateUrl('https://subdomain.example.com/path')).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false)
      expect(validateUrl('ftp://example.com')).toBe(false)
      expect(validateUrl('')).toBe(false)
      expect(validateUrl('javascript:alert(1)')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateUrl('https://')).toBe(false)
      expect(validateUrl('https://.')).toBe(false)
      expect(validateUrl('https://localhost:3000')).toBe(true)
    })
  })

  describe('validateSelector', () => {
    it('validates correct CSS selectors', () => {
      expect(validateSelector('h1')).toBe(true)
      expect(validateSelector('.class-name')).toBe(true)
      expect(validateSelector('#id')).toBe(true)
      expect(validateSelector('div > p')).toBe(true)
      expect(validateSelector('[data-test="value"]')).toBe(true)
    })

    it('rejects invalid CSS selectors', () => {
      expect(validateSelector('')).toBe(false)
      expect(validateSelector('invalid[selector')).toBe(false)
      expect(validateSelector('div > > p')).toBe(false)
      expect(validateSelector('.')).toBe(false)
    })

    it('handles complex selectors', () => {
      expect(validateSelector('div.class:nth-child(2n+1)')).toBe(true)
      expect(validateSelector('input[type="text"]:focus')).toBe(true)
      expect(validateSelector('ul li:first-child a')).toBe(true)
    })
  })

  describe('validateTimeout', () => {
    it('validates correct timeout values', () => {
      expect(validateTimeout(1000)).toBe(true)
      expect(validateTimeout(30000)).toBe(true)
      expect(validateTimeout(60000)).toBe(true)
    })

    it('rejects invalid timeout values', () => {
      expect(validateTimeout(0)).toBe(false)
      expect(validateTimeout(-1000)).toBe(false)
      expect(validateTimeout(300000)).toBe(false) // Too long
    })

    it('handles edge cases', () => {
      expect(validateTimeout(500)).toBe(false) // Too short
      expect(validateTimeout(120000)).toBe(true) // 2 minutes
    })
  })

  describe('validateHeaders', () => {
    it('validates correct headers', () => {
      expect(validateHeaders({})).toBe(true)
      expect(validateHeaders({ 'User-Agent': 'test' })).toBe(true)
      expect(validateHeaders({ 'Content-Type': 'application/json' })).toBe(true)
    })

    it('rejects invalid headers', () => {
      expect(validateHeaders({ '': 'value' })).toBe(false) // Empty key
      expect(validateHeaders({ 'key': '' })).toBe(false) // Empty value
      expect(validateHeaders({ 'invalid\nheader': 'value' })).toBe(false) // Invalid characters
    })

    it('handles special characters', () => {
      expect(validateHeaders({ 'X-Custom-Header': 'value-123' })).toBe(true)
      expect(validateHeaders({ 'Authorization': 'Bearer token123' })).toBe(true)
    })
  })

  describe('sanitizeInput', () => {
    it('sanitizes HTML input', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('')
      expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello world')
      expect(sanitizeInput('Normal text')).toBe('Normal text')
    })

    it('handles XSS attempts', () => {
      expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('')
      expect(sanitizeInput('javascript:alert(1)')).toBe('javascript:alert(1)') // URL validation should catch this
      expect(sanitizeInput('<iframe src="evil.com"></iframe>')).toBe('')
    })

    it('preserves safe content', () => {
      expect(sanitizeInput('https://example.com')).toBe('https://example.com')
      expect(sanitizeInput('user@example.com')).toBe('user@example.com')
      expect(sanitizeInput('Some text with numbers 123')).toBe('Some text with numbers 123')
    })
  })

  describe('isValidJobData', () => {
    it('validates complete job data', () => {
      const validJob = {
        url: 'https://example.com',
        selectors: { title: 'h1' },
        timeout: 30000,
        javascript: true,
        headers: { 'User-Agent': 'test' }
      }
      expect(isValidJobData(validJob)).toBe(true)
    })

    it('validates minimal job data', () => {
      const minimalJob = {
        url: 'https://example.com'
      }
      expect(isValidJobData(minimalJob)).toBe(true)
    })

    it('rejects invalid job data', () => {
      expect(isValidJobData({})).toBe(false) // Missing URL
      expect(isValidJobData({ url: 'invalid-url' })).toBe(false)
      expect(isValidJobData({ url: 'https://example.com', timeout: -1000 })).toBe(false)
    })

    it('handles optional fields', () => {
      const jobWithOptionals = {
        url: 'https://example.com',
        selectors: {},
        timeout: undefined,
        javascript: false
      }
      expect(isValidJobData(jobWithOptionals)).toBe(true)
    })
  })
})