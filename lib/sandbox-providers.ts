// 샌드박스 브라우징 제공자 설정

export interface SandboxProvider {
  name: string
  displayName: string
  description: string
  url: string
  features: string[]
  pricing: 'free' | 'freemium' | 'paid'
  recommended: boolean
  type: 'analysis' | 'proxy' | 'sandbox' | 'screenshot'
}

export const sandboxProviders: SandboxProvider[] = [
  // 보안 분석 서비스 (완전 무료)
  {
    name: 'urlscan',
    displayName: 'URLScan.io',
    description: '웹사이트를 안전하게 스캔하고 상세 리포트 제공',
    url: 'https://urlscan.io/search#',
    features: [
      '✅ 완전 무료',
      '스크린샷 제공',
      'DOM/네트워크 분석',
      '악성코드 탐지',
      'SSL 인증서 확인'
    ],
    pricing: 'free',
    recommended: true,
    type: 'analysis'
  },
  {
    name: 'virustotal',
    displayName: 'VirusTotal',
    description: 'Google의 무료 멀웨어/바이러스 검사 서비스',
    url: 'https://www.virustotal.com/gui/home/url',
    features: [
      '✅ 완전 무료',
      '70+ 안티바이러스 엔진',
      '상세한 보안 리포트',
      '커뮤니티 평가',
      'URL/파일 검사'
    ],
    pricing: 'free',
    recommended: true,
    type: 'analysis'
  },
  
  // 웹 프록시 서비스 (실시간 브라우징)
  {
    name: 'croxyproxy',
    displayName: 'CroxyProxy',
    description: '무료 웹 프록시로 안전하게 브라우징',
    url: 'https://www.croxyproxy.com/',
    features: [
      '✅ 완전 무료',
      '실시간 브라우징',
      'YouTube 지원',
      'SSL 암호화',
      '익명 브라우징'
    ],
    pricing: 'free',
    recommended: true,
    type: 'proxy'
  },
  {
    name: 'hideme',
    displayName: 'Hide.me Proxy',
    description: '무료 웹 프록시 서비스',
    url: 'https://hide.me/en/proxy',
    features: [
      '✅ 완전 무료',
      'SSL 지원',
      '쿠키/스크립트 차단',
      '여러 서버 위치',
      '광고 없음'
    ],
    pricing: 'free',
    recommended: false,
    type: 'proxy'
  },
  
  // 스크린샷 서비스
  {
    name: 'thum.io',
    displayName: 'Thum.io',
    description: '실시간 웹사이트 스크린샷 생성',
    url: 'https://image.thum.io/get/',
    features: [
      '✅ 완전 무료',
      '즉시 스크린샷',
      '다양한 해상도',
      'API 제공',
      '캐싱 지원'
    ],
    pricing: 'free',
    recommended: false,
    type: 'screenshot'
  },
  
  // 하이브리드 분석
  {
    name: 'hybrid-analysis',
    displayName: 'Hybrid Analysis',
    description: 'Falcon Sandbox 기반 심층 분석',
    url: 'https://www.hybrid-analysis.com/',
    features: [
      '✅ 완전 무료',
      '행동 분석',
      '네트워크 활동',
      'API 호출 추적',
      '상세 리포트'
    ],
    pricing: 'free',
    recommended: false,
    type: 'analysis'
  },
  
  // 임시 브라우저 (제한적 무료)
  {
    name: 'browserling',
    displayName: 'Browserling',
    description: '실시간 가상 브라우저 (3분 무료)',
    url: 'https://www.browserling.com/browse/win/10/chrome/120/',
    features: [
      '⏱️ 3분 무료',
      '실제 브라우저',
      '다양한 OS/브라우저',
      '완전 격리',
      '익명 브라우징'
    ],
    pricing: 'freemium',
    recommended: false,
    type: 'sandbox'
  }
]

// 로컬 보안 솔루션 (추천)
export const localSolutions = {
  windows: [
    {
      name: 'Windows Sandbox',
      description: 'Windows 10/11 Pro 내장 가상 환경',
      steps: [
        'Windows 기능 켜기/끄기 → Windows Sandbox 활성화',
        '시작 메뉴에서 Windows Sandbox 실행',
        '샌드박스 내에서 브라우저로 사이트 방문',
        '종료 시 모든 데이터 자동 삭제'
      ]
    },
    {
      name: 'Sandboxie-Plus',
      description: '무료 오픈소스 샌드박스 프로그램',
      url: 'https://sandboxie-plus.com/',
      steps: [
        'Sandboxie-Plus 다운로드 및 설치',
        '브라우저를 샌드박스에서 실행',
        '격리된 환경에서 안전하게 브라우징'
      ]
    }
  ],
  browser: [
    {
      name: 'Firefox Container',
      description: 'Firefox의 격리된 탭 기능',
      steps: [
        'Firefox 설치',
        'Multi-Account Containers 확장 프로그램 추가',
        '임시 컨테이너에서 사이트 열기'
      ]
    },
    {
      name: 'Brave 브라우저 + Tor',
      description: '프라이버시 중심 브라우저',
      steps: [
        'Brave 브라우저 설치',
        '새 프라이빗 창 with Tor 열기',
        '익명으로 안전하게 브라우징'
      ]
    }
  ],
  vm: [
    {
      name: 'VirtualBox',
      description: '무료 가상머신 소프트웨어',
      steps: [
        'VirtualBox 설치',
        '가벼운 Linux 배포판 설치 (예: Lubuntu)',
        '스냅샷 생성 후 위험한 사이트 방문',
        '문제 발생 시 스냅샷으로 복원'
      ]
    }
  ]
}

// 브라우저 확장 프로그램 추천
export const browserExtensions = [
  {
    name: 'uBlock Origin',
    description: '광고/추적기/악성코드 차단'
  },
  {
    name: 'NoScript',
    description: 'JavaScript 실행 제어'
  },
  {
    name: 'HTTPS Everywhere',
    description: '암호화된 연결 강제'
  },
  {
    name: 'Privacy Badger',
    description: '추적기 자동 차단'
  }
]