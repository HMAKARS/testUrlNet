import { NextRequest, NextResponse } from 'next/server'

interface SystemMetrics {
  timestamp: number
  uptime: number
  version: string
  environment: string
  performance: {
    responseTime: {
      avg: number
      min: number
      max: number
      p95: number
      p99: number
    }
    throughput: {
      requestsPerSecond: number
      requestsPerMinute: number
      requestsPerHour: number
    }
    errors: {
      total: number
      rate: number
      byType: Record<string, number>
    }
  }
  usage: {
    totalRequests: number
    uniqueUsers: number
    urlsAnalyzed: number
    cacheHitRate: number
  }
  resources: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu?: {
      usage: number
    }
  }
  apiStatus: {
    virusTotal: {
      status: 'available' | 'unavailable' | 'rate_limited'
      requestsToday: number
      remainingQuota?: number
    }
    googleSafeBrowsing: {
      status: 'available' | 'unavailable' | 'rate_limited'
      requestsToday: number
      remainingQuota?: number
    }
  }
}

// 메트릭 저장소 (실제 환경에서는 Redis나 Database 사용)
class MetricsStore {
  private requests: Array<{ timestamp: number; duration: number; success: boolean; error?: string }> = []
  private urlAnalysis: Array<{ timestamp: number; url: string; userId?: string }> = []
  private errors: Array<{ timestamp: number; type: string; message: string }> = []
  private apiCalls = {
    virusTotal: { today: 0, lastReset: Date.now() },
    googleSafeBrowsing: { today: 0, lastReset: Date.now() }
  }

  addRequest(duration: number, success: boolean, error?: string) {
    this.requests.push({
      timestamp: Date.now(),
      duration,
      success,
      error
    })

    // 24시간 이상 된 데이터 제거
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.requests = this.requests.filter(req => req.timestamp > oneDayAgo)
  }

  addUrlAnalysis(url: string, userId?: string) {
    this.urlAnalysis.push({
      timestamp: Date.now(),
      url,
      userId
    })

    // 7일 이상 된 데이터 제거
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    this.urlAnalysis = this.urlAnalysis.filter(analysis => analysis.timestamp > oneWeekAgo)
  }

  addError(type: string, message: string) {
    this.errors.push({
      timestamp: Date.now(),
      type,
      message
    })

    // 24시간 이상 된 에러 제거
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.errors = this.errors.filter(error => error.timestamp > oneDayAgo)
  }

  incrementApiCall(api: 'virusTotal' | 'googleSafeBrowsing') {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    // 일일 리셋
    if (this.apiCalls[api].lastReset < oneDayAgo) {
      this.apiCalls[api].today = 0
      this.apiCalls[api].lastReset = now
    }

    this.apiCalls[api].today++
  }

