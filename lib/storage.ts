// 캐싱 및 로컬 스토리지 관리 유틸리티

export interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
  hits: number
  lastAccessed: number
}

export interface StorageOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items
  compress?: boolean // Compress data
  encrypt?: boolean // Encrypt sensitive data
}

/**
 * 메모리 기반 캐시 클래스
 */
class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 100, defaultTTL: number = 300000) { // 5분 기본 TTL
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiry = now + (ttl || this.defaultTTL)

    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiry,
      hits: 0,
      lastAccessed: now
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    
    // 만료 확인
    if (now > item.expiry) {
      this.cache.delete(key)
      return null
    }

    // 사용 통계 업데이트
    item.hits++
    item.lastAccessed = now

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // 만료된 아이템 확인
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  getStats(): {
    size: number
    totalHits: number
    oldestItem: number
    newestItem: number
  } {
    let totalHits = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    this.cache.forEach(item => {
      totalHits += item.hits
      if (item.timestamp < oldestTimestamp) oldestTimestamp = item.timestamp
      if (item.timestamp > newestTimestamp) newestTimestamp = item.timestamp
    })

    return {
      size: this.cache.size,
      totalHits,
      oldestItem: oldestTimestamp,
      newestItem: newestTimestamp
    }
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestAccess = Date.now()

    this.cache.forEach((item, key) => {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * 로컬 스토리지 래퍼 클래스
 */
class StorageManager {
  private prefix: string
  private isAvailable: boolean

  constructor(prefix: string = 'url-safety-') {
    this.prefix = prefix
    this.isAvailable = this.checkAvailability()
  }

  private checkAvailability(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }

      const testKey = '__test__'
      window.localStorage.setItem(testKey, 'test')
      window.localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  set<T>(key: string, data: T, options: StorageOptions = {}): boolean {
    if (!this.isAvailable) return false

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (options.ttl || 24 * 60 * 60 * 1000), // 24시간 기본
        hits: 0,
        lastAccessed: Date.now()
      }

      let serializedData = JSON.stringify(item)

      // 압축 (선택사항)
      if (options.compress) {
        serializedData = this.compress(serializedData)
      }

      // 암호화 (선택사항)
      if (options.encrypt) {
        serializedData = this.encrypt(serializedData)
      }

      localStorage.setItem(this.getKey(key), serializedData)
      return true
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
      return false
    }
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable) return null

    try {
      let data = localStorage.getItem(this.getKey(key))
      if (!data) return null

      // 복호화
      if (data.startsWith('encrypted:')) {
        data = this.decrypt(data)
      }

      // 압축 해제
      if (data.startsWith('compressed:')) {
        data = this.decompress(data)
      }

      const item: CacheItem<T> = JSON.parse(data)

      // 만료 확인
      if (Date.now() > item.expiry) {
        this.delete(key)
        return null
      }

      // 사용 통계 업데이트
      item.hits++
      item.lastAccessed = Date.now()
      localStorage.setItem(this.getKey(key), JSON.stringify(item))

      return item.data
    } catch (error) {
      console.warn('Failed to get from localStorage:', error)
      this.delete(key) // 손상된 데이터 제거
      return null
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    if (!this.isAvailable) return false

    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch {
      return false
    }
  }

  clear(): boolean {
    if (!this.isAvailable) return false

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      )
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch {
      return false
    }
  }

  getAllKeys(): string[] {
    if (!this.isAvailable) return []

    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''))
  }

  getSize(): number {
    if (!this.isAvailable) return 0

    let totalSize = 0
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        totalSize += localStorage.getItem(key)?.length || 0
      }
    })
    return totalSize
  }

  cleanup(): number {
    if (!this.isAvailable) return 0

    let removed = 0
    const now = Date.now()

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const data = localStorage.getItem(key)
          if (data) {
            const item = JSON.parse(data)
            if (item.expiry && now > item.expiry) {
              localStorage.removeItem(key)
              removed++
            }
          }
        } catch {
          // 손상된 데이터 제거
          localStorage.removeItem(key)
          removed++
        }
      }
    })

    return removed
  }

  private compress(data: string): string {
    // 간단한 압축 시뮬레이션 (실제로는 LZ 알고리즘 사용)
    return 'compressed:' + btoa(data)
  }

  private decompress(data: string): string {
    return atob(data.replace('compressed:', ''))
  }

  private encrypt(data: string): string {
    // 간단한 암호화 시뮬레이션 (실제로는 Web Crypto API 사용)
    return 'encrypted:' + btoa(data)
  }

  private decrypt(data: string): string {
    return atob(data.replace('encrypted:', ''))
  }
}

