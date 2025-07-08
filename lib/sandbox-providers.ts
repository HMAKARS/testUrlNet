// 샌드박스 브라우징 제공자 설정

export interface SandboxProvider {
  name: string
  displayName: string
  description: string
  url: string
  features: string[]
  pricing: 'free' | 'freemium' | 'paid'
  recommended: boolean
}

export const sandboxProviders: SandboxProvider[] = [
  {
    name: 'browserling',
    displayName: 'Browserling',
    description: '웹 기반 브라우저 테스팅 플랫폼',
    url: 'https://www.browserling.com/browse/win/10/chrome/120/',
    features: [
      '실시간 상호작용',
      '여러 브라우저 지원',
      '익명 브라우징',
      '스크린샷 캡처'
    ],
    pricing: 'freemium',
    recommended: true
  },
  {
    name: 'any-run',
    displayName: 'Any.Run',
    description: '악성코드 분석 샌드박스',
    url: 'https://app.any.run/',
    features: [
      '상세한 행동 분석',
      '네트워크 트래픽 모니터링',
      '파일 시스템 변경 추적',
      'API 호출 분석'
    ],
    pricing: 'freemium',
    recommended: true
  },
  {
    name: 'joesandbox',
    displayName: 'Joe Sandbox',
    description: '전문가용 악성코드 분석 플랫폼',
    url: 'https://www.joesandbox.com/',
    features: [
      '딥 악성코드 분석',
      '행동 기반 탐지',
      '상세한 보고서',
      'API 지원'
    ],
    pricing: 'paid',
    recommended: false
  },
  {
    name: 'hybrid-analysis',
    displayName: 'Hybrid Analysis',
    description: 'Falcon Sandbox 기반 무료 분석',
    url: 'https://www.hybrid-analysis.com/',
    features: [
      '무료 파일 분석',
      'URL 스캔',
      '커뮤니티 위협 정보',
      '상세 리포트'
    ],
    pricing: 'free',
    recommended: true
  },
  {
    name: 'urlvoid',
    displayName: 'URLVoid',
    description: '다중 엔진 URL 검사',
    url: 'https://www.urlvoid.com/',
    features: [
      '30+ 보안 엔진',
      '도메인 평판 검사',
      'WHOIS 정보',
      '블랙리스트 확인'
    ],
    pricing: 'free',
    recommended: false
  }
]

// 브라우저 격리 API 엔드포인트
export const isolationAPIs = {
  // Cloudflare Browser Isolation
  cloudflare: {
    endpoint: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/gateway/browser_isolation',
    documentation: 'https://developers.cloudflare.com/cloudflare-one/policies/browser-isolation/'
  },
  
  // Menlo Security
  menlo: {
    endpoint: 'https://admin.menlosecurity.com/api/v1/isolation',
    documentation: 'https://docs.menlosecurity.com/'
  },
  
  // Symantec Web Isolation
  symantec: {
    endpoint: 'https://portal.threatpulse.com/api/isolation',
    documentation: 'https://support.symantec.com/en_US/article.TECH242701.html'
  }
}

// 로컬 샌드박스 설정 (Docker 기반)
export const dockerSandboxConfig = {
  image: 'browserless/chrome:latest',
  options: {
    // 보안 설정
    securityOpt: [
      'no-new-privileges:true',
      'seccomp=chrome.json'
    ],
    
    // 리소스 제한
    memory: '1g',
    cpus: '0.5',
    
    // 네트워크 격리
    networkMode: 'none',
    
    // 읽기 전용 파일시스템
    readOnly: true,
    
    // 임시 파일시스템
    tmpfs: {
      '/tmp': 'rw,noexec,nosuid,size=100m',
      '/var/run': 'rw,noexec,nosuid,size=10m'
    },
    
    // 환경 변수
    env: {
      'CHROME_FLAGS': '--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox',
      'MAX_CONCURRENT_SESSIONS': '1',
      'PREBOOT_CHROME': 'true',
      'KEEP_ALIVE': 'false'
    }
  }
}

// 스크린샷 전용 API
export const screenshotAPIs = [
  {
    name: 'Screenshotlayer',
    endpoint: 'https://api.screenshotlayer.com/api/capture',
    requiresKey: true,
    freeQuota: 100
  },
  {
    name: 'ScreenshotAPI',
    endpoint: 'https://shot.screenshotapi.net/screenshot',
    requiresKey: true,
    freeQuota: 100
  },
  {
    name: 'Microlink',
    endpoint: 'https://api.microlink.io',
    requiresKey: false,
    freeQuota: 50
  }
]