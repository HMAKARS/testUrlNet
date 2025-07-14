'use client'

import { Shield, AlertTriangle, CheckCircle, FileText, Hash, Calendar, FileArchive, Bug, ShieldAlert } from 'lucide-react'

export interface FileScanResult {
  filename: string
  fileSize: number
  fileType: string
  mimeType: string
  hash: {
    md5: string
    sha1: string
    sha256: string
  }
  scanTime: number
  malwareDetected: boolean
  suspiciousPatterns: string[]
  riskLevel: 'low' | 'medium' | 'high'
  riskScore: number
  isArchive: boolean
  archiveContents?: FileScanResult[]
  virusTotalResult?: {
    detected: boolean
    positives: number
    total: number
    scanDate: string
  }
  recommendations?: string[]
  scanDetails?: {
    method: string
    findings: string[]
  }
}

interface FileScanResultsProps {
  results: FileScanResult[]
  loading?: boolean
}
export default function FileScanResults({ results, loading = false }: FileScanResultsProps) {
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
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'high': return <ShieldAlert className="w-5 h-5 text-red-600" />
      default: return <Shield className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">파일을 스캔하는 중...</p>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <div key={index} className={`card ${getRiskBgColor(result.riskLevel)}`}>
          {/* 파일 기본 정보 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {result.isArchive ? (
                <FileArchive className="w-6 h-6 text-yellow-600" />
              ) : (
                <FileText className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{result.filename}</h3>
                <p className="text-sm text-gray-600">
                  {formatFileSize(result.fileSize)} • {result.fileType} • 스캔 시간: {result.scanTime}ms
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getRiskIcon(result.riskLevel)}
              <div className="text-right">
                <span className={`font-semibold ${getRiskColor(result.riskLevel)}`}>
                  위험도: {result.riskLevel === 'low' ? '낮음' : 
                          result.riskLevel === 'medium' ? '보통' : '높음'}
                </span>
                <p className="text-xs text-gray-500">점수: {result.riskScore}/10</p>
              </div>
            </div>
          </div>
          {/* 악성코드 감지 */}
          {result.malwareDetected && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-start">
                <Bug className="w-5 h-5 mr-2 text-red-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700">높은 위험도 파일</p>
                  <p className="text-sm text-red-600 mt-1">
                    여러 위험 지표가 동시에 발견되었습니다. 악성 프로그램일 가능성이 있으니 실행하지 마세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VirusTotal 결과 */}
          {result.virusTotalResult && (
            <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">VirusTotal 스캔 결과</h4>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${
                  result.virusTotalResult.detected ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.virusTotalResult.positives} / {result.virusTotalResult.total} 엔진에서 탐지
                </span>
                <span className="text-xs text-gray-500">
                  스캔 날짜: {new Date(result.virusTotalResult.scanDate).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          )}

          {/* 스캔 방법 및 상세 정보 */}
          {result.scanDetails && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                검사 방법: {result.scanDetails.method}
              </h4>
              <div className="space-y-1">
                {result.scanDetails.findings.map((finding, idx) => (
                  <p key={idx} className="text-xs text-gray-600 flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    {finding}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 의심스러운 패턴 */}
          {result.suspiciousPatterns.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                감지된 위험 요소
              </h4>
              <div className="space-y-2">
                {result.suspiciousPatterns.map((pattern, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      {pattern.split(':')[0]}
                    </p>
                    {pattern.includes(':') && (
                      <p className="text-xs text-red-600 mt-1">
                        {pattern.split(':').slice(1).join(':').trim()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 권장사항 */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                보안 권장사항
              </h4>
              <div className="space-y-1">
                {result.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-blue-800">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 파일 해시 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              파일 해시
            </h4>
            <div className="space-y-1 text-xs font-mono">
              <div>
                <span className="text-gray-600">MD5:</span> {result.hash.md5}
              </div>
              <div>
                <span className="text-gray-600">SHA1:</span> {result.hash.sha1}
              </div>
              <div>
                <span className="text-gray-600">SHA256:</span> {result.hash.sha256}
              </div>
            </div>
          </div>

          {/* 아카이브 내용 */}
          {result.isArchive && result.archiveContents && result.archiveContents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">압축 파일 내용</h4>
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                {result.archiveContents.map((content, contentIdx) => (
                  <div key={contentIdx} className="p-2 bg-white rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{content.filename}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(content.fileSize)})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRiskIcon(content.riskLevel)}
                        <span className={`text-xs ${getRiskColor(content.riskLevel)}`}>
                          {content.riskLevel === 'low' ? '안전' : 
                           content.riskLevel === 'medium' ? '주의' : '위험'}
                        </span>
                      </div>
                    </div>
                    {content.malwareDetected && (
                      <p className="text-xs text-red-600 mt-1">⚠ 악성코드 감지됨</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}