# 🔒 URL Safety Checker

> **안전한 인터넷 브라우징을 위한 종합 URL 검사 서비스**

URL의 안전성을 실시간으로 검사하고 위험 요소를 분석하여 피싱, 멀웨어, 의심스러운 사이트로부터 사용자를 보호하는 Next.js 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🛡️ 종합 보안 검사
- **실시간 URL 분석**: SSL 인증서, HTTP 헤더, 리디렉션 체인 분석
- **멀웨어 탐지**: VirusTotal API 연동으로 정확한 멀웨어 검사
- **피싱 사이트 감지**: Google Safe Browsing API로 피싱 사이트 차단
- **의심스러운 패턴 분석**: AI 기반 패턴 매칭으로 위험 사이트 식별

### 📊 상세 분석 리포트
- **위험도 평가**: 3단계 위험도 분류 (낮음/보통/높음)
- **단계별 검사 과정**: 실시간 진행상황 표시
- **네트워크 정보**: 응답시간, 리디렉션, HTTP 상태 코드
- **도메인 정보**: 도메인 나이, 등록 정보, SSL 인증서 상태

### 🚀 최신 UX/UI
- **현대적 디자인**: Glass morphism, 그라데이션, 애니메이션
- **반응형 웹**: 모바일, 태블릿, 데스크톱 최적화
- **다크모드 지원**: 시스템 설정에 따른 자동 테마 변경
- **접근성 준수**: WCAG 2.1 가이드라인 준수

### 편의 기능
- **검사 이력**: 최근 검사 결과 자동 저장
- **QR 코드 스캔**: 카메라 또는 파일 업로드로 QR 코드 스캔
- **결과 공유**: 검사 결과를 다른 사용자와 공유
- **즐겨찾기**: 자주 사용하는 사이트 즐겨찾기 등록

### 🔒 샌드박스 브라우징
- **가상 환경 브라우징**: 의심스러운 사이트를 격리된 환경에서 안전하게 탐색
- **스크린샷 미리보기**: 사이트 방문 없이 스크린샷만 확인
- **다중 제공자 지원**: Browserling, Any.Run, Hybrid Analysis 등
- **완전한 지휘 분리**: 악성코드가 실행되어도 실제 시스템에 영향 없음

## 🔍 검사 항목

### 보안 검사
- ✅ **SSL 인증서**: HTTPS 사용 여부 및 인증서 유효성
- 🌐 **IP 주소 사용**: 도메인 대신 IP 주소 직접 사용 여부
- 🔗 **URL 단축 서비스**: bit.ly, tinyurl 등 단축 URL 사용 여부
- ⏰ **도메인 나이**: 도메인 생성 시기 (신규 도메인은 위험 가능성 높음)
- 🦠 **멀웨어 스캔**: VirusTotal API를 통한 멀웨어 검사
- 🎣 **피싱 검사**: Google Safe Browsing을 통한 피싱 사이트 검사

### 네트워크 분석
- 📡 **HTTP 헤더 분석**: 보안 헤더 및 서버 정보 검사
- 🔄 **리디렉션 추적**: 리디렉션 체인 및 최종 도착지 분석
- ⚡ **응답 시간 측정**: 서버 응답 속도 및 성능 측정
- 📄 **콘텐츠 분석**: MIME 타입, 페이지 제목, 언어 감지

### 의심스러운 패턴 감지
- 🔍 피싱 의심 키워드 (secure-, bank-, paypal- 등)
- 🆓 무료 도메인 사용 (.tk, .ml, .ga, .cf)
- 🔢 과도한 숫자 사용 및 랜덤 문자열
- 📱 모바일 특화 공격 패턴
- 🤖 자동화된 위협 패턴

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Lucide React, Custom Components
- **API Integration**: VirusTotal, Google Safe Browsing
- **Deployment**: Vercel (최적화된 설정)
- **Analytics**: Web Vitals, Performance Monitoring

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn 패키지 매니저

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/url-safety-checker.git
   cd url-safety-checker
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   ```

3. **환경변수 설정**
   ```bash
   cp .env.local.example .env.local
   # .env.local 파일을 열어 API 키 설정
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   ```

5. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 🔧 API 키 설정

더 정확한 분석을 위해 외부 API 연동을 권장합니다:

### VirusTotal API
1. [VirusTotal](https://www.virustotal.com/gui/join-us) 가입
2. API 키 발급
3. `.env.local`에 추가:
   ```env
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

### Google Safe Browsing API
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Safe Browsing API 활성화
3. API 키 발급
4. `.env.local`에 추가:
   ```env
   GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
   ```

## 📁 프로젝트 구조

```
url-safety-checker/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── check-url/           # URL 검사 API
│   ├── globals.css              # 전역 스타일
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 메인 페이지
├── components/                   # 재사용 컴포넌트
│   ├── Toast.tsx                # 알림 컴포넌트
│   ├── QRScanner.tsx           # QR 코드 스캐너
│   └── ProgressBar.tsx         # 진행 바
├── public/                      # 정적 파일
├── .env.local                   # 환경 변수
├── next.config.js               # Next.js 설정
├── tailwind.config.js           # Tailwind 설정
└── package.json                 # 프로젝트 메타데이터
```

