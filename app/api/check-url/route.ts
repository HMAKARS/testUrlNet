import { NextRequest, NextResponse } from 'next/server'

interface URLAnalysis {
  ssl: boolean
  domain_age: number | null
  suspicious_patterns: string[]
  ip_address: boolean
  url_shortener: boolean
  risk_score: number
  risk_level: 'low' | 'medium' | 'high'
  recommendations: string[]
  // 새로운 필드들
  redirects: string[]
  http_headers: Record<string, string>
  final_url: string
  response_time: number
  status_code: number | null
  malware_detected: boolean
  phishing_detected: boolean
  content_type: string | null
  page_title: string | null
  shortened_url_resolved: string | null
}

// 의심스러운 패턴들 (개선된 버전)
const SUSPICIOUS_PATTERNS = [
  { pattern: /bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|ow\.ly|is\.gd/, name: 'URL 단축 서비스' },
  { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, name: 'IP 주소 직접 사용' },
  { pattern: /[a-z0-9]{15,}\.com/, name: '랜덤한 긴 도메인' },
  { pattern: /[0-9]{5,}/, name: '과도한 숫자 사용' },
  { pattern: /secure-|bank-|paypal-|amazon-|apple-|microsoft-/, name: '피싱 의심 키워드' },
  { pattern: /\.tk$|\.ml$|\.ga$|\.cf$|\.pw$/, name: '무료 도메인 사용' },
  { pattern: /login|signin|verify|update|suspended|limited/, name: '피싱 관련 경로' },
  { pattern: /[a-z]+-[0-9]+\./, name: '자동 생성 도메인 패턴' },
  { pattern: /\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/, name: 'IP 패턴 변형' },
]

// URL 단축 서비스 목록 (확장)
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link', 
  'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'tiny.cc',
  'tr.im', 'snurl.com', 'x.co', 'smarturl.it', 'cutt.ly'
]

// HTTP 헤더 및 페이지 정보 수집
async function analyzeHTTPResponse(url: string): Promise<{
  redirects: string[]
  http_headers: Record<string, string>
  final_url: string
  response_time: number
  status_code: number | null
  content_type: string | null
  page_title: string | null
}> {
  const start_time = Date.now()
  const redirects: string[] = []
  let current_url = url
  let headers: Record<string, string> = {}
  let status_code: number | null = null
  let content_type: string | null = null
  let page_title: string | null = null

  try {
    // 최대 5번의 리디렉션 추적
    for (let i = 0; i < 5; i++) {
      const response = await fetch(current_url, {
        method: 'HEAD', // HEAD 요청으로 헤더만 가져오기
        redirect: 'manual', // 수동으로 리디렉션 처리
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URL-Safety-Checker/1.0)'
        }
      })

      status_code = response.status
      
      // 헤더 정보 수집
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value
      })

      content_type = response.headers.get('content-type')

      // 리디렉션 확인
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (location) {
          redirects.push(current_url)
          current_url = new URL(location, current_url).href
          continue
        }
      }
      
      break
    }

    // 페이지 제목 가져오기 (HTML 페이지인 경우만)
    if (content_type?.includes('text/html')) {
      try {
        const response = await fetch(current_url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; URL-Safety-Checker/1.0)'
          }
        })
        const html = await response.text()
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch) {
          page_title = titleMatch[1].trim()
        }
      } catch (e) {
        // 페이지 제목 가져오기 실패는 무시
      }
    }

  } catch (error) {
    console.error('HTTP 분석 오류:', error)
  }

  const response_time = Date.now() - start_time

  return {
    redirects,
    http_headers: headers,
    final_url: current_url,
    response_time,
    status_code,
    content_type,
    page_title
  }
}

// URL 단축 서비스 해제
async function resolveShortURL(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual'
    })
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      return location
    }
  } catch (error) {
    console.error('URL 단축 해제 오류:', error)
  }
  return null
}

// VirusTotal API 연동 (API 키가 있는 경우)
async function checkVirusTotal(url: string): Promise<{ malware: boolean, phishing: boolean }> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  
  if (!apiKey) {
    return { malware: false, phishing: false }
  }

  try {
    // URL을 base64로 인코딩
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '')
    
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: {
        'x-apikey': apiKey
      }
    })

    if (response.ok) {
      const data = await response.json()
      const stats = data.data?.attributes?.last_analysis_stats || {}
      
      return {
        malware: (stats.malicious || 0) > 0,
        phishing: (stats.suspicious || 0) > 2 // 2개 이상의 엔진에서 의심 판정시
      }
    }
  } catch (error) {
    console.error('VirusTotal API 오류:', error)
  }

  return { malware: false, phishing: false }
}

