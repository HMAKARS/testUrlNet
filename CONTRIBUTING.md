# 기여 가이드 (Contributing Guide)

URL Safety Checker 프로젝트에 기여해주셔서 감사합니다! 🎉

## 🚀 시작하기

### 1. 개발 환경 설정

```bash
# 저장소 포크 및 클론
git clone https://github.com/YOUR_USERNAME/url-safety-checker.git
cd url-safety-checker

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 수정하여 API 키 설정

# 개발 서버 실행
npm run dev
```

### 2. 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/기능명`: 새로운 기능 개발
- `bugfix/버그명`: 버그 수정
- `hotfix/핫픽스명`: 긴급 수정

```bash
# 새로운 기능 개발시
git checkout -b feature/awesome-feature

# 버그 수정시
git checkout -b bugfix/fix-important-bug
```

## 📝 코딩 스타일

### TypeScript/React 가이드라인

```typescript
// ✅ 좋은 예시
interface URLAnalysisResult {
  ssl: boolean
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

const AnalysisCard: React.FC<{ result: URLAnalysisResult }> = ({ result }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">분석 결과</h3>
      {/* 컴포넌트 내용 */}
    </div>
  )
}

// ❌ 피해야 할 예시
const card = ({ data }) => {
  return <div style={{padding: "16px"}}>{data.result}</div>
}
```

### CSS/Tailwind 가이드라인

```css
/* ✅ 좋은 예시 - Tailwind 유틸리티 클래스 사용 */
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

/* ❌ 피해야 할 예시 - 인라인 스타일 */
<div style="background: white; padding: 24px; border-radius: 8px;">
```

## 🧪 테스트

### 단위 테스트 작성

```typescript
// components/__tests__/Toast.test.tsx
import { render, screen } from '@testing-library/react'
import { Toast } from '../Toast'

describe('Toast Component', () => {
  it('should display success message', () => {
    render(
      <Toast 
        message="테스트 성공" 
        type="success" 
        onClose={() => {}} 
      />
    )
    
    expect(screen.getByText('테스트 성공')).toBeInTheDocument()
  })
})
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test -- Toast.test.tsx

# 커버리지 확인
npm run test:coverage
```

## 🐛 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함해서 이슈를 생성해주세요:

### 버그 리포트 템플릿

```markdown
## 버그 설명
간단하고 명확한 버그 설명

## 재현 단계
1. '...' 페이지로 이동
2. '....' 클릭
3. '....' 입력
4. 오류 발생

## 예상 동작
무엇이 일어나야 하는지 설명

## 실제 동작
실제로 무엇이 일어났는지 설명

## 스크린샷
가능하다면 스크린샷 첨부

## 환경 정보
- OS: [예: macOS 12.0]
- 브라우저: [예: Chrome 95.0]
- Node.js 버전: [예: 18.0.0]
```

## ✨ 기능 제안

새로운 기능을 제안하고 싶으시다면:

### 기능 제안 템플릿

```markdown
## 기능 설명
제안하는 기능에 대한 명확한 설명

## 문제 상황
이 기능이 해결하는 문제나 요구사항

## 해결 방안
제안하는 해결 방법

## 대안
고려해본 다른 방법들

## 추가 정보
관련 스크린샷, 참고 자료 등
```

## 🔧 개발 가이드라인

### API 개발

```typescript
// app/api/new-feature/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()
    
    // 입력 검증
    if (!input) {
      return NextResponse.json(
        { error: '입력값이 필요합니다' },
        { status: 400 }
      )
    }
    
    // 비즈니스 로직
    const result = await processInput(input)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

### 컴포넌트 개발

```typescript
// components/NewFeature.tsx
interface NewFeatureProps {
  title: string
  onAction?: (data: string) => void
  variant?: 'primary' | 'secondary'
}

export const NewFeature: React.FC<NewFeatureProps> = ({ 
  title, 
  onAction, 
  variant = 'primary' 
}) => {
  const handleClick = () => {
    onAction?.('action-data')
  }

  return (
    <div className={`component-base ${variant === 'primary' ? 'primary-styles' : 'secondary-styles'}`}>
      <h3>{title}</h3>
      <button onClick={handleClick}>액션</button>
    </div>
  )
}
```

## 📦 커밋 컨벤션

의미있는 커밋 메시지를 작성해주세요:

```bash
# 기능 추가
git commit -m "feat: URL 단축 해제 기능 추가"

# 버그 수정
git commit -m "fix: SSL 검증 오류 수정"

# 문서 업데이트
git commit -m "docs: API 문서 업데이트"

# 스타일 변경
git commit -m "style: 버튼 디자인 개선"

# 리팩토링
git commit -m "refactor: API 호출 로직 개선"

# 테스트 추가
git commit -m "test: Toast 컴포넌트 테스트 추가"

# 설정 변경
git commit -m "chore: ESLint 설정 업데이트"
```

### 커밋 타입

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 도구, 설정 파일 등의 변경

## 🚀 Pull Request 가이드

### PR 체크리스트

- [ ] 브랜치명이 컨벤션을 따르고 있나요?
- [ ] 테스트가 모두 통과하나요?
- [ ] 코드 스타일이 일관성을 유지하나요?
- [ ] 문서가 업데이트되었나요?
- [ ] 변경사항이 기존 기능을 해치지 않나요?

### PR 템플릿

```markdown
## 변경 사항
- 추가된 기능이나 수정된 내용 설명

## 관련 이슈
- Closes #123
- Fixes #456

## 테스트
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 확인
- [ ] 수동 테스트 완료

## 스크린샷
변경사항의 스크린샷 (UI 변경시)

## 추가 정보
리뷰어가 알아야 할 추가 정보
```

## 🎯 우선순위 기여 영역

현재 도움이 필요한 영역들:

### 🔴 높은 우선순위
- [ ] 브라우저 확장 프로그램 개발
- [ ] 모바일 반응형 개선
- [ ] 성능 최적화
- [ ] 접근성 개선

### 🟡 중간 우선순위
- [ ] 다국어 지원 (i18n)
- [ ] 단위 테스트 커버리지 증가
- [ ] API 문서 자동화
- [ ] CI/CD 파이프라인 개선

### 🟢 낮은 우선순위
- [ ] 디자인 시스템 구축
- [ ] 스토리북 설정
- [ ] E2E 테스트 추가
- [ ] 성능 모니터링

## 💬 소통하기

- **GitHub Issues**: 버그 리포트, 기능 제안
- **GitHub Discussions**: 일반적인 질문, 아이디어 공유
- **Discord**: 실시간 소통 (링크 준비 중)

## 🏆 기여자 인정

모든 기여자는 README.md의 Contributors 섹션에 추가됩니다!

## 📄 라이선스

기여하신 코드는 프로젝트의 MIT 라이선스를 따릅니다.

---

**다시 한번 기여해주셔서 감사합니다! 🙏**