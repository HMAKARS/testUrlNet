import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

// 파일 스캔 결과 타입
interface FileScanResult {
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
// 의심스러운 파일 확장자
const SUSPICIOUS_EXTENSIONS = [
  'exe', 'scr', 'vbs', 'pif', 'cmd', 'bat', 'com',
  'jar', 'reg', 'vbe', 'js', 'jse', 'lnk', 'dll',
  'sys', 'ps1', 'psm1', 'ps1xml', 'ps2', 'ps2xml',
  'psc1', 'psc2', 'msh', 'msh1', 'msh2', 'mshxml',
  'msh1xml', 'msh2xml', 'scf', 'inf', 'app'
]

// 의심스러운 파일명 패턴
const SUSPICIOUS_FILENAME_PATTERNS = [
  /^invoice.*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /^receipt.*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /^document.*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /^photo.*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /^scan.*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /\.(jpg|jpeg|png|gif|doc|pdf).*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i,
  /^\..*\.(exe|scr|bat|cmd|com|pif|vbs|js)$/i, // 숨김 파일
]

// 알려진 악성코드 시그니처 (예시)
const MALWARE_SIGNATURES = [
  {
    signature: 'This program cannot be run in DOS mode',
    description: 'Windows 실행 파일의 DOS 스텁',
    risk: 'high'
  },
  {
    signature: 'MZ',
    description: 'PE(Windows 실행파일) 헤더 - ZIP 내부에 실행 파일이 숨겨져 있을 수 있음',
    risk: 'high'
  },
  {
    signature: '4D5A',
    description: 'PE 파일 헤더 (16진수) - Windows 실행 파일',
    risk: 'high'
  }
]
// 파일 해시 계산
function calculateFileHash(buffer: Buffer): { md5: string; sha1: string; sha256: string } {
  return {
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(buffer).digest('hex')
  }
}

// MIME 타입 추측
function guessMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase().slice(1)
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'exe': 'application/x-msdownload',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}
// 의심스러운 패턴 검사
function checkSuspiciousPatterns(filename: string, buffer: Buffer): string[] {
  const patterns: string[] = []
  const ext = path.extname(filename).toLowerCase().slice(1)
  
  // 실행 가능한 위험 확장자만 검사 (ZIP 제외)
  if (SUSPICIOUS_EXTENSIONS.includes(ext) && ext !== 'zip') {
    patterns.push(`위험한 확장자 (.${ext}): ${getExtensionDescription(ext)}`)
  }
  
  // 의심스러운 파일명 패턴 검사
  for (const pattern of SUSPICIOUS_FILENAME_PATTERNS) {
    if (pattern.test(filename)) {
      patterns.push('의심스러운 파일명 패턴: 일반 문서로 위장한 실행 파일일 가능성')
      break
    }
  }
  
  // 이중 확장자 검사
  const nameParts = filename.split('.')
  if (nameParts.length > 2) {
    const exts = nameParts.slice(1).join('.')
    patterns.push(`이중 확장자 감지 (${exts}): 파일 형식을 숨기려는 시도일 수 있음`)
  }
  
  // PE 헤더 검사 (Windows 실행 파일)
  if (buffer.length >= 2) {
    const header = buffer.toString('ascii', 0, 2)
    const hexHeader = buffer.toString('hex', 0, 2).toUpperCase()
    
    if (header === 'MZ' || hexHeader === '4D5A') {
      // PE 헤더가 발견된 경우 추가 분석
      let description = 'Windows PE 실행 파일 구조 발견'
      
      // ZIP 파일인데 PE 헤더가 있는 경우
      if (ext === 'zip') {
        description = '⚠️ ZIP 파일 헤더 대신 실행 파일 헤더 발견 - 확장자를 위조한 실행 파일'
        patterns.push(description)
      } else if (!SUSPICIOUS_EXTENSIONS.includes(ext)) {
        description += ` - .${ext} 확장자로 위장한 실행 파일`
        patterns.push(description)
      } else {
        // 정상적인 실행 파일
        patterns.push(description)
      }
    }
  }
  
  // ZIP 파일 시그니처 검사
  if (ext === 'zip' && buffer.length >= 4) {
    const zipSignature = buffer.toString('hex', 0, 4).toUpperCase()
    if (zipSignature !== '504B0304' && zipSignature !== '504B0506' && zipSignature !== '504B0708') {
      patterns.push('⚠️ 정상적인 ZIP 파일 구조가 아님 - 다른 파일 형식일 가능성')
    }
  }
  
  // DOS 스텁 메시지 검사
  const fileContent = buffer.toString('utf8', 0, Math.min(1000, buffer.length))
  if (fileContent.includes('This program cannot be run in DOS mode')) {
    patterns.push('DOS 실행 불가 메시지 발견 - Windows 실행 파일의 특징')
  }
  
  // ZIP 파일 내부에 있는 파일의 경우 추가 경고
  if ((filename.includes('/') || filename.includes('\\')) && 
      SUSPICIOUS_EXTENSIONS.includes(ext) && ext !== 'zip') {
    patterns.push('압축 파일 내부에 숨겨진 실행 파일')
  }
  
  return patterns
}