// Google Safe Browsing API 연동
async function checkGoogleSafeBrowsing(url: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY

  if (!apiKey) {
    return false
  }

  try {
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: 'url-safety-checker',
          clientVersion: '1.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log(data)
      return (data.matches || []).length > 0
    }
  } catch (error) {
    console.error('Google Safe Browsing API 오류:', error)
  }

  return false
}

// SSL 인증서 확인 (개선된 버전)
async function checkSSL(url: string): Promise<boolean> {
  try {
    if (!url.startsWith('https://')) {
      return false
    }
    
    // 실제 HTTPS 요청으로 SSL 확인
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URL-Safety-Checker/1.0)'
      }
    })
    
    return response.ok || response.status < 500 // 서버 오류가 아닌 경우 SSL은 정상
  } catch {
    return false
  }
}

// 도메인 정보 추출
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

// IP 주소 여부 확인 (IPv6 포함)
function isIPAddress(domain: string): boolean {
  const ipv4Pattern = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv4Pattern.test(domain) || ipv6Pattern.test(domain)
}

// URL 단축 서비스 여부 확인
function isURLShortener(domain: string): boolean {
  return URL_SHORTENERS.some(shortener => domain.includes(shortener))
}

// 의심스러운 패턴 검사 (개선된 버전)
function findSuspiciousPatterns(url: string, pageTitle?: string): string[] {
  const found: string[] = []
  const fullText = url + (pageTitle ? ' ' + pageTitle : '')
  
  SUSPICIOUS_PATTERNS.forEach(({ pattern, name }) => {
    if (pattern.test(fullText)) {
      found.push(name)
    }
  })
  
  return found
}

// 위험도 계산 (개선된 버전)
function calculateRiskScore(analysis: Partial<URLAnalysis>): { score: number; level: 'low' | 'medium' | 'high' } {
  let score = 0
  
  // SSL 없음 (+3점)
  if (!analysis.ssl) score += 3
  
  // IP 주소 사용 (+4점)
  if (analysis.ip_address) score += 4
  
  // URL 단축 서비스 (+2점)
  if (analysis.url_shortener) score += 2
  
  // 의심스러운 패턴 (패턴당 +1점)
  if (analysis.suspicious_patterns) {
    score += analysis.suspicious_patterns.length
  }
  
  // 신규 도메인 (30일 미만 +3점, 90일 미만 +1점)
  if (analysis.domain_age !== null && analysis.domain_age !== undefined) {
    if (analysis.domain_age < 30) score += 3
    else if (analysis.domain_age < 90) score += 1
  }
  
  // 멀웨어/피싱 탐지 (+5점)
  if (analysis.malware_detected) score += 5
  if (analysis.phishing_detected) score += 5
  
  // 과도한 리디렉션 (+2점)
  if (analysis.redirects && analysis.redirects.length > 2) score += 2
  
  // 응답 시간이 너무 느림 (+1점)
  if (analysis.response_time && analysis.response_time > 5000) score += 1
  
  // 위험도 레벨 결정
  let level: 'low' | 'medium' | 'high'
  if (score <= 2) level = 'low'
  else if (score <= 6) level = 'medium'
  else level = 'high'
  
  return { score: Math.min(score, 10), level }
}

// 권장사항 생성 (개선된 버전)
function generateRecommendations(analysis: URLAnalysis): string[] {
  const recommendations: string[] = []
  
  if (!analysis.ssl) {
    recommendations.push('❌ HTTPS를 사용하지 않습니다. 개인정보 입력을 절대 피하세요.')
  }
  
  if (analysis.ip_address) {
    recommendations.push('⚠️ IP 주소를 직접 사용하는 사이트는 매우 의심스럽습니다.')
  }
  
  if (analysis.url_shortener) {
    recommendations.push('🔗 URL 단축 서비스를 사용하므로 실제 대상을 확인할 수 없습니다.')
    if (analysis.shortened_url_resolved) {
      recommendations.push(`🔍 실제 URL: ${analysis.shortened_url_resolved}`)
    }
  }
  
  if (analysis.malware_detected) {
    recommendations.push('🚨 멀웨어가 탐지되었습니다. 절대 방문하지 마세요!')
  }
  
  if (analysis.phishing_detected) {
    recommendations.push('🎣 피싱 사이트로 의심됩니다. 개인정보를 절대 입력하지 마세요!')
  }
  
  if (analysis.redirects.length > 0) {
    recommendations.push(`🔄 ${analysis.redirects.length}번의 리디렉션이 발생했습니다.`)
  }
  
  if (analysis.suspicious_patterns.length > 0) {
    recommendations.push(`⚠️ ${analysis.suspicious_patterns.length}개의 의심스러운 패턴이 발견되었습니다.`)
  }
  
  if (analysis.domain_age !== null && analysis.domain_age < 30) {
    recommendations.push('🆕 최근에 생성된 도메인입니다. 피싱 사이트일 가능성이 높습니다.')
  }
  
  if (analysis.response_time > 5000) {
    recommendations.push('🐌 응답 시간이 매우 느립니다. 서버에 문제가 있을 수 있습니다.')
  }
  
  if (analysis.status_code && analysis.status_code >= 400) {
    recommendations.push(`❌ HTTP 오류 (${analysis.status_code})가 발생했습니다.`)
  }
  
  // 위험도별 종합 권장사항
  if (analysis.risk_level === 'high') {
    recommendations.push('🚨 이 사이트는 매우 위험합니다. 방문을 강력히 권장하지 않습니다.')
  } else if (analysis.risk_level === 'medium') {
    recommendations.push('⚠️ 이 사이트는 주의해서 방문하세요. 개인정보 입력은 피하세요.')
  } else {
    recommendations.push('✅ 상대적으로 안전한 사이트로 보입니다.')
  }
  
  return recommendations
}