  getMetrics(): SystemMetrics {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneMinuteAgo = now - 60 * 1000
    const oneSecondAgo = now - 1000

    // 성능 메트릭 계산
    const recentRequests = this.requests.filter(req => req.timestamp > oneHourAgo)
    const responseTimes = recentRequests.map(req => req.duration)
    const successfulRequests = recentRequests.filter(req => req.success)

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0

    const sortedTimes = responseTimes.sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    // 처리량 계산
    const requestsLastSecond = this.requests.filter(req => req.timestamp > oneSecondAgo).length
    const requestsLastMinute = this.requests.filter(req => req.timestamp > oneMinuteAgo).length
    const requestsLastHour = recentRequests.length

    // 에러 통계
    const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo)
    const errorsByType: Record<string, number> = {}
    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1
    })

    // 사용량 통계
    const uniqueUsers = new Set(
      this.urlAnalysis
        .filter(analysis => analysis.userId)
        .map(analysis => analysis.userId)
    ).size

    // 메모리 사용량
    const memoryUsage = process.memoryUsage ? process.memoryUsage() : null

    return {
      timestamp: now,
      uptime: now - (global as any).__startTime || 0,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      performance: {
        responseTime: {
          avg: Math.round(avgResponseTime),
          min: Math.min(...responseTimes) || 0,
          max: Math.max(...responseTimes) || 0,
          p95: sortedTimes[p95Index] || 0,
          p99: sortedTimes[p99Index] || 0
        },
        throughput: {
          requestsPerSecond: requestsLastSecond,
          requestsPerMinute: requestsLastMinute,
          requestsPerHour: requestsLastHour
        },
        errors: {
          total: recentErrors.length,
          rate: recentErrors.length / Math.max(recentRequests.length, 1),
          byType: errorsByType
        }
      },
      usage: {
        totalRequests: this.requests.length,
        uniqueUsers,
        urlsAnalyzed: this.urlAnalysis.length,
        cacheHitRate: this.calculateCacheHitRate()
      },
      resources: {
        memory: {
          used: memoryUsage ? Math.round(memoryUsage.heapUsed / 1024 / 1024) : 0,
          total: memoryUsage ? Math.round(memoryUsage.heapTotal / 1024 / 1024) : 0,
          percentage: memoryUsage ? Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) : 0
        }
      },
      apiStatus: {
        virusTotal: {
          status: this.getApiStatus('virusTotal'),
          requestsToday: this.apiCalls.virusTotal.today
        },
        googleSafeBrowsing: {
          status: this.getApiStatus('googleSafeBrowsing'),
          requestsToday: this.apiCalls.googleSafeBrowsing.today
        }
      }
    }
  }

  private calculateCacheHitRate(): number {
    // 간단한 캐시 히트율 계산 (실제로는 캐시 시스템과 연동)
    const totalRequests = this.requests.length
    if (totalRequests === 0) return 0

    // 중복 URL 분석 요청을 캐시 히트로 가정
    const uniqueUrls = new Set(this.urlAnalysis.map(analysis => analysis.url)).size
    const totalAnalysis = this.urlAnalysis.length
    
    if (totalAnalysis === 0) return 0
    
    return Math.round(((totalAnalysis - uniqueUrls) / totalAnalysis) * 100)
  }

  private getApiStatus(api: 'virusTotal' | 'googleSafeBrowsing'): 'available' | 'unavailable' | 'rate_limited' {
    const calls = this.apiCalls[api]
    
    // API 키가 없으면 unavailable
    const apiKey = api === 'virusTotal' 
      ? process.env.VIRUSTOTAL_API_KEY 
      : process.env.GOOGLE_SAFE_BROWSING_API_KEY
    
    if (!apiKey) return 'unavailable'
    
    // 간단한 rate limit 체크 (실제 한도는 API별로 다름)
    const dailyLimit = api === 'virusTotal' ? 1000 : 10000
    if (calls.today >= dailyLimit) return 'rate_limited'
    
    return 'available'
  }
}

// 전역 메트릭 저장소
const metricsStore = new MetricsStore()

// 시작 시간 저장
if (!(global as any).__startTime) {
  (global as any).__startTime = Date.now()
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 요청 기록
    const metrics = metricsStore.getMetrics()
    const duration = Date.now() - startTime
    
    metricsStore.addRequest(duration, true)
    
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    metricsStore.addRequest(duration, false, errorMessage)
    metricsStore.addError('metrics_api_error', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve metrics',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

// Prometheus 형식 메트릭 (모니터링 도구 연동용)
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'record_request':
        metricsStore.addRequest(data.duration, data.success, data.error)
        break
        
      case 'record_analysis':
        metricsStore.addUrlAnalysis(data.url, data.userId)
        break
        
      case 'record_error':
        metricsStore.addError(data.type, data.message)
        break
        
      case 'record_api_call':
        metricsStore.incrementApiCall(data.api)
        break
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// Prometheus 메트릭 형식으로 출력
export async function OPTIONS(request: NextRequest) {
  try {
    const metrics = metricsStore.getMetrics()
    
    const prometheusMetrics = `
# HELP url_safety_requests_total Total number of requests
# TYPE url_safety_requests_total counter
url_safety_requests_total ${metrics.usage.totalRequests}

# HELP url_safety_response_time_seconds Response time in seconds
# TYPE url_safety_response_time_seconds histogram
url_safety_response_time_seconds_avg ${metrics.performance.responseTime.avg / 1000}
url_safety_response_time_seconds_p95 ${metrics.performance.responseTime.p95 / 1000}
url_safety_response_time_seconds_p99 ${metrics.performance.responseTime.p99 / 1000}

# HELP url_safety_errors_total Total number of errors
# TYPE url_safety_errors_total counter
url_safety_errors_total ${metrics.performance.errors.total}

# HELP url_safety_memory_usage_bytes Memory usage in bytes
# TYPE url_safety_memory_usage_bytes gauge
url_safety_memory_usage_bytes ${metrics.resources.memory.used * 1024 * 1024}

# HELP url_safety_uptime_seconds Uptime in seconds
# TYPE url_safety_uptime_seconds gauge
url_safety_uptime_seconds ${metrics.uptime / 1000}

# HELP url_safety_api_calls_total API calls per service
# TYPE url_safety_api_calls_total counter
url_safety_api_calls_total{service="virustotal"} ${metrics.apiStatus.virusTotal.requestsToday}
url_safety_api_calls_total{service="google_safe_browsing"} ${metrics.apiStatus.googleSafeBrowsing.requestsToday}
`.trim()

    return new NextResponse(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate Prometheus metrics' },
      { status: 500 }
    )
  }
}