# 🚀 URL Safety Checker - 실행 가이드

## 📋 빠른 시작

### 1. 필수 요구사항
- Node.js 18.0 이상
- npm 8.0 이상
- Git

### 2. 프로젝트 설치

```bash
# 프로젝트 디렉토리로 이동
cd C:\Users\kyj\Desktop\dev\testUrlNet

# 의존성 설치
npm install

# 환경 변수 설정
copy .env.local.example .env.local
# .env.local 파일을 열어서 필요한 API 키 설정
```

### 3. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# http://localhost:3000 에서 확인
```

## 🔧 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
```

### 코드 품질
```bash
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 자동 수정
npm run type-check   # TypeScript 타입 체크
```

### 테스트
```bash
npm test             # 테스트 실행
npm run test:watch   # 테스트 watch 모드
npm run test:coverage # 테스트 커버리지
```

### 기타
```bash
npm run analyze      # 번들 분석
npm run clean        # 빌드 파일 정리
npm run check-updates # 패키지 업데이트 확인
```

## 🔑 API 키 설정

### VirusTotal API
1. https://www.virustotal.com/gui/join-us 접속
2. 회원가입 후 API 키 발급
3. `.env.local` 파일에 추가:
   ```
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

### Google Safe Browsing API
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성
3. Safe Browsing API 활성화
4. API 키 생성
5. `.env.local` 파일에 추가:
   ```
   GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
   ```

## 🐳 Docker로 실행

### Docker 빌드 및 실행
```bash
# 이미지 빌드
docker build -t url-safety-checker .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local url-safety-checker
```

### Docker Compose 사용
```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

## 🌐 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 수동 빌드 배포
```bash
# 빌드
npm run build

# 정적 파일 생성 (선택사항)
npm run export

# 서버 시작
npm start
```

## 🐛 문제 해결

### 의존성 설치 오류
```bash
# 캐시 삭제 및 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 빌드 오류
```bash
# 타입 체크
npm run type-check

# 린트 수정
npm run lint:fix

# 환경 변수 확인
echo %NODE_ENV%
```

### 포트 충돌
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

## 📊 성능 테스트

### Lighthouse 실행
```bash
# Chrome DevTools에서 Lighthouse 탭 사용
# 또는 CLI 사용:
npx lighthouse http://localhost:3000 --view
```

### 번들 분석
```bash
npm run analyze
# 브라우저에서 자동으로 번들 분석 결과 열림
```

## 🔍 개발 도구

### VS Code 추천 확장
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (API 테스트)

### 브라우저 확장
- React Developer Tools
- Redux DevTools (상태 관리 추가 시)
- Lighthouse

## 📝 추가 정보

### 🔒 샌드박스 브라우징 사용법

1. **의심스러운 사이트 검사**
   - URL을 입력하고 검사 실행
   - 위험도가 "보통" 이상일 경우 자동으로 샌드박스 옵션 제공

2. **안전한 탐색 옵션**
   - **스크린샷 미리보기**: 사이트 방문 없이 화면만 확인
   - **격리된 브라우저**: 가상 환경에서 안전하게 탐색
   - **직접 방문**: 위험을 감수하고 직접 방문 (권장하지 않음)

3. **제공 업체**
   - Browserling (추천)
   - Any.Run
   - Hybrid Analysis
   - URLVoid

### 프로젝트 구조
```
C:\Users\kyj\Desktop\dev\testUrlNet\
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
├── lib/              # 유틸리티 함수
├── public/           # 정적 파일
├── __tests__/        # 테스트 파일
└── ...              # 설정 파일들
```

### 환경 변수
- `.env.local`: 로컬 개발용
- `.env.development`: 개발 환경
- `.env.production`: 프로덕션 환경
- `.env.test`: 테스트 환경

### Git 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

## 🆘 도움말

문제가 발생하면:
1. GitHub Issues 확인
2. FAQ 페이지 (/faq) 확인
3. 개발팀에 문의: support@urlsafetychecker.com

---

**Happy Coding! 🎉**