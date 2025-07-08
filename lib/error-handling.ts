// 포괄적인 에러 처리 및 로깅 시스템

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  context?: string
  metadata?: Record<string, any>
  stack?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
}

export interface ErrorInfo {
  name: string
  message: string
  stack?: string
  code?: string | number
  statusCode?: number
  context?: string
  metadata?: Record<string, any>
  timestamp: number
  recovery?: string[]
}

/**
 * 커스텀 에러 클래스들
 */
export class URLAnalysisError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly context: string
  public readonly metadata: Record<string, any>
  public readonly recovery: string[]

  constructor(
    message: string,
    code: string = 'URL_ANALYSIS_ERROR',
    statusCode: number = 500,
    context: string = 'analysis',
    metadata: Record<string, any> = {},
    recovery: string[] = []
  ) {
    super(message)
    this.name = 'URLAnalysisError'
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.metadata = metadata
    this.recovery = recovery
  }
}

export class NetworkError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly retryAfter?: number

  constructor(
    message: string,
    statusCode: number = 0,
    retryAfter?: number
  ) {
    super(message)
    this.name = 'NetworkError'
    this.code = 'NETWORK_ERROR'
    this.statusCode = statusCode
    this.retryAfter = retryAfter
  }
}

export class ValidationError extends Error {
  public readonly field: string
  public readonly value: any

  constructor(message: string, field: string, value: any) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
  }
}

export class RateLimitError extends Error {
  public readonly retryAfter: number

  constructor(message: string, retryAfter: number) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * 로거 클래스
 */
class Logger {
  private level: LogLevel = LogLevel.INFO
  private sessionId: string
  private logs: LogEntry[] = []
  private maxLogs: number = 1000

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandling()
  }

  private generateSessionId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    if (level < this.level) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      metadata,
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // 스택 추적 (에러 레벨 이상)
    if (level >= LogLevel.ERROR) {
      entry.stack = new Error().stack
    }

    this.logs.push(entry)

    // 로그 크기 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // 콘솔 출력
    this.outputToConsole(entry)

    // 외부 로깅 서비스 전송
    this.sendToLoggingService(entry)

