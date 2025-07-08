# 🚀 배포 가이드

URL Safety Checker를 다양한 플랫폼에 배포하는 방법을 안내합니다.

## 📋 사전 준비

### 1. 환경 변수 설정

배포 전에 다음 환경 변수들을 설정해야 합니다:

```bash
# 필수 환경 변수
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=URL Safety Checker

# 선택적 API 키 (기능 향상을 위해 권장)
VIRUSTOTAL_API_KEY=your_virustotal_api_key
GOOGLE_SAFE_BROWSING_API_KEY=your_google_safe_browsing_api_key

# 추가 설정
NEXT_PUBLIC_MAX_ANALYSIS_HISTORY=10
NEXT_PUBLIC_ENABLE_QR_SCANNER=true
NEXT_PUBLIC_ENABLE_SHARING=true
```

### 2. API 키 발급

#### VirusTotal API 키
1. [VirusTotal](https://www.virustotal.com/gui/join-us) 회원가입
2. API 키 페이지에서 키 발급
3. 무료 계정: 500 requests/day, 4 requests/minute

#### Google Safe Browsing API 키
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Safe Browsing API 활성화
4. API 자격 증명 생성

## 🌐 Vercel 배포 (권장)

### 자동 배포 (GitHub 연동)

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel 연동**
   - [Vercel](https://vercel.com) 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택
   - Framework Preset: "Next.js" (자동 감지됨)

3. **환경 변수 설정**
   - Environment Variables 섹션에서 환경 변수 추가
   - Production, Preview, Development 환경별 설정 가능

4. **배포 실행**
   - "Deploy" 클릭
   - 자동으로 빌드 및 배포 진행

### 수동 배포 (Vercel CLI)

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인 및 초기 설정**
   ```bash
   vercel login
   vercel
   ```

3. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

### Vercel 설정 최적화

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/check-url/route.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🐳 Docker 배포

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  url-safety-checker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - VIRUSTOTAL_API_KEY=${VIRUSTOTAL_API_KEY}
      - GOOGLE_SAFE_BROWSING_API_KEY=${GOOGLE_SAFE_BROWSING_API_KEY}
    restart: unless-stopped
    
  # Optional: Add reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - url-safety-checker
    restart: unless-stopped
```

### 배포 명령어

```bash
# 이미지 빌드
docker build -t url-safety-checker .

# 컨테이너 실행
docker run -d \
  --name url-safety-checker \
  -p 3000:3000 \
  -e VIRUSTOTAL_API_KEY=your_key \
  -e GOOGLE_SAFE_BROWSING_API_KEY=your_key \
  url-safety-checker

# Docker Compose 사용
docker-compose up -d
```

## ☁️ AWS 배포

### AWS Amplify

1. **AWS Amplify Console** 접속
2. **새 앱 연결**
   - GitHub 저장소 선택
   - 빌드 설정 자동 감지

3. **환경 변수 설정**
   - Environment variables에서 API 키 설정

4. **빌드 설정**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### AWS EC2

1. **EC2 인스턴스 생성**
   - Ubuntu 20.04 LTS 선택
   - t3.micro (프리티어) 또는 적절한 인스턴스 타입

2. **서버 설정**
   ```bash
   # Node.js 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2 설치 (프로세스 관리)
   sudo npm install -g pm2

   # 프로젝트 클론
   git clone https://github.com/your-username/url-safety-checker.git
   cd url-safety-checker

   # 의존성 설치 및 빌드
   npm ci
   npm run build

   # PM2로 실행
   pm2 start npm --name "url-safety-checker" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx 설정**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🌟 Netlify 배포

1. **Netlify** 접속
2. **새 사이트** 추가
3. **GitHub 연동**
4. **빌드 설정**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

5. **환경 변수 설정**
   - Site settings > Environment variables

## 📊 성능 최적화

### 빌드 최적화

```bash
# 번들 분석
npm run analyze

# TypeScript 타입 체크
npm run type-check

# 린팅
npm run lint:fix
```

### 캐싱 전략

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}
```

## 🔒 보안 설정

### CSP 헤더

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  child-src *.youtube.com *.google.com *.twitter.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self' *.googleapis.com *.gstatic.com;
`

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy.replace(/\n/g, '') },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

## 📈 모니터링

### Vercel Analytics

```javascript
// next.config.js
module.exports = {
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  analytics: {
    id: process.env.VERCEL_ANALYTICS_ID,
  },
}
```

### Sentry 오류 추적

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

## 🔄 CI/CD 파이프라인

### GitHub Actions

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run linting
        run: npm run lint
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 배포 체크리스트

### 배포 전 확인사항

- [ ] 환경 변수 모두 설정됨
- [ ] API 키 발급 및 테스트 완료
- [ ] 빌드 오류 없음 (`npm run build`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 린팅 통과 (`npm run lint`)
- [ ] 테스트 통과 (`npm test`)
- [ ] 성능 테스트 완료
- [ ] 보안 헤더 설정 확인

### 배포 후 확인사항

- [ ] 사이트 정상 로딩
- [ ] URL 검사 기능 동작
- [ ] API 호출 성공
- [ ] 모바일 반응형 확인
- [ ] PWA 기능 동작 (오프라인 지원)
- [ ] 성능 지표 확인 (Lighthouse)
- [ ] 에러 모니터링 설정
- [ ] SSL 인증서 정상

## 🆘 문제 해결

### 일반적인 문제들

1. **빌드 실패**
   ```bash
   # 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install
   
   # 타입 오류 수정
   npm run type-check
   ```

2. **API 호출 실패**
   - 환경 변수 확인
   - API 키 유효성 검증
   - 네트워크 연결 상태 확인

3. **성능 이슈**
   - 번들 크기 분석 (`npm run analyze`)
   - 이미지 최적화
   - 캐싱 전략 검토

### 롤백 방법

```bash
# Vercel에서 이전 배포로 롤백
vercel rollback [deployment-url]

# Git에서 이전 커밋으로 되돌리기
git revert HEAD
git push origin main
```

## 📞 지원

배포 중 문제가 발생하면:

1. [GitHub Issues](https://github.com/your-username/url-safety-checker/issues) 생성
2. [Discord 커뮤니티](https://discord.gg/url-safety-checker) 참여
3. 이메일: support@urlsafetychecker.com

---

**🎉 성공적인 배포를 위해 모든 단계를 차근차근 따라해보세요!**