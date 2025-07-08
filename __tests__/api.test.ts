/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/check-url/route'

// Mock external APIs
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('/api/check-url', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Reset environment variables
    delete process.env.VIRUSTOTAL_API_KEY
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY
  })

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/check-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  it('returns error for missing URL', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('URL이 제공되지 않았습니다')
  })

  it('returns error for invalid URL', async () => {
    const request = createMockRequest({ url: 'invalid-url' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('유효하지 않은 URL입니다')
  })

  it('analyzes safe HTTPS URL', async () => {
    // Mock successful HTTP response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'text/html',
        'server': 'nginx/1.18.0'
      }),
      text: () => Promise.resolve('<html><title>Example Domain</title></html>')
    } as Response)

    const request = createMockRequest({ url: 'https://example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ssl).toBe(true)
    expect(data.risk_level).toBe('low')
    expect(data.suspicious_patterns).toEqual([])
    expect(data.ip_address).toBe(false)
    expect(data.url_shortener).toBe(false)
    expect(data.final_url).toBe('https://example.com')
  })

  it('identifies high risk for HTTP + IP address', async () => {
    // Mock HTTP response for IP address
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      }),
      text: () => Promise.resolve('<html><title>Server</title></html>')
    } as Response)

    const request = createMockRequest({ url: 'http://192.168.1.1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ssl).toBe(false)
    expect(data.ip_address).toBe(true)
    expect(data.risk_level).toBe('high')
    expect(data.risk_score).toBeGreaterThan(5)
  })

  it('detects URL shortener services', async () => {
    // Mock redirect response from bit.ly
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 302,
        headers: new Headers({
          'location': 'https://example.com'
        }),
        text: () => Promise.resolve('')
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/html'
        }),
        text: () => Promise.resolve('<html><title>Example</title></html>')
      } as Response)

    const request = createMockRequest({ url: 'https://bit.ly/test123' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url_shortener).toBe(true)
    expect(data.redirects).toContain('https://bit.ly/test123')
    expect(data.final_url).toBe('https://example.com')
    expect(data.risk_level).toBe('medium')
  })

  it('identifies suspicious patterns', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      }),
      text: () => Promise.resolve('<html><title>Secure Bank Login</title></html>')
    } as Response)

    const request = createMockRequest({ url: 'https://secure-bank-login123456.tk' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.suspicious_patterns.length).toBeGreaterThan(0)
    expect(data.suspicious_patterns).toContain('피싱 의심 키워드')
    expect(data.suspicious_patterns).toContain('무료 도메인 사용')
    expect(data.risk_level).toBe('high')
  })

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = createMockRequest({ url: 'https://unreachable.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status_code).toBe(null)
    expect(data.recommendations).toContain('네트워크 연결을 확인해주세요')
  })

  it('processes redirects correctly', async () => {
    // Mock redirect chain: shorturl -> intermediate -> final
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 301,
        headers: new Headers({
          'location': 'https://intermediate.com/redirect'
        }),
        text: () => Promise.resolve('')
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 302,
        headers: new Headers({
          'location': 'https://final-destination.com'
        }),
        text: () => Promise.resolve('')
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/html'
        }),
        text: () => Promise.resolve('<html><title>Final Page</title></html>')
      } as Response)

    const request = createMockRequest({ url: 'https://redirect-test.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.redirects).toHaveLength(2)
    expect(data.final_url).toBe('https://final-destination.com')
    expect(data.page_title).toBe('Final Page')
  })

  it('calculates response time', async () => {
    // Mock slow response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type': 'text/html'
          }),
          text: () => Promise.resolve('<html></html>')
        } as Response), 100)
      )
    )

    const request = createMockRequest({ url: 'https://slow-site.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response_time).toBeGreaterThan(90)
    expect(data.response_time).toBeLessThan(200) // Allow some variance
  })

  it('handles VirusTotal API when available', async () => {
    process.env.VIRUSTOTAL_API_KEY = 'test-api-key'

    // Mock VirusTotal API response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/html'
        }),
        text: () => Promise.resolve('<html></html>')
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            attributes: {
              last_analysis_stats: {
                malicious: 0,
                suspicious: 0,
                undetected: 50,
                harmless: 20
              }
            }
          }
        })
      } as Response)

    const request = createMockRequest({ url: 'https://example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.malware_detected).toBe(false)
  })

  it('handles Google Safe Browsing API when available', async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'test-api-key'

    // Mock Google Safe Browsing API response (no threats)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/html'
        }),
        text: () => Promise.resolve('<html></html>')
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}) // Empty response means no threats
      } as Response)

    const request = createMockRequest({ url: 'https://example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.phishing_detected).toBe(false)
  })

  it('generates appropriate recommendations', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'text/html'
      }),
      text: () => Promise.resolve('<html></html>')
    } as Response)

    const request = createMockRequest({ url: 'http://new-domain123.tk' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.recommendations).toContain('❌ HTTPS를 사용하지 않습니다. 개인정보 입력을 절대 피하세요.')
    expect(data.risk_level).toBe('high')
  })

  it('handles server errors gracefully', async () => {
    // Simulate server error during processing
    mockFetch.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const request = createMockRequest({ url: 'https://example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('서버 오류가 발생했습니다')
  })
})