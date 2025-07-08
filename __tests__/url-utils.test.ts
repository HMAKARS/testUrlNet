import {
  parseURL,
  isURLSafe,
  isSameDomain,
  shortenURL,
  sanitizeURL,
  isShortURL,
  assessURLRisk,
  deduplicateURLs,
  isImageURL,
  getFileExtension,
  resolveRelativeURL,
  parseQueryParams,
  groupURLsByDomain,
  sortURLsByRisk
} from '../lib/url-utils'

describe('URL Utils', () => {
  describe('parseURL', () => {
    it('parses valid HTTPS URL correctly', () => {
      const result = parseURL('https://example.com/path?query=1#hash')
      
      expect(result.isValid).toBe(true)
      expect(result.protocol).toBe('https:')
      expect(result.hostname).toBe('example.com')
      expect(result.pathname).toBe('/path')
      expect(result.search).toBe('?query=1')
      expect(result.hash).toBe('#hash')
      expect(result.isSecure).toBe(true)
      expect(result.isIP).toBe(false)
      expect(result.domain).toBe('example.com')
    })

    it('handles URLs without protocol', () => {
      const result = parseURL('example.com')
      
      expect(result.isValid).toBe(true)
      expect(result.protocol).toBe('https:')
      expect(result.hostname).toBe('example.com')
    })

    it('identifies IP addresses', () => {
      const result = parseURL('http://192.168.1.1')
      
      expect(result.isValid).toBe(true)
      expect(result.isIP).toBe(true)
    })

    it('identifies localhost', () => {
      const result = parseURL('http://localhost:3000')
      
      expect(result.isValid).toBe(true)
      expect(result.isLocalhost).toBe(true)
    })

    it('parses subdomain correctly', () => {
      const result = parseURL('https://blog.example.com')
      
      expect(result.isValid).toBe(true)
      expect(result.subdomain).toBe('blog')
      expect(result.domain).toBe('example.com')
      expect(result.tld).toBe('com')
    })

    it('handles invalid URLs', () => {
      const result = parseURL('invalid-url')
      
      expect(result.isValid).toBe(false)
    })
  })

  describe('isURLSafe', () => {
    it('returns true for safe URLs', () => {
      expect(isURLSafe('https://example.com')).toBe(true)
      expect(isURLSafe('http://test.org')).toBe(true)
    })

    it('returns false for dangerous schemes', () => {
      expect(isURLSafe('javascript:alert(1)')).toBe(false)
      expect(isURLSafe('data:text/html,<script>alert(1)</script>')).toBe(false)
      expect(isURLSafe('file:///etc/passwd')).toBe(false)
    })

    it('returns false for suspicious domain patterns', () => {
      expect(isURLSafe('https://example..com')).toBe(false)
      expect(isURLSafe('https://-example.com')).toBe(false)
      expect(isURLSafe('https://example-.com')).toBe(false)
    })
  })

  describe('isSameDomain', () => {
    it('returns true for same domains', () => {
      expect(isSameDomain('https://example.com', 'http://example.com')).toBe(true)
      expect(isSameDomain('https://blog.example.com', 'https://www.example.com')).toBe(true)
    })

    it('returns false for different domains', () => {
      expect(isSameDomain('https://example.com', 'https://google.com')).toBe(false)
    })
  })

  describe('shortenURL', () => {
    it('returns original URL if shorter than maxLength', () => {
      const url = 'https://short.com'
      expect(shortenURL(url, 50)).toBe(url)
    })

    it('truncates long URLs', () => {
      const url = 'https://very-long-domain-name.com/very/long/path/with/many/segments'
      const result = shortenURL(url, 30)
      
      expect(result.length).toBeLessThanOrEqual(30)
      expect(result).toContain('...')
    })
  })

  describe('sanitizeURL', () => {
    it('removes sensitive query parameters', () => {
      const url = 'https://example.com?token=secret&password=123&normal=value'
      const result = sanitizeURL(url)
      
      expect(result).not.toContain('token=secret')
      expect(result).not.toContain('password=123')
      expect(result).toContain('normal=value')
    })
  })

  describe('isShortURL', () => {
    it('identifies short URL services', () => {
      expect(isShortURL('https://bit.ly/abc123')).toBe(true)
      expect(isShortURL('https://tinyurl.com/abc123')).toBe(true)
      expect(isShortURL('https://goo.gl/abc123')).toBe(true)
    })

    it('returns false for regular URLs', () => {
      expect(isShortURL('https://example.com')).toBe(false)
    })
  })

  describe('assessURLRisk', () => {
    it('returns low risk for secure URLs', () => {
      const result = assessURLRisk('https://example.com')
      
      expect(result.level).toBe('low')
      expect(result.score).toBeLessThanOrEqual(2)
    })

    it('returns high risk for IP addresses', () => {
      const result = assessURLRisk('http://192.168.1.1')
      
      expect(result.level).toBe('high')
      expect(result.factors).toContain('HTTPS 미사용')
      expect(result.factors).toContain('IP 주소 직접 사용')
    })

    it('identifies short URLs as medium risk', () => {
      const result = assessURLRisk('https://bit.ly/test')
      
      expect(result.factors).toContain('URL 단축 서비스 사용')
    })
  })

  describe('deduplicateURLs', () => {
    it('removes duplicate domains', () => {
      const urls = [
        'https://example.com',
        'http://example.com/path',
        'https://google.com',
        'https://example.com/another'
      ]
      
      const result = deduplicateURLs(urls)
      
      expect(result).toHaveLength(2)
      expect(result.some(url => url.includes('example.com'))).toBe(true)
      expect(result.some(url => url.includes('google.com'))).toBe(true)
    })
  })

  describe('isImageURL', () => {
    it('identifies image URLs', () => {
      expect(isImageURL('https://example.com/image.jpg')).toBe(true)
      expect(isImageURL('https://example.com/photo.png')).toBe(true)
      expect(isImageURL('https://example.com/icon.svg')).toBe(true)
    })

    it('returns false for non-image URLs', () => {
      expect(isImageURL('https://example.com/page.html')).toBe(false)
      expect(isImageURL('https://example.com/data.json')).toBe(false)
    })
  })

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('https://example.com/file.pdf')).toBe('pdf')
      expect(getFileExtension('https://example.com/image.JPG')).toBe('jpg')
    })

    it('returns null for URLs without extension', () => {
      expect(getFileExtension('https://example.com/page')).toBe(null)
      expect(getFileExtension('https://example.com/')).toBe(null)
    })
  })

  describe('resolveRelativeURL', () => {
    it('resolves relative URLs', () => {
      const base = 'https://example.com/path/'
      
      expect(resolveRelativeURL(base, 'page.html')).toBe('https://example.com/path/page.html')
      expect(resolveRelativeURL(base, '../other.html')).toBe('https://example.com/other.html')
      expect(resolveRelativeURL(base, '/absolute.html')).toBe('https://example.com/absolute.html')
    })

    it('returns original URL for invalid base', () => {
      expect(resolveRelativeURL('invalid', 'page.html')).toBe('page.html')
    })
  })

  describe('parseQueryParams', () => {
    it('parses query parameters', () => {
      const result = parseQueryParams('https://example.com?a=1&b=2&c=hello%20world')
      
      expect(result).toEqual({
        a: '1',
        b: '2',
        c: 'hello world'
      })
    })

    it('returns empty object for URLs without query', () => {
      const result = parseQueryParams('https://example.com')
      
      expect(result).toEqual({})
    })
  })

  describe('groupURLsByDomain', () => {
    it('groups URLs by domain', () => {
      const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://google.com/search',
        'https://github.com/user/repo'
      ]
      
      const result = groupURLsByDomain(urls)
      
      expect(result['example.com']).toHaveLength(2)
      expect(result['google.com']).toHaveLength(1)
      expect(result['github.com']).toHaveLength(1)
    })
  })

  describe('sortURLsByRisk', () => {
    it('sorts URLs by risk level', () => {
      const urls = [
        'https://example.com',  // Low risk
        'http://192.168.1.1',   // High risk
        'https://bit.ly/test'   // Medium risk
      ]
      
      const result = sortURLsByRisk(urls)
      
      // Should be sorted from highest to lowest risk
      expect(result[0]).toBe('http://192.168.1.1')
      expect(result[2]).toBe('https://example.com')
    })
  })
})