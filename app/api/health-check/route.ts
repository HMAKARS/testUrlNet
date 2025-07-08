import { NextRequest, NextResponse } from 'next/server'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: number
  uptime: number
  version: string
  environment: string
  services: {
    database?: 'healthy' | 'unhealthy'
    redis?: 'healthy' | 'unhealthy'
    externalAPIs: {
      virusTotal: 'healthy' | 'unhealthy' | 'unavailable'
      googleSafeBrowsing: 'healthy' | 'unhealthy' | 'unavailable'
    }
  }
  metrics: {
    responseTime: number
    memoryUsage?: number
    activeConnections?: number
  }
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warn'
    message?: string
    duration: number
  }>
}

// 서비스 시작 시간
const startTime = Date.now()

async function checkExternalAPI(name: string, url: string, timeout: number = 5000): Promise<{
  status: 'healthy' | 'unhealthy'
  duration: number
  message?: string
}> {
  const start = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'URL-Safety-Checker-HealthCheck/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    const duration = Date.now() - start
    
    if (response.ok) {
      return { status: 'healthy', duration }
    } else {
      return { 
        status: 'unhealthy', 
        duration, 
        message: `HTTP ${response.status}` 
      }
    }
  } catch (error) {
    const duration = Date.now() - start
    return { 
      status: 'unhealthy', 
      duration, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function checkVirusTotal(): Promise<{
  status: 'healthy' | 'unhealthy' | 'unavailable'
  duration: number
  message?: string
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  
  if (!apiKey) {
    return { status: 'unavailable', duration: 0, message: 'API key not configured' }
  }
  
  const start = Date.now()
  
  try {
    const response = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'HEAD',
      headers: {
        'x-apikey': apiKey
      }
    })
    
    const duration = Date.now() - start
    
    if (response.ok || response.status === 404) { // 404는 정상 (엔드포인트가 존재함)
      return { status: 'healthy', duration }
    } else if (response.status === 401) {
      return { status: 'unhealthy', duration, message: 'Invalid API key' }
    } else if (response.status === 429) {
      return { status: 'unhealthy', duration, message: 'Rate limited' }
    } else {
      return { status: 'unhealthy', duration, message: `HTTP ${response.status}` }
    }
  } catch (error) {
    const duration = Date.now() - start
    return { 
      status: 'unhealthy', 
      duration, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function checkGoogleSafeBrowsing(): Promise<{
  status: 'healthy' | 'unhealthy' | 'unavailable'
  duration: number
  message?: string
}> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  
  if (!apiKey) {
    return { status: 'unavailable', duration: 0, message: 'API key not configured' }
  }
  
  const start = Date.now()
  
  try {
    // Google Safe Browsing API 테스트 요청
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: 'url-safety-checker-health',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: 'http://malware.testing.google.test/testing/malware/' }]
        }
      })
    })
    
    const duration = Date.now() - start
    
    if (response.ok) {
      return { status: 'healthy', duration }
    } else if (response.status === 400) {
      return { status: 'healthy', duration, message: 'API responding (400 expected for test data)' }
    } else if (response.status === 401) {
      return { status: 'unhealthy', duration, message: 'Invalid API key' }
    } else if (response.status === 429) {
      return { status: 'unhealthy', duration, message: 'Rate limited' }
    } else {
      return { status: 'unhealthy', duration, message: `HTTP ${response.status}` }
    }
  } catch (error) {
    const duration = Date.now() - start
    return { 
      status: 'unhealthy', 
      duration, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

function getMemoryUsage(): number | undefined {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return Math.round(usage.heapUsed / 1024 / 1024) // MB
  }
  return undefined
}

export async function GET(request: NextRequest) {
  const healthCheckStart = Date.now()
  
  try {
    const checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warn'
      message?: string
      duration: number
    }> = []

    // 기본 시스템 체크
    const systemCheckStart = Date.now()
    checks.push({
      name: 'system',
      status: 'pass',
      message: 'System operational',
      duration: Date.now() - systemCheckStart
    })

    // 외부 API 체크들을 병렬로 실행
    const [virusTotalCheck, googleSafeBrowsingCheck] = await Promise.all([
      checkVirusTotal(),
      checkGoogleSafeBrowsing()
    ])

    // VirusTotal 체크 결과
    checks.push({
      name: 'virustotal',
      status: virusTotalCheck.status === 'healthy' ? 'pass' : 
              virusTotalCheck.status === 'unavailable' ? 'warn' : 'fail',
      message: virusTotalCheck.message,
      duration: virusTotalCheck.duration
    })

    // Google Safe Browsing 체크 결과
    checks.push({
      name: 'google_safe_browsing',
      status: googleSafeBrowsingCheck.status === 'healthy' ? 'pass' : 
              googleSafeBrowsingCheck.status === 'unavailable' ? 'warn' : 'fail',
      message: googleSafeBrowsingCheck.message,
      duration: googleSafeBrowsingCheck.duration
    })

    // 전체 상태 결정
    const hasFailures = checks.some(check => check.status === 'fail')
    const hasWarnings = checks.some(check => check.status === 'warn')
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded'
    if (hasFailures) {
      overallStatus = 'unhealthy'
    } else if (hasWarnings) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        externalAPIs: {
          virusTotal: virusTotalCheck.status,
          googleSafeBrowsing: googleSafeBrowsingCheck.status
        }
      },
      metrics: {
        responseTime: Date.now() - healthCheckStart,
        memoryUsage: getMemoryUsage()
      },
      checks
    }

    // HTTP 상태 코드 결정
    let statusCode = 200
    if (overallStatus === 'unhealthy') {
      statusCode = 503 // Service Unavailable
    } else if (overallStatus === 'degraded') {
      statusCode = 200 // OK but with warnings
    }

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: Date.now(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        externalAPIs: {
          virusTotal: 'unhealthy',
          googleSafeBrowsing: 'unhealthy'
        }
      },
      metrics: {
        responseTime: Date.now() - healthCheckStart,
        memoryUsage: getMemoryUsage()
      },
      checks: [{
        name: 'health_check',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - healthCheckStart
      }]
    }

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// HEAD 요청도 지원 (로드밸런서 체크용)
export async function HEAD(request: NextRequest) {
  try {
    // 간단한 체크만 수행
    const response = await GET(request)
    const data = await response.json()
    
    return new NextResponse(null, {
      status: data.status === 'healthy' ? 200 : 503,
      headers: {
        'X-Health-Status': data.status,
        'X-Uptime': data.uptime.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}