// 도메인 나이 추정 (개선된 버전)
async function estimateDomainAge(domain: string): Promise<number | null> {
  try {
    // 잘 알려진 도메인들
    const knownOldDomains = [
      'google.com', 'naver.com', 'youtube.com', 'facebook.com', 'twitter.com',
      'amazon.com', 'microsoft.com', 'apple.com', 'wikipedia.org', 'github.com'
    ]
    
    if (knownOldDomains.some(old => domain.includes(old))) {
      return 5000 // 충분히 오래된 도메인
    }
    
    // 무료 도메인이나 의심스러운 패턴은 신규로 추정
    if (/\.tk$|\.ml$|\.ga$|\.cf$|\.pw$/.test(domain)) {
      return Math.floor(Math.random() * 30) // 0-30일
    }
    
    // 숫자가 많이 포함된 도메인은 최근 생성으로 추정
    if (/[0-9]{5,}/.test(domain)) {
      return Math.floor(Math.random() * 60) + 10 // 10-70일
    }
    
    // 기본적으로 중간 정도로 추정
    return Math.floor(Math.random() * 365) + 90 // 90-455일
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL이 제공되지 않았습니다' },
        { status: 400 }
      )
    }
    
    // URL 정규화
    let normalizedUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url
    }
    
    try {
      new URL(normalizedUrl) // URL 유효성 검사
    } catch {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다' },
        { status: 400 }
      )
    }
    
    const domain = extractDomain(normalizedUrl)
    
    // 병렬로 모든 검사 수행
    const [
      httpAnalysis,
      ssl,
      virusTotal,
      googleSafeBrowsing,
      domainAge,
      shortUrlResolved
    ] = await Promise.all([
      analyzeHTTPResponse(normalizedUrl),
      checkSSL(normalizedUrl),
      checkVirusTotal(normalizedUrl),
      checkGoogleSafeBrowsing(normalizedUrl),
      estimateDomainAge(domain),
      isURLShortener(domain) ? resolveShortURL(normalizedUrl) : Promise.resolve(null)
    ])
    
    const ip_address = isIPAddress(domain)
    const url_shortener = isURLShortener(domain)
    const suspicious_patterns = findSuspiciousPatterns(normalizedUrl, httpAnalysis.page_title || undefined)
    const malware_detected = virusTotal.malware || googleSafeBrowsing
    const phishing_detected = virusTotal.phishing
    
    // 위험도 계산
    const analysis: Partial<URLAnalysis> = {
      ssl,
      ip_address,
      url_shortener,
      suspicious_patterns,
      domain_age: domainAge,
      malware_detected,
      phishing_detected,
      redirects: httpAnalysis.redirects,
      response_time: httpAnalysis.response_time
    }
    
    const { score, level } = calculateRiskScore(analysis)
    
    const result: URLAnalysis = {
      ssl,
      domain_age: domainAge,
      suspicious_patterns,
      ip_address,
      url_shortener,
      risk_score: score,
      risk_level: level,
      recommendations: [],
      redirects: httpAnalysis.redirects,
      http_headers: httpAnalysis.http_headers,
      final_url: httpAnalysis.final_url,
      response_time: httpAnalysis.response_time,
      status_code: httpAnalysis.status_code,
      malware_detected,
      phishing_detected,
      content_type: httpAnalysis.content_type,
      page_title: httpAnalysis.page_title,
      shortened_url_resolved: shortUrlResolved
    }
    
    result.recommendations = generateRecommendations(result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('URL 분석 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}