    // 로컬 스토리지 저장 (에러만)
    if (level >= LogLevel.ERROR) {
      this.saveToLocalStorage(entry)
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context, metadata)
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, metadata)
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, metadata)
  }

  error(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, metadata)
  }

  fatal(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, context, metadata)
  }

  logError(error: Error, context?: string, metadata?: Record<string, any>): void {
    const errorInfo: ErrorInfo = this.extractErrorInfo(error, context, metadata)
    
    this.log(
      LogLevel.ERROR,
      errorInfo.message,
      errorInfo.context,
      {
        ...errorInfo.metadata,
        name: errorInfo.name,
        code: errorInfo.code,
        statusCode: errorInfo.statusCode,
        stack: errorInfo.stack,
        recovery: errorInfo.recovery
      }
    )
  }

  private extractErrorInfo(error: Error, context?: string, metadata?: Record<string, any>): ErrorInfo {
    let code: string | number = 'UNKNOWN_ERROR'
    let statusCode = 500
    let recovery: string[] = ['페이지를 새로고침해보세요']

    // 커스텀 에러 타입별 처리
    if (error instanceof URLAnalysisError) {
      code = error.code
      statusCode = error.statusCode
      recovery = error.recovery.length > 0 ? error.recovery : recovery
    } else if (error instanceof NetworkError) {
      code = error.code
      statusCode = error.statusCode
      recovery = [
        '인터넷 연결을 확인해주세요',
        '잠시 후 다시 시도해보세요'
      ]
      if (error.retryAfter) {
        recovery.push(`${error.retryAfter}초 후 다시 시도하세요`)
      }
    } else if (error instanceof ValidationError) {
      code = 'VALIDATION_ERROR'
      statusCode = 400
      recovery = [`${error.field} 필드를 다시 확인해주세요`]
    } else if (error instanceof RateLimitError) {
      code = 'RATE_LIMIT_ERROR'
      statusCode = 429
      recovery = [`${error.retryAfter}초 후 다시 시도해주세요`]
    }

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code,
      statusCode,
      context: context || 'unknown',
      metadata: metadata || {},
      timestamp: Date.now(),
      recovery
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString()
    const levelName = LogLevel[entry.level]
    const prefix = `[${timestamp}] [${levelName}] ${entry.context ? `[${entry.context}]` : ''}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.metadata)
        break
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.metadata)
        break
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.metadata)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(prefix, entry.message, entry.metadata)
        if (entry.stack) console.error(entry.stack)
        break
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // 외부 로깅 서비스로 전송 (Sentry, LogRocket 등)
    if (process.env.NEXT_PUBLIC_LOGGING_ENDPOINT && entry.level >= LogLevel.WARN) {
      fetch(process.env.NEXT_PUBLIC_LOGGING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(error => {
        console.warn('Failed to send log to external service:', error)
      })
    }

    // Sentry 연동 (있는 경우)
    if (typeof window !== 'undefined' && (window as any).Sentry && entry.level >= LogLevel.ERROR) {
      (window as any).Sentry.captureMessage(entry.message, {
        level: entry.level >= LogLevel.FATAL ? 'fatal' : 'error',
        contexts: {
          log: {
            timestamp: entry.timestamp,
            context: entry.context,
            metadata: entry.metadata
          }
        }
      })
    }
  }

  private saveToLocalStorage(entry: LogEntry): void {
    if (typeof window === 'undefined' || !window.localStorage) return

    try {
      const key = 'error_logs'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(entry)

      // 최대 50개 에러 로그만 저장
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50)
      }

      localStorage.setItem(key, JSON.stringify(existing))
    } catch (error) {
      console.warn('Failed to save error log to localStorage:', error)
    }
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // 전역 JavaScript 에러 처리
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), 'global_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Promise rejection 처리
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      this.logError(error, 'unhandled_rejection')
    })

    // 리소스 로딩 에러 처리
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.error('Resource loading failed', 'resource_error', {
          tagName: (event.target as Element).tagName,
          src: (event.target as any).src || (event.target as any).href
        })
      }
    }, true)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level)
    }
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  getLogSummary(): {
    total: number
    byLevel: Record<string, number>
    recentErrors: LogEntry[]
  } {
    const byLevel: Record<string, number> = {}
    let recentErrors: LogEntry[] = []

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level]
      byLevel[levelName] = (byLevel[levelName] || 0) + 1

      if (log.level >= LogLevel.ERROR && recentErrors.length < 10) {
        recentErrors.push(log)
      }
    })

    recentErrors = recentErrors.sort((a, b) => b.timestamp - a.timestamp)

    return {
      total: this.logs.length,
      byLevel,
      recentErrors
    }
  }
}

// 싱글톤 로거 인스턴스
const logger = new Logger()

// 편의 함수들
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level)
}

export function debug(message: string, context?: string, metadata?: Record<string, any>): void {
  logger.debug(message, context, metadata)
}

export function info(message: string, context?: string, metadata?: Record<string, any>): void {
  logger.info(message, context, metadata)
}

export function warn(message: string, context?: string, metadata?: Record<string, any>): void {
  logger.warn(message, context, metadata)
}

export function error(message: string, context?: string, metadata?: Record<string, any>): void {
  logger.error(message, context, metadata)
}

export function fatal(message: string, context?: string, metadata?: Record<string, any>): void {
  logger.fatal(message, context, metadata)
}

export function logError(error: Error, context?: string, metadata?: Record<string, any>): void {
  logger.logError(error, context, metadata)
}

export function getLogs(level?: LogLevel): LogEntry[] {
  return logger.getLogs(level)
}

export function clearLogs(): void {
  logger.clearLogs()
}

export function exportLogs(): string {
  return logger.exportLogs()
}

export function getLogSummary() {
  return logger.getLogSummary()
}

// 에러 복구 도우미 함수들

/**
 * 재시도 로직을 포함한 함수 실행
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debug(`Attempt ${attempt}/${maxRetries}`, context)
      return await fn()
    } catch (error) {
      lastError = error as Error
      warn(`Attempt ${attempt} failed: ${lastError.message}`, context, { attempt, maxRetries })

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  if (lastError) {
    error(`All ${maxRetries} attempts failed`, context, { maxRetries })
    throw lastError
  }

  throw new Error('Unexpected error in retry logic')
}

/**
 * 타임아웃을 포함한 함수 실행
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  context?: string
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error(`Operation timed out after ${timeoutMs}ms`)
        warn('Operation timed out', context, { timeoutMs })
        reject(timeoutError)
      }, timeoutMs)
    })
  ])
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(json: string, defaultValue: T, context?: string): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    warn('JSON parsing failed, using default value', context, { json: json.substring(0, 100) })
    return defaultValue
  }
}

/**
 * 안전한 함수 실행 (에러를 로깅하고 기본값 반환)
 */
export function safeExecute<T>(
  fn: () => T,
  defaultValue: T,
  context?: string
): T {
  try {
    return fn()
  } catch (error) {
    logError(error as Error, context)
    return defaultValue
  }
}

/**
 * 비동기 함수의 안전한 실행
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  context?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    logError(error as Error, context)
    return defaultValue
  }
}

// 에러 리포팅 도우미
export function reportError(error: Error, userFeedback?: string): void {
  logError(error, 'user_report', { userFeedback })

  // 사용자에게 피드백 제공
  if (typeof window !== 'undefined') {
    // Toast 알림 등으로 사용자에게 알림
    console.info('에러가 보고되었습니다. 빠른 시일 내에 수정하겠습니다.')
  }
}

// 개발 모드에서만 작동하는 디버그 로거
export function devLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] ${message}`, data)
  }
}

// 성능 측정과 함께 에러 로깅
export function logWithPerformance(error: Error, startTime: number, context?: string): void {
  const duration = Date.now() - startTime
  logError(error, context, { duration })
}