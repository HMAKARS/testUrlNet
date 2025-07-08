// 성능 모니터링 및 Web Vitals 측정

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  
  // 추가 메트릭스
  FCP?: number // First Contentful Paint
  TTFB?: number // Time to First Byte
  INP?: number // Interaction to Next Paint
  
  // 커스텀 메트릭스
  apiResponseTime?: number
  analysisTime?: number
  pageLoadTime?: number
  userEngagement?: number
}

export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  sessionId: string
  userId?: string
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observer: PerformanceObserver | null = null
  private sessionId: string
  private events: AnalyticsEvent[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeObserver()
    this.trackPageLoad()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private initializeObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      // Web Vitals 모니터링
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry)
        }
      })

      // 다양한 성능 메트릭 관찰
      this.observer.observe({ entryTypes: ['paint', 'navigation', 'resource', 'measure'] })

      // Layout Shift 관찰
      if ('LayoutShiftAttribution' in window) {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.metrics.CLS = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      }

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error)
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime
        }
        break

      case 'largest-contentful-paint':
        this.metrics.LCP = entry.startTime
        break

      case 'first-input':
        this.metrics.FID = (entry as any).processingStart - entry.startTime
        break

      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming
        this.metrics.TTFB = navEntry.responseStart - navEntry.requestStart
        this.metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.fetchStart
        break

      case 'resource':
        // API 호출 응답 시간 측정
        if (entry.name.includes('/api/')) {
          this.metrics.apiResponseTime = entry.duration
        }
        break

      case 'measure':
        // 커스텀 측정값들
        if (entry.name === 'url-analysis-time') {
          this.metrics.analysisTime = entry.duration
        }
        break
    }
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      // 페이지 로드 완료 시 최종 메트릭 수집
      setTimeout(() => {
        this.collectFinalMetrics()
      }, 1000)
    })
  }

  private collectFinalMetrics() {
    // Navigation Timing API 사용
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        this.metrics.TTFB = navigation.responseStart - navigation.requestStart
      }
    }

    // 메트릭 점수 계산
    this.calculatePerformanceScore()
  }

  private calculatePerformanceScore(): number {
    let score = 100
    
    // LCP 점수 (2.5초 이하 = 좋음)
    if (this.metrics.LCP) {
      if (this.metrics.LCP > 4000) score -= 30
      else if (this.metrics.LCP > 2500) score -= 15
    }

    // FID 점수 (100ms 이하 = 좋음)
    if (this.metrics.FID) {
      if (this.metrics.FID > 300) score -= 25
      else if (this.metrics.FID > 100) score -= 10
    }

    // CLS 점수 (0.1 이하 = 좋음)
    if (this.metrics.CLS) {
      if (this.metrics.CLS > 0.25) score -= 20
      else if (this.metrics.CLS > 0.1) score -= 10
    }

    // API 응답 시간 점수
    if (this.metrics.apiResponseTime) {
      if (this.metrics.apiResponseTime > 3000) score -= 15
      else if (this.metrics.apiResponseTime > 1000) score -= 5
    }

    return Math.max(0, score)
  }

  // 커스텀 메트릭 측정 시작
  public startMeasure(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  }

  // 커스텀 메트릭 측정 종료
  public endMeasure(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }

  // 이벤트 추적
  public trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>) {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId
    }

    this.events.push(analyticsEvent)

    // 로컬 스토리지에 저장 (선택사항)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
        existingEvents.push(analyticsEvent)
        
        // 최대 100개 이벤트만 저장
        if (existingEvents.length > 100) {
          existingEvents.splice(0, existingEvents.length - 100)
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(existingEvents))
      } catch (error) {
        console.warn('Failed to save analytics event:', error)
      }
    }

    // 외부 분석 도구로 전송 (Google Analytics 등)
    this.sendToAnalytics(analyticsEvent)
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Google Analytics 4 이벤트 전송
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameter_session_id: event.sessionId
      })
    }

    // 자체 분석 서버로 전송 (선택사항)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        console.warn('Failed to send analytics event:', error)
      })
    }
  }

  // 현재 메트릭 반환
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // 성능 리포트 생성
  public generateReport(): {
    score: number
    metrics: PerformanceMetrics
    recommendations: string[]
  } {
    const score = this.calculatePerformanceScore()
    const recommendations: string[] = []

    if (this.metrics.LCP && this.metrics.LCP > 2500) {
      recommendations.push('LCP(Largest Contentful Paint)를 개선하세요. 이미지 최적화나 서버 응답 시간 단축이 필요합니다.')
    }

    if (this.metrics.FID && this.metrics.FID > 100) {
      recommendations.push('FID(First Input Delay)를 개선하세요. JavaScript 실행 시간을 줄이거나 코드 분할을 고려하세요.')
    }

    if (this.metrics.CLS && this.metrics.CLS > 0.1) {
      recommendations.push('CLS(Cumulative Layout Shift)를 개선하세요. 이미지와 광고에 크기를 명시하세요.')
    }

    if (this.metrics.apiResponseTime && this.metrics.apiResponseTime > 1000) {
      recommendations.push('API 응답 시간이 느립니다. 서버 최적화나 캐싱을 고려하세요.')
    }

    return {
      score,
      metrics: this.metrics,
      recommendations
    }
  }

  // 정리 함수
  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// 싱글톤 인스턴스
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

// Web Vitals 측정을 위한 유틸리티 함수들
export function measureWebVitals(callback: (metric: PerformanceMetrics) => void) {
  const monitor = getPerformanceMonitor()
  
  // 2초 후 초기 메트릭 반환
  setTimeout(() => {
    callback(monitor.getMetrics())
  }, 2000)

  // 5초 후 최종 메트릭 반환
  setTimeout(() => {
    callback(monitor.getMetrics())
  }, 5000)
}

// 사용자 상호작용 추적
export function trackUserInteraction(action: string, label?: string, value?: number) {
  const monitor = getPerformanceMonitor()
  monitor.trackEvent({
    event: 'user_interaction',
    category: 'engagement',
    action,
    label,
    value
  })
}

// URL 분석 성능 추적
export function trackAnalysisPerformance(url: string, startTime: number, endTime: number, success: boolean) {
  const monitor = getPerformanceMonitor()
  const duration = endTime - startTime

  monitor.trackEvent({
    event: 'url_analysis',
    category: 'performance',
    action: success ? 'analysis_success' : 'analysis_error',
    label: new URL(url).hostname,
    value: duration
  })
}

// 에러 추적
export function trackError(error: Error, context?: string) {
  const monitor = getPerformanceMonitor()
  monitor.trackEvent({
    event: 'error',
    category: 'reliability',
    action: 'javascript_error',
    label: error.message,
    metadata: {
      stack: error.stack,
      context
    }
  })
}