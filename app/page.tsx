'use client'

import { useState } from 'react'
import { 
  Shield, FileSearch, Link2, Upload
} from 'lucide-react'
import dynamic from 'next/dynamic'

// 동적 임포트로 컴포넌트 로드 - SSR 비활성화
const URLChecker = dynamic(() => import('@/components/URLChecker'), { 
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})
const FileScanner = dynamic(() => import('@/components/FileScanner'), { 
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

type TabType = 'url' | 'file'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('url')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            보안 검사 도구
          </h1>
          <p className="text-xl text-gray-600">
            URL과 파일의 안전성을 검사합니다
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('url')}
                className={`
                  flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                  transition-colors duration-200 flex items-center justify-center
                  ${activeTab === 'url'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Link2 className="w-5 h-5 mr-2" />
                URL 검사
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`
                  flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                  transition-colors duration-200 flex items-center justify-center
                  ${activeTab === 'file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Upload className="w-5 h-5 mr-2" />
                파일 스캔
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'url' ? <URLChecker /> : <FileScanner />}
        </div>
      </div>
    </div>
  )
}