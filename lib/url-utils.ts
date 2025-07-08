// URL 처리 관련 유틸리티 함수들

export interface ParsedURL {
  protocol: string
  hostname: string
  port?: string
  pathname: string
  search: string
  hash: string
  isValid: boolean
  isSecure: boolean
  isLocalhost: boolean
  isIP: boolean
  domain: string
  subdomain?: string
  tld?: string
}

/**
 * URL을 파싱하고 다양한 정보를 추출합니다
 */
export function parseURL(urlString: string): ParsedURL {
  const result: ParsedURL = {
    protocol: '',
    hostname: '',
    pathname: '',
    search: '',
    hash: '',
    isValid: false,
    isSecure: false,
    isLocalhost: false,
    isIP: false,
    domain: '',
  }

  try {
    // URL 정규화
    let normalizedURL = urlString.trim()
    if (!normalizedURL.startsWith('http://') && !normalizedURL.startsWith('https://')) {
      normalizedURL = 'https://' + normalizedURL
    }

    const url = new URL(normalizedURL)
    
    result.protocol = url.protocol
    result.hostname = url.hostname
    result.port = url.port
    result.pathname = url.pathname
    result.search = url.search
    result.hash = url.hash
    result.isValid = true
    result.isSecure = url.protocol === 'https:'
    result.isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    result.isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname)

    // 도메인 분석
    if (!result.isIP) {
      const parts = url.hostname.split('.')
      if (parts.length >= 2) {
        result.tld = parts[parts.length - 1]
        result.domain = parts[parts.length - 2] + '.' + result.tld
        
        if (parts.length > 2) {
          result.subdomain = parts.slice(0, -2).join('.')
        }
      }
    }

  } catch (error) {
    result.isValid = false
  }

  return result
}

/**
 * URL이 안전한지 기본적인 검증을 수행합니다
 */
export function isURLSafe(url: string): boolean {
  const parsed = parseURL(url)
  
  if (!parsed.isValid) return false
  
  // 위험한 스키마 체크
  const dangerousSchemes = ['javascript:', 'data:', 'file:', 'ftp:']
  if (dangerousSchemes.some(scheme => url.toLowerCase().startsWith(scheme))) {
    return false
  }

  // 위험한 도메인 패턴 체크
  const dangerousPatterns = [
    /[^\w.-]/,  // 특수문자가 포함된 도메인
    /\.\./,     // 연속된 점
    /-$/,       // 하이픈으로 끝나는 도메인
    /^-/,       // 하이픈으로 시작하는 도메인
  ]

  return !dangerousPatterns.some(pattern => pattern.test(parsed.hostname))
}

/**
 * 두 URL이 같은 도메인인지 확인합니다
 */
export function isSameDomain(url1: string, url2: string): boolean {
  const parsed1 = parseURL(url1)
  const parsed2 = parseURL(url2)
  
  return parsed1.isValid && parsed2.isValid && parsed1.domain === parsed2.domain
}

/**
 * URL을 단축합니다 (표시용)
 */
export function shortenURL(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  
  const parsed = parseURL(url)
  if (!parsed.isValid) return url.substring(0, maxLength) + '...'
  
  const domain = parsed.hostname
  const path = parsed.pathname + parsed.search
  
  if (domain.length >= maxLength - 3) {
    return domain.substring(0, maxLength - 3) + '...'
  }
  
  const remainingLength = maxLength - domain.length - 3 // 3 for "..."
  if (path.length > remainingLength) {
    return domain + path.substring(0, remainingLength) + '...'
  }
  
  return domain + path
}

/**
 * URL에서 민감한 정보를 제거합니다
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)
    
    // 쿼리 파라미터에서 민감한 정보 제거
    const sensitiveParams = ['password', 'token', 'api_key', 'secret', 'auth']
    const searchParams = new URLSearchParams(parsed.search)
    
    sensitiveParams.forEach(param => {
      searchParams.delete(param)
    })
    
    parsed.search = searchParams.toString()
    
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * URL이 단축 서비스인지 확인합니다
 */
