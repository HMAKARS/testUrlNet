'use client'

import { useState } from 'react'
import { Shield, FileSearch, Loader2, AlertCircle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import FileScanResults, { FileScanResult } from '@/components/FileScanResults'

export default function FileScanner() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [scanResults, setScanResults] = useState<FileScanResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files)
    setError('')
    setScanResults([])
  }

  const scanFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('스캔할 파일을 선택해주세요')
      return
    }

    setLoading(true)
    setError('')
    setScanResults([])

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      const response = await fetch('/api/scan-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('파일 스캔 중 오류가 발생했습니다')
      }

      const data = await response.json()
      setScanResults(data.results)

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 파일 업로드 섹션 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileSearch className="w-6 h-6 mr-2" />
          파일 보안 스캔
        </h2>
        
        <FileUpload 
          onFileSelect={handleFileSelect}
          maxFileSize={50}
          multiple={true}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </p>
          </div>
        )}
        {selectedFiles.length > 0 && !loading && scanResults.length === 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={scanFiles}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              파일 스캔 시작
            </button>
          </div>
        )}
      </div>

      {/* 스캔 진행 중 */}
      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">파일을 스캔하는 중입니다...</p>
            <p className="text-sm text-gray-500 mt-2">
              {selectedFiles.length}개 파일 분석 중
            </p>
          </div>
        </div>
      )}

      {/* 스캔 결과 */}
      {!loading && scanResults.length > 0 && (
        <>
          <FileScanResults results={scanResults} />
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setSelectedFiles([])
                setScanResults([])
                setError('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              새로운 파일 스캔
            </button>
          </div>
        </>
      )}

      {/* 기능 설명 */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">파일 스캔 기능</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• ZIP, RAR 등 압축 파일 내부 파일까지 검사</li>
          <li>• 악성코드 시그니처 패턴 분석</li>
          <li>• 의심스러운 파일명 및 확장자 검사</li>
          <li>• 파일 해시값 계산 (MD5, SHA1, SHA256)</li>
          <li>• 실행 파일 및 스크립트 파일 위험도 평가</li>
        </ul>
      </div>
    </div>
  )
}