// 확장자별 설명
function getExtensionDescription(ext: string): string {
  const descriptions: Record<string, string> = {
    'exe': 'Windows 실행 파일',
    'scr': '화면 보호기 (실행 파일)',
    'bat': 'Windows 배치 파일',
    'cmd': 'Windows 명령 스크립트',
    'com': 'MS-DOS 실행 파일',
    'pif': 'MS-DOS 프로그램 정보 파일',
    'vbs': 'Visual Basic 스크립트',
    'js': 'JavaScript 파일',
    'jar': 'Java 실행 파일',
    'ps1': 'PowerShell 스크립트',
    'dll': 'Windows 동적 라이브러리',
    'msi': 'Windows 설치 파일'
  }
  return descriptions[ext] || '실행 가능한 파일'
}
// 위험도 계산
function calculateRiskLevel(patterns: string[], malwareDetected: boolean): { level: 'low' | 'medium' | 'high'; score: number } {
  let score = 0
  
  if (malwareDetected) score += 10
  
  // 패턴별 가중치
  for (const pattern of patterns) {
    if (pattern.includes('PE(Windows 실행파일) 헤더')) score += 8
    else if (pattern.includes('압축 파일 내부에 숨겨진 실행 파일')) score += 7
    else if (pattern.includes('위험한 확장자')) score += 5
    else if (pattern.includes('이중 확장자')) score += 6
    else if (pattern.includes('의심스러운 파일명 패턴')) score += 4
    else if (pattern.includes('Windows 실행 파일의 DOS 스텁')) score += 8
    else score += 2
  }
  
  const level = score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low'
  
  return { level, score: Math.min(10, score) }
}

// 권장사항 생성
function generateRecommendations(result: Partial<FileScanResult>): string[] {
  const recommendations: string[] = []
  
  if (result.riskLevel === 'high') {
    recommendations.push('⚠️ 이 파일은 여러 위험 지표가 발견되었습니다. 실행하지 마세요.')
    recommendations.push('💡 파일의 출처를 확인하고, 신뢰할 수 있는 곳에서 다시 다운로드하세요.')
    if (result.malwareDetected) {
      recommendations.push('🛡️ 백신 프로그램으로 정밀 검사를 수행하세요.')
    }
  } else if (result.riskLevel === 'medium') {
    recommendations.push('⚠️ 이 파일에 일부 위험 요소가 있습니다. 주의가 필요합니다.')
    recommendations.push('💡 파일의 출처가 확실한지 다시 한 번 확인하세요.')
  } else {
    recommendations.push('✅ 현재 검사에서는 특별한 위험이 발견되지 않았습니다.')
    recommendations.push('💡 그래도 출처가 불분명한 파일은 항상 주의하세요.')
  }
  
  if (result.suspiciousPatterns?.some(p => p.includes('압축 파일 내부에 숨겨진 실행 파일'))) {
    recommendations.push('🔍 압축 파일 안에 실행 파일이 있습니다. 압축을 풀기 전에 내용을 확인하세요.')
  }
  
  if (result.suspiciousPatterns?.some(p => p.includes('이중 확장자'))) {
    recommendations.push('🎭 이중 확장자는 파일을 속이는 일반적인 방법입니다. 실제 파일 형식을 확인하세요.')
  }
  
  if (result.suspiciousPatterns?.some(p => p.includes('PE 실행 파일 헤더'))) {
    recommendations.push('🔬 이 파일은 Windows 실행 파일입니다. 확실한 출처가 아니면 실행하지 마세요.')
  }
  
  if (result.isArchive && result.archiveContents?.some(f => f.malwareDetected)) {
    recommendations.push('🚨 압축 파일 내부에 위험한 파일이 포함되어 있습니다.')
  }
  
  return recommendations
}

