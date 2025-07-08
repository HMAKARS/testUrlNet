'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, AlertTriangle, CheckCircle, ExternalLink, Clock, Globe, Lock, 
  Eye, Loader2, QrCode, Share2, History, FileText, Zap, AlertCircle,
  Server, Route, Timer, Link2, Bug, ShieldAlert
} from 'lucide-react'
import SafeBrowseModal from '@/components/SafeBrowseModal'

interface SecurityCheck {
  ssl: boolean
  domain_age: number | null
  suspicious_patterns: string[]
  ip_address: boolean
  url_shortener: boolean
  risk_score: number
  risk_level: 'low' | 'medium' | 'high'
  recommendations: string[]
  redirects: string[]
  http_headers: Record<string, string>
  final_url: string
  response_time: number
  status_code: number | null
  malware_detected: boolean
  phishing_detected: boolean
  content_type: string | null
  page_title: string | null
  shortened_url_resolved: string | null
}

interface AnalysisStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  description: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SecurityCheck | null>(null)
  const [error, setError] = useState('')
  const [urlValid, setUrlValid] = useState(true)
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSafeBrowse, setShowSafeBrowse] = useState(false)
  const [history, setHistory] = useState<Array<{url: string, result: SecurityCheck, timestamp: Date}>>([])

  // URL 실시간 검증
  useEffect(() => {
    if (!url) {
      setUrlValid(true)
      return
    }
    
    try {
      let testUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        testUrl = 'https://' + url
      }
      new URL(testUrl)
      setUrlValid(true)
    } catch {
      setUrlValid(false)
    }
  }, [url])

  // 분석 단계 초기화
  const initializeAnalysisSteps = () => {
    const steps: AnalysisStep[] = [
      { name: 'url_validation', status: 'pending', description: 'URL 형식 검증' },
      { name: 'http_analysis', status: 'pending', description: 'HTTP 헤더 분석' },
      { name: 'ssl_check', status: 'pending', description: 'SSL 인증서 확인' },
      { name: 'malware_scan', status: 'pending', description: '멀웨어 검사' },
      { name: 'phishing_check', status: 'pending', description: '피싱 사이트 검사' },
      { name: 'pattern_analysis', status: 'pending', description: '의심스러운 패턴 분석' },
      { name: 'risk_calculation', status: 'pending', description: '위험도 계산' }
    ]
    setAnalysisSteps(steps)
    return steps
  }

  // 분석 단계 업데이트
  const updateAnalysisStep = (stepName: string, status: 'running' | 'completed' | 'error') => {
    setAnalysisSteps(prev => prev.map(step => 
      step.name === stepName ? { ...step, status } : step
    ))
  }

  const analyzeURL = async () => {
    if (!url || !urlValid) {
      setError('올바른 URL을 입력해주세요')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    
    const steps = initializeAnalysisSteps()

    try {
      // 단계별 진행상황 시뮬레이션
      for (let i = 0; i < steps.length; i++) {
        updateAnalysisStep(steps[i].name, 'running')
        
        if (i === 0) {
          // URL 검증 단계에서 실제 API 호출
          const response = await fetch('/api/check-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          })

          if (!response.ok) {
            throw new Error('URL 분석 중 오류가 발생했습니다')
          }

          const data = await response.json()
          
          // 모든 단계를 완료로 표시
          setTimeout(() => {
            steps.forEach(step => updateAnalysisStep(step.name, 'completed'))
            setResult(data)
            
            // 검사 이력에 추가
            setHistory(prev => [{
              url: data.final_url || url,
              result: data,
              timestamp: new Date()
            }, ...prev.slice(0, 4)]) // 최대 5개 항목 유지
          }, 500)
          
          break
        } else {
          // 다른 단계들은 시각적 효과를 위한 딜레이
          await new Promise(resolve => setTimeout(resolve, 300))
          updateAnalysisStep(steps[i].name, 'completed')
        }
      }

    } catch (err) {
      steps.forEach(step => updateAnalysisStep(step.name, 'error'))
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50 border-green-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'high': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'medium': return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'high': return <ShieldAlert className="w-6 h-6 text-red-600" />
      default: return <Shield className="w-6 h-6 text-gray-600" />
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />
    }
  }

  const visitSite = () => {
    // 위험도와 상관없이 항상 안전 브라우징 모달 표시
    setShowSafeBrowse(true)
  }

  const shareResult = async () => {
    if (result && navigator.share) {
      try {
        await navigator.share({
          title: 'URL 안전성 검사 결과',
          text: `${url}의 위험도: ${result.risk_level === 'low' ? '낮음' : result.risk_level === 'medium' ? '보통' : '높음'}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('공유 실패:', err)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: 토스트 메시지 표시
  }

  return (
    <div className="space-y-8">
      {/* URL 입력 섹션 */}
      <div className="card">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            URL 안전성 검사
          </h2>
          
          <div className="space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="검사할 URL을 입력하세요 (예: https://example.com)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !urlValid && url ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeURL()}
                />
                {!urlValid && url && (
                  <p className="text-red-600 text-sm mt-1">올바른 URL 형식이 아닙니다</p>
                )}
              </div>
              <button
                onClick={analyzeURL}
                disabled={loading || !url || !urlValid}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    검사하기
                  </>
                )}
              </button>
            </div>
          
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 분석 진행상황 */}
      {loading && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            분석 진행상황
          </h3>
          <div className="space-y-3">
            {analysisSteps.map((step, index) => (
              <div key={step.name} className="flex items-center space-x-3">
                {getStepIcon(step.status)}
                <span className={`text-sm ${
                  step.status === 'completed' ? 'text-green-600' :
                  step.status === 'running' ? 'text-blue-600' :
                  step.status === 'error' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {step.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {result && (
        <div className="space-y-6">
          {/* 위험도 요약 */}
          <div className={`card ${getRiskBgColor(result.risk_level)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getRiskIcon(result.risk_level)}
                <div>
                  <h3 className={`text-xl font-bold ${getRiskColor(result.risk_level)}`}>
                    위험도: {result.risk_level === 'low' ? '낮음' : 
                             result.risk_level === 'medium' ? '보통' : '높음'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    위험 점수: {result.risk_score}/10 | 응답시간: {result.response_time}ms
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={shareResult}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  title="결과 공유"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  title="결과 복사"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 페이지 정보 */}
          {(result.page_title || result.final_url !== url) && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                페이지 정보
              </h4>
              <div className="space-y-2">
                {result.page_title && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">제목:</span>
                    <p className="text-gray-900">{result.page_title}</p>
                  </div>
                )}
                {result.final_url !== url && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">최종 URL:</span>
                    <p className="text-gray-900 break-all">{result.final_url}</p>
                  </div>
                )}
                {result.shortened_url_resolved && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">단축 URL 원본:</span>
                    <p className="text-gray-900 break-all">{result.shortened_url_resolved}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 보안 위협 감지 */}
          {(result.malware_detected || result.phishing_detected) && (
            <div className="card bg-red-50 border-red-200">
              <h4 className="text-lg font-semibold mb-4 flex items-center text-red-700">
                <Bug className="w-5 h-5 mr-2" />
                보안 위협 감지
              </h4>
              <div className="space-y-2">
                {result.malware_detected && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    멀웨어가 감지되었습니다
                  </div>
                )}
                {result.phishing_detected && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    피싱 사이트로 의심됩니다
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 상세 분석 결과 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 보안 체크 */}
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                보안 체크
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    SSL 인증서
                  </span>
                  <span className={result.ssl ? 'text-green-600' : 'text-red-600'}>
                    {result.ssl ? '✓ 안전' : '✗ 없음'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    IP 주소 사용
                  </span>
                  <span className={result.ip_address ? 'text-red-600' : 'text-green-600'}>
                    {result.ip_address ? '✗ 의심됨' : '✓ 정상'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Link2 className="w-4 h-4 mr-2" />
                    URL 단축 서비스
                  </span>
                  <span className={result.url_shortener ? 'text-yellow-600' : 'text-green-600'}>
                    {result.url_shortener ? '⚠ 사용됨' : '✓ 미사용'}
                  </span>
                </div>
                {/* {result.domain_age !== null && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      도메인 나이
                    </span>
                    <span className={result.domain_age < 30 ? 'text-red-600' : 
                                   result.domain_age < 90 ? 'text-yellow-600' : 'text-green-600'}>
                      {result.domain_age}일
                    </span>
                  </div>
                )} */}
                {result.status_code && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Server className="w-4 h-4 mr-2" />
                      HTTP 상태
                    </span>
                    <span className={result.status_code < 400 ? 'text-green-600' : 'text-red-600'}>
                      {result.status_code}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 네트워크 정보 */}
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                네트워크 정보
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Timer className="w-4 h-4 mr-2" />
                    응답 시간
                  </span>
                  <span className={result.response_time > 3000 ? 'text-red-600' : 
                                 result.response_time > 1000 ? 'text-yellow-600' : 'text-green-600'}>
                    {result.response_time}ms
                  </span>
                </div>
                {result.redirects.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Route className="w-4 h-4 mr-2" />
                      리디렉션 횟수
                    </span>
                    <span className={result.redirects.length > 3 ? 'text-red-600' : 
                                   result.redirects.length > 1 ? 'text-yellow-600' : 'text-green-600'}>
                      {result.redirects.length}번
                    </span>
                  </div>
                )}
                {result.content_type && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      콘텐츠 타입
                    </span>
                    <span className="text-gray-600 text-sm">
                      {result.content_type.split(';')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 의심스러운 패턴 */}
          {result.suspicious_patterns.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                의심스러운 패턴
              </h4>
              <div className="grid gap-2">
                {result.suspicious_patterns.map((pattern, index) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    • {pattern}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 리디렉션 체인 */}
          {result.redirects.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                리디렉션 체인
              </h4>
              <div className="space-y-2">
                {result.redirects.map((redirect, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="text-gray-700 break-all">{redirect}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">{result.redirects.length + 1}.</span>
                  <span className="text-green-600 break-all font-medium">{result.final_url}</span>
                </div>
              </div>
            </div>
          )}

          {/* 권장사항 */}
          {result.recommendations.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4">권장사항</h4>
              <div className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="text-gray-700 text-sm p-2 bg-gray-50 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 고급 정보 (HTTP 헤더) */}
          {showAdvanced && Object.keys(result.http_headers).length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                HTTP 헤더
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(result.http_headers, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-4">
            {result.risk_level === 'low' ? (
              <button onClick={visitSite} className="btn-safe">
                <CheckCircle className="w-4 h-4 mr-2" />
                안전함 - 브라우징 옵션 보기
              </button>
            ) : result.risk_level === 'medium' ? (
              <button onClick={visitSite} className="btn-primary">
                <AlertTriangle className="w-4 h-4 mr-2" />
                주의 필요 - 브라우징 옵션 보기
              </button>
            ) : (
              <button onClick={visitSite} className="btn-danger">
                <ShieldAlert className="w-4 h-4 mr-2" />
                위험 - 브라우징 옵션 보기
              </button>
            )}
            <button
              onClick={() => {
                setResult(null)
                setUrl('')
                setAnalysisSteps([])
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              다시 검사하기
            </button>
          </div>
        </div>
      )}

      {/* 검사 이력 */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <History className="w-5 h-5 mr-2" />
            최근 검사 이력
          </h3>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.url}</p>
                  <p className="text-xs text-gray-500">
                    {item.timestamp.toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getRiskBgColor(item.result.risk_level)}`}>
                    {item.result.risk_level === 'low' ? '안전' : 
                     item.result.risk_level === 'medium' ? '주의' : '위험'}
                  </span>
                  <button
                    onClick={() => setUrl(item.url)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    다시 검사
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안전 브라우징 모달 */}
      {showSafeBrowse && result && (
        <SafeBrowseModal
          url={result.final_url || url}
          riskLevel={result.risk_level}
          onClose={() => setShowSafeBrowse(false)}
        />
      )}
    </div>
  )
}