export function isShortURL(url: string): boolean {
  const shortURLDomains = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link',
    'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'tiny.cc',
    'tr.im', 'snurl.com', 'x.co', 'smarturl.it', 'cutt.ly'
  ]
  
  const parsed = parseURL(url)
  return shortURLDomains.some(domain => parsed.hostname.includes(domain))
}

/**
 * URL의 위험도를 간단히 평가합니다
 */
export function assessURLRisk(url: string): {
  score: number
  factors: string[]
  level: 'low' | 'medium' | 'high'
} {
  const factors: string[] = []
  let score = 0
  
  const parsed = parseURL(url)
  
  if (!parsed.isValid) {
    factors.push('유효하지 않은 URL')
    score += 5
  }
  
  if (!parsed.isSecure) {
    factors.push('HTTPS 미사용')
    score += 3
  }
  
  if (parsed.isIP) {
    factors.push('IP 주소 직접 사용')
    score += 4
  }
  
  if (isShortURL(url)) {
    factors.push('URL 단축 서비스 사용')
    score += 2
  }
  
  // 의심스러운 도메인 패턴
  if (parsed.hostname.length > 50) {
    factors.push('비정상적으로 긴 도메인')
    score += 2
  }
  
  if (/\d{5,}/.test(parsed.hostname)) {
    factors.push('과도한 숫자 포함')
    score += 1
  }
  
  if (/[.-]{2,}/.test(parsed.hostname)) {
    factors.push('연속된 특수문자')
    score += 2
  }
  
  // 위험도 레벨 결정
  let level: 'low' | 'medium' | 'high'
  if (score <= 2) level = 'low'
  else if (score <= 6) level = 'medium'
  else level = 'high'
  
  return { score, factors, level }
}

/**
 * URL 목록에서 중복을 제거합니다
 */
export function deduplicateURLs(urls: string[]): string[] {
  const seen = new Set<string>()
  return urls.filter(url => {
    const normalized = parseURL(url).hostname.toLowerCase()
    if (seen.has(normalized)) {
      return false
    }
    seen.add(normalized)
    return true
  })
}

/**
 * URL이 이미지인지 확인합니다
 */
export function isImageURL(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
  const parsed = parseURL(url)
  return imageExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext))
}

/**
 * URL에서 파일 확장자를 추출합니다
 */
export function getFileExtension(url: string): string | null {
  const parsed = parseURL(url)
  const pathname = parsed.pathname
  const lastDot = pathname.lastIndexOf('.')
  
  if (lastDot === -1 || lastDot === pathname.length - 1) {
    return null
  }
  
  return pathname.substring(lastDot + 1).toLowerCase()
}

/**
 * 상대 URL을 절대 URL로 변환합니다
 */
export function resolveRelativeURL(baseURL: string, relativeURL: string): string {
  try {
    return new URL(relativeURL, baseURL).toString()
  } catch {
    return relativeURL
  }
}

/**
 * URL의 쿼리 파라미터를 객체로 변환합니다
 */
export function parseQueryParams(url: string): Record<string, string> {
  const parsed = parseURL(url)
  const params: Record<string, string> = {}
  
  if (parsed.search) {
    const searchParams = new URLSearchParams(parsed.search)
    searchParams.forEach((value, key) => {
      params[key] = value
    })
  }
  
  return params
}

/**
 * URL 목록을 도메인별로 그룹화합니다
 */
export function groupURLsByDomain(urls: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  
  urls.forEach(url => {
    const parsed = parseURL(url)
    const domain = parsed.domain || parsed.hostname
    
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(url)
  })
  
  return groups
}

/**
 * URL 배열을 위험도 순으로 정렬합니다
 */
export function sortURLsByRisk(urls: string[]): string[] {
  return urls.sort((a, b) => {
    const riskA = assessURLRisk(a)
    const riskB = assessURLRisk(b)
    return riskB.score - riskA.score
  })
}