## 🚀 Vercel 배포

### 자동 배포 (권장)

1. **GitHub 연동**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel 배포**
   - [Vercel](https://vercel.com) 로그인
   - "New Project" → GitHub 저장소 선택
   - 환경변수 설정 (API 키들)
   - Deploy 클릭

### 환경변수 설정 (Vercel)
```env
VIRUSTOTAL_API_KEY=your_virustotal_api_key
GOOGLE_SAFE_BROWSING_API_KEY=your_google_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 📱 사용법

### 1. 기본 검사
1. URL 입력창에 검사할 웹사이트 주소 입력
2. "검사하기" 버튼 클릭
3. 실시간 진행상황 확인
4. 상세한 분석 결과 및 권장사항 확인

### 2. QR 코드 스캔
1. "QR 코드 스캔" 버튼 클릭
2. 카메라 권한 허용 후 QR 코드 스캔
3. 또는 QR 코드 이미지 파일 업로드
4. 자동으로 URL 추출 및 검사 시작

### 3. 고급 기능
- **검사 이력**: 우측 하단 이력 버튼에서 과거 검사 결과 확인
- **결과 공유**: 분석 완료 후 공유 버튼으로 결과 공유
- **상세 정보**: "고급 설정" 토글로 HTTP 헤더 등 상세 정보 확인
- **샌드박스 브라우징**: 위험한 사이트는 격리된 환경에서 안전하게 탐색

## 🎨 커스터마이징

### 테마 수정
`app/globals.css`에서 CSS 변수 수정:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --danger-color: #ef4444;
  --success-color: #10b981;
}
```

### 검사 규칙 추가
`app/api/check-url/route.ts`에서 새로운 패턴 추가:
```typescript
const CUSTOM_PATTERNS = [
  { pattern: /your-pattern/, name: '커스텀 위험 패턴' }
]
```

### UI 컴포넌트 수정
`components/` 디렉토리의 컴포넌트들을 수정하여 UI 커스터마이징

## 🔒 보안 고려사항

- **개인정보 보호**: 검사 URL은 서버에 저장되지 않음
- **API 키 보안**: 환경변수로 관리, 클라이언트에 노출되지 않음
- **HTTPS 강제**: 모든 통신은 HTTPS로 암호화
- **CSP 헤더**: Content Security Policy로 XSS 방지
- **Rate Limiting**: API 호출 제한으로 남용 방지

## 📊 성능 최적화

- **코드 분할**: Next.js 자동 코드 분할
- **이미지 최적화**: next/image 컴포넌트 사용
- **CSS 최적화**: Tailwind CSS Purge로 미사용 스타일 제거
- **API 캐싱**: SWR로 API 응답 캐싱
- **번들 분석**: webpack-bundle-analyzer로 번들 크기 최적화

## 🤝 기여하기

1. Fork the Project
2. Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to Branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### 개발 가이드라인
- TypeScript 사용 필수
- ESLint + Prettier 설정 준수
- 컴포넌트별 단위 테스트 작성
- 의미있는 커밋 메시지 작성

## 📝 로드맵

### v1.1 (예정)
- [ ] 브라우저 확장 프로그램
- [ ] 실시간 알림 시스템
- [ ] 화이트리스트 기능
- [ ] API 사용량 대시보드

### v1.2 (예정)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 모바일 앱 (React Native)
- [ ] 기업용 대시보드
- [ ] 상세 위협 분석 리포트

### v2.0 (예정)
- [ ] AI 기반 위협 예측
- [ ] 블록체인 기반 신뢰성 검증
- [ ] 협업 위험 정보 공유
- [ ] 실시간 위협 인텔리전스

## ⚠️ 주의사항

- 이 도구는 기본적인 안전성 검사를 제공하며, 100% 정확성을 보장하지 않습니다
- 중요한 거래나 개인정보 입력 시에는 추가적인 검증이 필요합니다
- 의심스러운 사이트는 방문하지 않는 것이 가장 안전합니다
- API 사용량 제한을 고려하여 적절히 사용하세요

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 💬 지원 및 문의

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Email**: support@urlsafetychecker.com
- **Discord**: [커뮤니티 참여](https://discord.gg/urlsafetychecker)
- **Twitter**: [@URLSafetyChecker](https://twitter.com/URLSafetyChecker)

## 🌟 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움으로 만들어졌습니다:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [VirusTotal API](https://www.virustotal.com/)
- [Google Safe Browsing](https://safebrowsing.google.com/)

---

<div align="center">
  <strong>🔒 더 안전한 인터넷을 위해 함께해요!</strong><br>
  <sub>Made with ❤️ in Korea</sub>
</div>