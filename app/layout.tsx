import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: 'URL Safety Checker - 안전한 인터넷 브라우징',
  description: 'URL 안전성을 검사하고 위험 요소를 분석하여 안전한 인터넷 브라우징을 도와드립니다. 피싱, 멀웨어, 의심스러운 사이트를 사전에 차단하세요.',
  keywords: 'URL 검사, 사이트 안전성, 피싱 방지, 멀웨어 검사, 인터넷 보안',
  authors: [{ name: 'URL Safety Checker Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'URL Safety Checker',
    description: 'URL 안전성을 검사하고 위험 요소를 분석하는 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Safety Checker',
    description: 'URL 안전성을 검사하고 위험 요소를 분석하는 서비스',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen`}>
        {/* 배경 그라데이션 */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />
        
        {/* 헤더 */}
        <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">
                    URL Safety Checker
                  </h1>
                  <p className="text-xs text-gray-600">
                    안전한 인터넷 브라우징
                  </p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                {/* <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  기능
                </a>
                <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  사용법
                </a>
                <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  소개
                </a> */}
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">서비스 정상</span>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* 푸터 */}
        <footer className="mt-16 border-t border-white/20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-bold gradient-text">URL Safety Checker</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                </p>
                <div className="flex space-x-4">
                  <span className="text-xs text-gray-500"></span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">주요 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 실시간 URL 안전성 검사</li>
                  <li>• 멀웨어 및 피싱 탐지</li>
                  <li>• SSL 인증서 검증</li>
                  <li>• 의심스러운 패턴 분석</li>
                  <li>• 상세한 보안 리포트</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">보안 정보</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 개인정보 수집 안함</li>
                  <li>• HTTPS 암호화 통신</li>
                  <li>• 검사 기록 로컬 저장</li>
                  <li>• 오픈소스 프로젝트</li>
                  <li>• 정기 보안 업데이트</li>
                </ul>
              </div>
            </div> */}
            
            {/* <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs text-gray-500">
                © 2024 URL Safety Checker. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  개인정보처리방침
                </a>
                <a href="/terms" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  이용약관
                </a>
                <a href="/contact" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                  문의하기
                </a>
              </div>
            </div> */}
          </div>
        </footer>

        {/* 서비스 워커 등록 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(console.error);
              }
            `,
          }}
        />
      </body>
    </html>
  )
}