// 단일 파일 스캔
async function scanFile(
  filename: string,
  buffer: Buffer,
  checkWithVirusTotal: boolean = false
): Promise<FileScanResult> {
  const startTime = Date.now()
  
  const hash = calculateFileHash(buffer)
  const mimeType = guessMimeType(filename)
  const ext = path.extname(filename).toLowerCase().slice(1)
  const suspiciousPatterns = checkSuspiciousPatterns(filename, buffer)
  
  // 악성코드 판단 기준 강화
  let malwareDetected = false
  const malwareIndicators = []
  
  // 1. 이중 확장자 + 실행 파일
  if (suspiciousPatterns.some(p => p.includes('이중 확장자')) && 
      SUSPICIOUS_EXTENSIONS.includes(ext)) {
    malwareIndicators.push('이중 확장자를 사용한 실행 파일')
  }
  
  // 2. 문서로 위장한 실행 파일
  if (suspiciousPatterns.some(p => p.includes('위장한 실행 파일'))) {
    malwareIndicators.push('문서 파일로 위장')
  }
  
  // 3. 의심스러운 파일명 패턴 + 실행 파일
  if (suspiciousPatterns.some(p => p.includes('의심스러운 파일명 패턴')) && 
      SUSPICIOUS_EXTENSIONS.includes(ext)) {
    malwareIndicators.push('의심스러운 파일명 사용')
  }
  
  // 3개 이상의 지표가 있을 때만 악성코드로 판단
  malwareDetected = malwareIndicators.length >= 2
  
  const { level, score } = calculateRiskLevel(suspiciousPatterns, malwareDetected)
  
  const result: FileScanResult = {
    filename,
    fileSize: buffer.length,
    fileType: ext || 'unknown',
    mimeType,
    hash,
    scanTime: Date.now() - startTime,
    malwareDetected,
    suspiciousPatterns,
    riskLevel: level,
    riskScore: score,
    isArchive: ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext),
    recommendations: [],
    scanDetails: {
      method: '정적 분석 (Static Analysis)',
      findings: []
    }
  }
  
  // 스캔 상세 정보 추가
  if (result.scanDetails) {
    result.scanDetails.findings.push(`파일 해시 계산 완료 (MD5, SHA1, SHA256)`)
    result.scanDetails.findings.push(`파일 헤더 분석: 첫 1KB 바이트 검사`)
    result.scanDetails.findings.push(`확장자 검증: .${ext} 파일 형식 확인`)
    
    if (suspiciousPatterns.some(p => p.includes('PE 실행 파일 헤더'))) {
      result.scanDetails.findings.push(`PE 헤더 발견: Windows 실행 파일 구조 확인됨`)
    }
    
    if (result.isArchive) {
      result.scanDetails.findings.push(`압축 파일로 확인됨 - 내부 파일 추가 검사 필요`)
    }
  }
  
  // 권장사항 추가
  result.recommendations = generateRecommendations(result)
  // VirusTotal API 연동 (실제 구현시 API 키 필요)
  if (checkWithVirusTotal && process.env.VIRUSTOTAL_API_KEY) {
    // 실제 구현시 VirusTotal API 호출
    // result.virusTotalResult = await checkWithVirusTotal(hash.sha256)
  }
  
  return result
}

// ZIP 파일 내용 스캔
async function scanArchiveContents(buffer: Buffer): Promise<FileScanResult[]> {
  const AdmZip = require('adm-zip')
  const iconv = require('iconv-lite')
  
  try {
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()
    const results: FileScanResult[] = []

    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        try {
          let filename = entry.entryName
          
          // 한글 인코딩 처리 (CP949/EUC-KR)
          try {
            // 파일명이 깨져있는지 확인
            if (filename.includes('�') || /[\u0080-\u00FF]/.test(filename)) {
              // CP949로 디코딩 시도
              const rawFileName = Buffer.from(filename, 'latin1')
              if (iconv.encodingExists('cp949')) {
                filename = iconv.decode(rawFileName, 'cp949')
              }
            }
          } catch (encodingError) {
            console.log('Encoding error, using original filename')
          }
          
          const entryData = entry.getData()
          const result = await scanFile(filename, entryData, false)
          results.push(result)
        } catch (error) {
          console.error(`Error scanning ${entry.entryName}:`, error)
        }
      }
    }

    return results
  } catch (error) {
    console.error('Archive extraction error:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '파일이 업로드되지 않았습니다' },
        { status: 400 }
      )
    }
    
    const results: FileScanResult[] = []
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await scanFile(file.name, buffer)
      
      // ZIP 파일인 경우 내부 파일도 스캔
      if (result.isArchive) {
        try {
          result.archiveContents = await scanArchiveContents(buffer)
        } catch (error) {
          console.error('Archive scan error:', error)
          result.suspiciousPatterns.push('압축 파일 스캔 실패')
        }
      }
      
      results.push(result)
    }
    return NextResponse.json({ results })
    
  } catch (error) {
    console.error('File scan error:', error)
    return NextResponse.json(
      { error: '파일 스캔 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}