// 싱글톤 인스턴스들
const memoryCache = new MemoryCache()
const storageManager = new StorageManager()

// 내보내기 함수들
export function cacheSet<T>(key: string, data: T, ttl?: number): void {
  memoryCache.set(key, data, ttl)
}

export function cacheGet<T>(key: string): T | null {
  return memoryCache.get(key)
}

export function cacheHas(key: string): boolean {
  return memoryCache.has(key)
}

export function cacheDelete(key: string): boolean {
  return memoryCache.delete(key)
}

export function cacheClear(): void {
  memoryCache.clear()
}

export function cacheStats() {
  return memoryCache.getStats()
}

// 로컬 스토리지 함수들
export function storageSet<T>(key: string, data: T, options?: StorageOptions): boolean {
  return storageManager.set(key, data, options)
}

export function storageGet<T>(key: string): T | null {
  return storageManager.get(key)
}

export function storageHas(key: string): boolean {
  return storageManager.has(key)
}

export function storageDelete(key: string): boolean {
  return storageManager.delete(key)
}

export function storageClear(): boolean {
  return storageManager.clear()
}

export function storageCleanup(): number {
  return storageManager.cleanup()
}

export function storageSize(): number {
  return storageManager.getSize()
}

// 특별한 캐싱 전략들

/**
 * URL 분석 결과 캐싱 (24시간)
 */
export function cacheAnalysisResult(url: string, result: any): void {
  const key = `analysis:${btoa(url)}`
  storageSet(key, result, { ttl: 24 * 60 * 60 * 1000 })
}

export function getCachedAnalysisResult(url: string): any | null {
  const key = `analysis:${btoa(url)}`
  return storageGet(key)
}

/**
 * 검사 이력 관리
 */
export function addToHistory(url: string, result: any): void {
  const history = storageGet<any[]>('history') || []
  
  // 중복 제거
  const filtered = history.filter(item => item.url !== url)
  
  // 새 항목 추가
  filtered.unshift({
    url,
    result,
    timestamp: Date.now()
  })

  // 최대 50개 항목만 유지
  const limited = filtered.slice(0, 50)
  
  storageSet('history', limited, { ttl: 30 * 24 * 60 * 60 * 1000 }) // 30일
}

export function getHistory(): any[] {
  return storageGet<any[]>('history') || []
}

export function clearHistory(): void {
  storageDelete('history')
}

/**
 * 설정 저장
 */
export function saveSettings(settings: Record<string, any>): void {
  storageSet('settings', settings, { ttl: 365 * 24 * 60 * 60 * 1000 }) // 1년
}

export function getSettings(): Record<string, any> {
  return storageGet<Record<string, any>>('settings') || {}
}

/**
 * 즐겨찾기 관리
 */
export function addToBookmarks(url: string, title?: string): void {
  const bookmarks = storageGet<any[]>('bookmarks') || []
  
  // 중복 확인
  if (bookmarks.some(item => item.url === url)) return
  
  bookmarks.push({
    url,
    title: title || url,
    timestamp: Date.now()
  })
  
  storageSet('bookmarks', bookmarks)
}

export function removeFromBookmarks(url: string): void {
  const bookmarks = storageGet<any[]>('bookmarks') || []
  const filtered = bookmarks.filter(item => item.url !== url)
  storageSet('bookmarks', filtered)
}

export function getBookmarks(): any[] {
  return storageGet<any[]>('bookmarks') || []
}

// 초기화 함수
export function initializeStorage(): void {
  // 앱 시작시 만료된 캐시 정리
  storageCleanup()
  
  // 정기적인 정리 작업 스케줄링 (1시간마다)
  if (typeof window !== 'undefined') {
    setInterval(() => {
      storageCleanup()
    }, 60 * 60 * 1000)
  }
}