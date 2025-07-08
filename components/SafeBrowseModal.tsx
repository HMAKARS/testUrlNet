'use client'

import { useState } from 'react'
import { Shield, ExternalLink, AlertTriangle, Monitor, Lock, X } from 'lucide-react'
import { sandboxProviders } from '@/lib/sandbox-providers'

interface SafeBrowseModalProps {
  url: string
  riskLevel: 'low' | 'medium' | 'high'
  onClose: () => void
}

export default function SafeBrowseModal({ url, riskLevel, onClose }: SafeBrowseModalProps) {
  const [mode, setMode] = useState<'screenshot' | 'isolated' | 'direct'>('screenshot')
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)

  const captureScreenshot = async () => {
    setLoading(true)
    try {
      // 실제 구현 시 스크린샷 API 호출
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (response.ok) {
        const data = await response.json()
        setScreenshot(data.screenshot)
      }
    } catch (error) {
      console.error('Screenshot failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const openInSandbox = () => {
    // 기본 제공자 (추천) 선택
    const provider = sandboxProviders.find(p => p.name === 'browserling') || sandboxProviders[0]
    const sandboxUrl = `${provider.url}${encodeURIComponent(url)}`
    window.open(sandboxUrl, '_blank', 'noopener,noreferrer')
  }

  const openDirectly = () => {
    if (confirm('정말로 이 사이트를 직접 방문하시겠습니까? 위험할 수 있습니다.')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className={`p-6 border-b flex-shrink-0 ${
          riskLevel === 'high' ? 'bg-red-50 border-red-200' : 
          riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' : 
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`w-6 h-6 ${
                riskLevel === 'high' ? 'text-red-600' : 
                riskLevel === 'medium' ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
              <h2 className="text-xl font-bold">안전한 브라우징 옵션</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 - 스크롤 가능 */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* URL 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">방문하려는 URL:</p>
            <p className="font-mono text-sm break-all">{url}</p>
          </div>

          {/* 경고 메시지 */}
          {riskLevel !== 'low' && (
            <div className={`p-4 rounded-lg flex items-start space-x-3 ${
              riskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">
                  {riskLevel === 'high' ? '⚠️ 높은 위험도 감지됨' : '⚠️ 주의가 필요합니다'}
                </p>
                <p>
                  이 사이트는 보안 위험이 있을 수 있습니다. 
                  아래 안전한 방법 중 하나를 선택하여 방문하세요.
                </p>
              </div>
            </div>
          )}

          {/* 브라우징 옵션 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">브라우징 방법 선택:</h3>
            
            {/* 옵션 1: 스크린샷 미리보기 */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                mode === 'screenshot' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setMode('screenshot')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={mode === 'screenshot'}
                  onChange={() => setMode('screenshot')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">스크린샷 미리보기</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">가장 안전</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    사이트의 스크린샷만 확인합니다. 악성코드 실행 위험이 전혀 없습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 옵션 2: 격리된 브라우저 */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                mode === 'isolated' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setMode('isolated')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={mode === 'isolated'}
                  onChange={() => setMode('isolated')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">격리된 브라우저</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">권장</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    가상 환경에서 사이트를 탐색합니다. 악성코드가 실행되어도 안전합니다.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">✓ 새로운 가상 브라우저 환경</p>
                    <p className="text-xs text-gray-500">✓ 다운로드 차단</p>
                    <p className="text-xs text-gray-500">✓ 세션 종료 시 데이터 삭제</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 옵션 3: 직접 방문 */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                mode === 'direct' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setMode('direct')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={mode === 'direct'}
                  onChange={() => setMode('direct')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold">직접 방문</h4>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">위험</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    현재 브라우저에서 직접 사이트를 방문합니다. 보안 위험에 노출될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 스크린샷 미리보기 */}
          {mode === 'screenshot' && screenshot && (
            <div className="border rounded-lg overflow-hidden">
              <img src={screenshot} alt="사이트 미리보기" className="w-full" />
            </div>
          )}

          {/* 샌드박스 제공자 정보 */}
          {mode === 'isolated' && (
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="font-semibold text-blue-900 mb-2">🔒 격리된 브라우저 제공자</p>
              <div className="space-y-2 text-blue-700">
                {sandboxProviders.filter(p => p.recommended).map(provider => (
                  <div key={provider.name}>
                    <span className="font-medium">{provider.displayName}</span>
                    <span className="text-xs ml-2">({provider.pricing === 'free' ? '무료' : provider.pricing === 'freemium' ? '부분 무료' : '유료'})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (mode === 'screenshot') captureScreenshot()
                else if (mode === 'isolated') openInSandbox()
                else if (mode === 'direct') openDirectly()
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                mode === 'direct' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : mode === 'screenshot' ? (
                <>
                  <Monitor className="w-4 h-4" />
                  <span>스크린샷 보기</span>
                </>
              ) : mode === 'isolated' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>격리된 환경에서 열기</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>직접 방문하기</span>
                </>
              )}
            </button>
          </div>

          {/* 추가 정보 */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            💡 팁: 격리된 브라우저는 클라우드 기반 가상 환경에서 실행되어 
            악성코드로부터 완전히 안전합니다.
          </div>
        </div>
      </div>
    </div>
  )
}