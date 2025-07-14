'use client'

import { useState, useRef } from 'react'
import { Upload, File, AlertTriangle, X, FileArchive, FileText, FileCode, Shield } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  maxFileSize?: number // MB 단위
  accept?: string
  multiple?: boolean
}

export default function FileUpload({ 
  onFileSelect, 
  maxFileSize = 50, // 기본 50MB
  accept = '*',
  multiple = false 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <FileArchive className="w-5 h-5 text-yellow-600" />
    } else if (['txt', 'doc', 'docx', 'pdf'].includes(ext || '')) {
      return <FileText className="w-5 h-5 text-blue-600" />
    } else if (['js', 'exe', 'bat', 'cmd', 'ps1', 'sh'].includes(ext || '')) {
      return <FileCode className="w-5 h-5 text-red-600" />
    }
    return <File className="w-5 h-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFiles = (fileList: FileList | File[]): { valid: File[], errors: string[] } => {
    const valid: File[] = []
    const errors: string[] = []
    const maxSizeBytes = maxFileSize * 1024 * 1024

    Array.from(fileList).forEach(file => {
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: 파일 크기가 ${maxFileSize}MB를 초과합니다`)
      } else {
        valid.push(file)
      }
    })

    return { valid, errors }
  }
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList: FileList) => {
    const { valid, errors: validationErrors } = validateFiles(fileList)
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
    }

    if (valid.length > 0) {
      const newFiles = multiple ? [...files, ...valid] : valid
      setFiles(newFiles)
      onFileSelect(newFiles)
    }
  }
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFileSelect(newFiles)
  }

  const clearErrors = () => {
    setErrors([])
  }

  return (
    <div className="w-full">
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`relative p-8 border-2 border-dashed rounded-lg transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            파일을 드래그 앤 드롭하거나
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            파일 선택
          </button>
          <p className="mt-2 text-xs text-gray-500">
            최대 {maxFileSize}MB, ZIP 파일 및 일반 파일 지원
          </p>
        </div>
      </div>
      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </p>
              ))}
            </div>
            <button
              onClick={clearErrors}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">선택된 파일</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}