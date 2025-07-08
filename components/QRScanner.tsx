'use client'

import { useState, useRef } from 'react'
import { QrCode, X, Camera, Upload } from 'lucide-react'

interface QRScannerProps {
  onScan: (url: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')
      
      // QR 코드 파싱을 위한 라이브러리가 필요함
      // 여기서는 간단한 시뮬레이션
      const reader = new FileReader()
      reader.onload = () => {
        // 실제로는 QR 코드 디코딩 라이브러리 사용
        // 예: qr-scanner, jsQR 등
        
        // 임시로 파일명에서 URL 추출 시뮬레이션
        const dummyUrl = 'https://example.com'
        onScan(dummyUrl)
        onClose()
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('QR 코드를 읽을 수 없습니다.')
    }
  }

  const startCamera = async () => {
    try {
      setIsScanning(true)
      setError('')
      
      // 실제로는 카메라 스트림 시작
      // navigator.mediaDevices.getUserMedia({ video: true })
      
      // 임시 시뮬레이션
      setTimeout(() => {
        setIsScanning(false)
        setError('카메라 기능은 개발 중입니다. 파일 업로드를 이용해주세요.')
      }, 2000)
    } catch (err) {
      setError('카메라에 접근할 수 없습니다.')
      setIsScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR 코드 스캔
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 카메라 스캔 */}
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
              {isScanning ? (
                <div className="animate-pulse">
                  <Camera className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">스캔 중...</p>
                </div>
              ) : (
                <div>
                  <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    카메라로 QR 코드를 스캔하세요
                  </p>
                  <button
                    onClick={startCamera}
                    className="btn-primary"
                    disabled={isScanning}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    카메라 시작
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 파일 업로드 */}
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                QR 코드 이미지 파일 업로드
              </p>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}