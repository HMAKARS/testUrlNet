'use client'

import { useState } from 'react'
import { Shield, ExternalLink, AlertTriangle, Monitor, Lock, X, ChevronRight, CheckCircle, Search, Globe, Camera, Computer } from 'lucide-react'
import { sandboxProviders, localSolutions, browserExtensions } from '@/lib/sandbox-providers'

interface SafeBrowseModalProps {
  url: string
  riskLevel: 'low' | 'medium' | 'high'
  onClose: () => void
}

export default function SafeBrowseModal({ url, riskLevel, onClose }: SafeBrowseModalProps) {
  const [mode, setMode] = useState<'screenshot' | 'isolated' | 'direct'>('isolated')
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showLocalSolutions, setShowLocalSolutions] = useState(false)

  const captureScreenshot = async () => {
    setLoading(true)
    try {
      // Thum.io를 사용한 스크린샷
      const screenshotUrl = `https://image.thum.io/get/${encodeURIComponent(url)}`
      setScreenshot(screenshotUrl)
    } catch (error) {
      console.error('Screenshot failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const openInSandbox = (providerName: string) => {
    const provider = sandboxProviders.find(p => p.name === providerName)
    if (provider) {
      let sandboxUrl = provider.url
      
      // URL 처리 방식이 다른 서비스들 처리
      if (provider.name === 'urlscan') {
        sandboxUrl = `${provider.url}${encodeURIComponent(url)}`
      } else if (provider.name === 'virustotal') {
        sandboxUrl = provider.url
        // VirusTotal은 수동으로 URL을 입력해야 함
        alert('VirusTotal 페이지가 열립니다. URL 입력란에 검사할 주소를 붙여넣으세요.')
      } else if (provider.name === 'croxyproxy' || provider.name === 'hideme') {
        // 프록시 서비스는 메인 페이지로 이동
        alert('프록시 페이지가 열립니다. URL 입력란에 검사할 주소를 입력하세요.')
      } else if (provider.name === 'thum.io') {
        sandboxUrl = `${provider.url}${encodeURIComponent(url)}`
      } else if (provider.name === 'browserling') {
        sandboxUrl = `${provider.url}${encodeURIComponent(url)}`
      }
      
      window.open(sandboxUrl, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }

  const openDirectly = () => {
    if (confirm('정말로 이 사이트를 직접 방문하시겠습니까? 위험할 수 있습니다.')) {
      window.open(url, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Search className="w-4 h-4" />
      case 'proxy': return <Globe className="w-4 h-4" />
      case 'screenshot': return <Camera className="w-4 h-4" />
      case 'sandbox': return <Computer className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  // 서비스 타입별 그룹화
  const groupedProviders = {
    analysis: sandboxProviders.filter(p => p.type === 'analysis'),
    proxy: sandboxProviders.filter(p => p.type === 'proxy'),
    screenshot: sandboxProviders.filter(p => p.type === 'screenshot'),
    sandbox: sandboxProviders.filter(p => p.type === 'sandbox')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
            
            {/* 옵션 1: 안전한 분석/프록시 */}
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
                    <h4 className="font-semibold">안전한 분석 & 프록시</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">권장</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">무료</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    보안 분석 서비스나 웹 프록시로 안전하게 확인합니다.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">✓ 완전 무료 서비스</p>
                    <p className="text-xs text-gray-500">✓ 악성코드 분석 리포트</p>
                    <p className="text-xs text-gray-500">✓ 웹 프록시로 실시간 브라우징</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 옵션 2: 스크린샷 미리보기 */}
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
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">안전</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    사이트의 스크린샷만 확인합니다. 악성코드 실행 위험이 없습니다.
                  </p>
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
            <div className="border rounded-lg overflow-hidden bg-gray-100 p-4">
              <img src={screenshot} alt="사이트 미리보기" className="w-full" />
              <p className="text-xs text-gray-500 text-center mt-2">
                Thum.io 서비스로 생성된 스크린샷
              </p>
            </div>
          )}

          {/* 안전한 서비스 선택 */}
          {mode === 'isolated' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-3">🛡️ 안전한 서비스 선택</p>
                
                {/* 보안 분석 서비스 */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Search className="w-4 h-4 mr-1" /> 보안 분석 (추천)
                  </h5>
                  <div className="space-y-2">
                    {groupedProviders.analysis.map(provider => (
                      <div 
                        key={provider.name}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedProvider === provider.name 
                            ? 'border-blue-500 bg-white shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider(provider.name)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h6 className="font-semibold text-sm">{provider.displayName}</h6>
                              {provider.recommended && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">추천</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                          </div>
                          {selectedProvider === provider.name ? (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 웹 프록시 서비스 */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-1" /> 웹 프록시 (실시간 브라우징)
                  </h5>
                  <div className="space-y-2">
                    {groupedProviders.proxy.map(provider => (
                      <div 
                        key={provider.name}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedProvider === provider.name 
                            ? 'border-blue-500 bg-white shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProvider(provider.name)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h6 className="font-semibold text-sm">{provider.displayName}</h6>
                              {provider.recommended && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">추천</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                          </div>
                          {selectedProvider === provider.name ? (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 가상 브라우저 (제한적) */}
                {groupedProviders.sandbox.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Computer className="w-4 h-4 mr-1" /> 가상 브라우저 (시간 제한)
                    </h5>
                    <div className="space-y-2">
                      {groupedProviders.sandbox.map(provider => (
                        <div 
                          key={provider.name}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedProvider === provider.name 
                              ? 'border-blue-500 bg-white shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedProvider(provider.name)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h6 className="font-semibold text-sm">{provider.displayName}</h6>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                  {provider.features[0]}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                            </div>
                            {selectedProvider === provider.name ? (
                              <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 로컬 솔루션 안내 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={() => setShowLocalSolutions(!showLocalSolutions)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    💻 더 나은 대안: 로컬 보안 솔루션
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showLocalSolutions ? 'rotate-90' : ''}`} />
                </button>
                
                {showLocalSolutions && (
                  <div className="mt-3 space-y-3 text-xs">
                    <div>
                      <h6 className="font-semibold text-gray-700 mb-1">Windows 사용자</h6>
                      <ul className="space-y-1 text-gray-600">
                        <li>• <strong>Windows Sandbox</strong> - Win 10/11 Pro 내장 (완전 무료)</li>
                        <li>• <strong>Sandboxie-Plus</strong> - 오픈소스 샌드박스</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-semibold text-gray-700 mb-1">브라우저 솔루션</h6>
                      <ul className="space-y-1 text-gray-600">
                        <li>• <strong>Firefox + Container</strong> - 격리된 탭</li>
                        <li>• <strong>Brave + Tor</strong> - 익명 브라우징</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-semibold text-gray-700 mb-1">가상머신</h6>
                      <ul className="space-y-1 text-gray-600">
                        <li>• <strong>VirtualBox</strong> - 무료 VM 소프트웨어</li>
                      </ul>
                    </div>
                  </div>
                )}
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
                else if (mode === 'isolated' && selectedProvider) openInSandbox(selectedProvider)
                else if (mode === 'direct') openDirectly()
              }}
              disabled={loading || (mode === 'isolated' && !selectedProvider)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                mode === 'direct' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : mode === 'isolated' && !selectedProvider
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                  <span>선택한 서비스로 열기</span>
                  {selectedProvider && <ChevronRight className="w-4 h-4" />}
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
            <p className="mb-2">💡 <strong>추천:</strong> URLScan.io나 VirusTotal로 먼저 분석 → 안전하면 CroxyProxy로 실시간 확인</p>
            <p>🛡️ 최고의 보안을 원한다면 Windows Sandbox나 VirtualBox를 사용하세요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}