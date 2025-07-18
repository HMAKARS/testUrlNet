import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { scanExcelFile, generateExcelRecommendations, ExcelScanResult } from '@/lib/excel-security-scanner'

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
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
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
  // 엑셀 파일 전용 필드
  isExcelFile?: boolean
  excelScanResult?: ExcelScanResult
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

// 알려진 문서/이미지 확장자 (위장에 자주 사용되는 것들)
const DECOY_EXTENSIONS = [
  // 문서 파일
  'doc', 'docx', 'pdf', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx',
  'odt', 'ods', 'odp', 'pages', 'numbers', 'key',
  
  // 이미지 파일  
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif',
  
  // 미디어 파일
  'mp3', 'mp4', 'avi', 'mov', 'wav', 'flv', 'wmv', 'mkv',
  
  // 압축 파일
  'zip', 'rar', '7z', 'tar', 'gz'
]

// 알려진 확장자인지 확인 (4글자 이하, 영문자/숫자만)
function isValidExtension(ext: string): boolean {
  if (!ext || ext.length === 0) return false
  if (ext.length > 4) return false // 대부분의 확장자는 4글자 이하
  
  // 영문자와 숫자만 포함하는지 확인
  const validExtPattern = /^[a-zA-Z0-9]+$/
  return validExtPattern.test(ext)
}

// 개선된 이중 확장자 검사
function checkDoubleExtension(filename: string): string[] {
  const patterns: string[] = []
  const nameParts = filename.split('.')
  
  // .이 2개 이상 있어야 함 (최소한 name.ext1.ext2 형태)
  if (nameParts.length < 3) return patterns
  
  // 마지막 확장자 (실제 파일 타입)
  const lastExt = nameParts[nameParts.length - 1].toLowerCase()
  
  // 마지막 확장자가 유효한 확장자가 아니면 이중 확장자가 아님
  if (!isValidExtension(lastExt)) {
    return patterns
  }
  
  // 마지막에서 두 번째 확장자
  const secondLastExt = nameParts[nameParts.length - 2].toLowerCase()
  
  // 두 번째 확장자도 유효한 확장자여야 함
  if (!isValidExtension(secondLastExt)) {
    return patterns
  }
  
  // 실제 위험한 패턴인지 확인
  const isDangerous = SUSPICIOUS_EXTENSIONS.includes(lastExt)
  const isDecoy = DECOY_EXTENSIONS.includes(secondLastExt)
  
  if (isDangerous && isDecoy) {
    // 진짜 위험한 이중 확장자 (문서로 위장한 실행파일)
    patterns.push(`⚠️ 위험한 이중 확장자 감지 (.${secondLastExt}.${lastExt}): ${getExtensionDescription(secondLastExt)}로 위장한 ${getExtensionDescription(lastExt)}`)
  } else if (isDangerous && nameParts.length > 3) {
    // 여러 개의 확장자가 있는 실행파일 (더 의심스러움)
    const allExts = nameParts.slice(1).join('.')
    patterns.push(`⚠️ 다중 확장자 실행파일 감지 (.${allExts}): 파일 형식을 숨기려는 시도일 가능성`)
  }
  
  return patterns
}
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
// 강화된 의심스러운 패턴 검사
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
  
  // 개선된 이중 확장자 검사
  const doubleExtPatterns = checkDoubleExtension(filename)
  patterns.push(...doubleExtPatterns)
  
  // PE 헤더 검사 (Windows 실행 파일) - 강화된 버전
  if (buffer.length >= 64) { // PE 헤더 검사를 위해 더 많은 바이트 확인
    const header = buffer.toString('ascii', 0, 2)
    const hexHeader = buffer.toString('hex', 0, 2).toUpperCase()
    
    if (header === 'MZ' || hexHeader === '4D5A') {
      // PE 헤더가 발견된 경우 추가 분석
      let description = 'Windows PE 실행 파일 구조 발견'
      
      // DOS 헤더 내의 PE 헤더 오프셋 확인
      if (buffer.length >= 60) {
        const peOffset = buffer.readUInt32LE(60)
        if (peOffset < buffer.length - 4) {
          const peSignature = buffer.toString('ascii', peOffset, peOffset + 4)
          if (peSignature === 'PE\0\0') {
            description += ' (유효한 PE 구조 확인됨)'
          }
        }
      }
      
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
  
  // ZIP 파일 시그니처 검사 강화
  if (ext === 'zip' && buffer.length >= 4) {
    const zipSignature = buffer.toString('hex', 0, 4).toUpperCase()
    const validZipSignatures = ['504B0304', '504B0506', '504B0708']
    
    if (!validZipSignatures.includes(zipSignature)) {
      // 추가로 다른 압축 파일 형식인지 확인
      if (zipSignature === '52617221') { // RAR
        patterns.push('⚠️ ZIP이 아닌 RAR 파일입니다 - 확장자가 잘못되었습니다')
      } else if (zipSignature === '377ABCAF') { // 7z
        patterns.push('⚠️ ZIP이 아닌 7-Zip 파일입니다 - 확장자가 잘못되었습니다')
      } else {
        patterns.push('⚠️ 정상적인 ZIP 파일 구조가 아님 - 다른 파일 형식이거나 손상되었을 가능성')
      }
    }
  }
  
  // 엑셀 파일 시그니처 검사
  if ((ext === 'xlsx' || ext === 'xls') && buffer.length >= 8) {
    const signature = buffer.toString('hex', 0, 8).toUpperCase()
    
    // XLSX는 ZIP 기반이므로 ZIP 시그니처가 있어야 함
    if (ext === 'xlsx' && !signature.startsWith('504B')) {
      patterns.push('⚠️ XLSX 파일이지만 올바른 파일 구조가 아닙니다')
    }
    
    // XLS는 OLE2 형식이므로 특정 시그니처가 있어야 함
    if (ext === 'xls' && !signature.startsWith('D0CF11E0')) {
      patterns.push('⚠️ XLS 파일이지만 올바른 파일 구조가 아닙니다')
    }
  }
  
  // DOS 스텁 메시지 검사 강화
  const fileContent = buffer.toString('utf8', 0, Math.min(2000, buffer.length)) // 더 많은 바이트 검사
  if (fileContent.includes('This program cannot be run in DOS mode')) {
    patterns.push('DOS 실행 불가 메시지 발견 - Windows 실행 파일의 특징')
  }
  
  // 추가 실행 파일 패턴 검사
  if (fileContent.includes('!This program requires Microsoft Windows') ||
      fileContent.includes('kernel32.dll') ||
      fileContent.includes('LoadLibrary') ||
      fileContent.includes('GetProcAddress')) {
    patterns.push('Windows API 참조 발견 - 실행 파일일 가능성 높음')
  }
  
  // 스크립트 패턴 검사
  const textContent = buffer.toString('utf8', 0, Math.min(1000, buffer.length))
  const scriptPatterns = [
    /powershell/i,
    /cmd\.exe/i,
    /system32/i,
    /eval\(/i,
    /exec\(/i,
    /shell_exec/i,
    /<script[^>]*>/i,
    /document\.write/i,
    /innerHTML/i
  ]
  
  for (const pattern of scriptPatterns) {
    if (pattern.test(textContent)) {
      patterns.push(`스크립트 패턴 발견: ${pattern.source} - 코드 실행 가능성`)
      break
    }
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
// 강화된 위험도 계산
function calculateRiskLevel(patterns: string[], malwareDetected: boolean, isExcelFile: boolean = false, excelRiskLevel?: string): { level: 'low' | 'medium' | 'high' | 'critical'; score: number } {
  let score = 0
  
  if (malwareDetected) score += 15 // 10에서 15로 상향
  
  // 패턴별 가중치 강화
  for (const pattern of patterns) {
    if (pattern.includes('PE(Windows 실행파일) 헤더') || pattern.includes('Windows PE 실행 파일 구조')) {
      score += 10 // 8에서 10으로 상향
    } else if (pattern.includes('압축 파일 내부에 숨겨진 실행 파일')) {
      score += 8 // 7에서 8로 상향
    } else if (pattern.includes('확장자를 위조한 실행 파일')) {
      score += 12 // 새로 추가
    } else if (pattern.includes('위험한 확장자')) {
      score += 6 // 5에서 6으로 상향
    } else if (pattern.includes('이중 확장자')) {
      score += 7 // 6에서 7로 상향
    } else if (pattern.includes('의심스러운 파일명 패턴')) {
      score += 5 // 4에서 5로 상향
    } else if (pattern.includes('Windows API 참조')) {
      score += 8 // 새로 추가
    } else if (pattern.includes('스크립트 패턴')) {
      score += 6 // 새로 추가
    } else if (pattern.includes('DOS 실행 불가 메시지')) {
      score += 9 // 8에서 9로 상향
    } else {
      score += 3 // 2에서 3으로 상향
    }
  }
  
  // 엑셀 파일의 경우 별도 위험도 고려
  if (isExcelFile && excelRiskLevel) {
    if (excelRiskLevel === 'critical') score += 15
    else if (excelRiskLevel === 'high') score += 10
    else if (excelRiskLevel === 'medium') score += 5
    else if (excelRiskLevel === 'low') score += 2
  }
  
  // 강화된 기준
  const level = score >= 15 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low'
  
  return { level, score: Math.min(20, score) } // 최대 점수 20으로 상향
}

// 권장사항 생성
function generateRecommendations(result: Partial<FileScanResult>): string[] {
  const recommendations: string[] = []
  
  if (result.riskLevel === 'critical') {
    recommendations.push('😨 이 파일은 매우 위험합니다. 절대 실행하지 마세요.')
    recommendations.push('🛡️ 신뢰할 수 있는 출처가 확실하지 않다면 파일을 삭제하세요.')
    if (result.malwareDetected) {
      recommendations.push('🛡️ 백신 프로그램으로 정밀 검사를 수행하세요.')
    }
  } else if (result.riskLevel === 'high') {
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
  
  // 강화된 악성코드 판단 기준
  let malwareDetected = false
  const malwareIndicators = []
  
  // 1. 이중 확장자 + 실행 파일
  if (suspiciousPatterns.some(p => p.includes('이중 확장자')) && 
      SUSPICIOUS_EXTENSIONS.includes(ext)) {
    malwareIndicators.push('이중 확장자를 사용한 실행 파일')
  }
  
  // 2. 문서로 위장한 실행 파일 (강화)
  if (suspiciousPatterns.some(p => p.includes('위장한 실행 파일') || p.includes('확장자를 위조한'))) {
    malwareIndicators.push('문서 파일로 위장')
  }
  
  // 3. 의심스러운 파일명 패턴 + 실행 파일
  if (suspiciousPatterns.some(p => p.includes('의심스러운 파일명 패턴')) && 
      SUSPICIOUS_EXTENSIONS.includes(ext)) {
    malwareIndicators.push('의심스러운 파일명 사용')
  }
  
  // 4. Windows API 참조 + 비실행 파일 확장자 (새로 추가)
  if (suspiciousPatterns.some(p => p.includes('Windows API 참조')) && 
      !SUSPICIOUS_EXTENSIONS.includes(ext)) {
    malwareIndicators.push('비실행 파일에서 Windows API 참조')
  }
  
  // 5. 스크립트 패턴 + 비스크립트 파일 (새로 추가)
  if (suspiciousPatterns.some(p => p.includes('스크립트 패턴')) && 
      !['js', 'vbs', 'ps1', 'bat', 'cmd', 'html', 'htm'].includes(ext)) {
    malwareIndicators.push('비스크립트 파일에서 스크립트 코드')
  }
  
  // 6. ZIP 파일인데 PE 헤더 (새로 추가)
  if (suspiciousPatterns.some(p => p.includes('ZIP 파일 헤더 대신 실행 파일 헤더'))) {
    malwareIndicators.push('ZIP으로 위장한 실행 파일')
  }
  
  // 기준 완화: 1개 이상의 강력한 지표 또는 2개 이상의 일반 지표
  const strongIndicators = malwareIndicators.filter(indicator => 
    indicator.includes('위장') || 
    indicator.includes('위조') ||
    indicator.includes('ZIP으로 위장')
  )
  
  malwareDetected = strongIndicators.length >= 1 || malwareIndicators.length >= 2
  
  const { level, score } = calculateRiskLevel(suspiciousPatterns, malwareDetected, false)
  
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
  
  // 엑셀 파일 보안 검사
  if (ext === 'xls' || ext === 'xlsx') {
    console.log('Excel file detected:', filename)
    result.isExcelFile = true
    
    try {
      console.log('Starting Excel security scan...')
      const excelScanResult = scanExcelFile(buffer)
      console.log('Excel scan result:', excelScanResult)
      result.excelScanResult = excelScanResult
      
      // 엑셀 파일의 위험 요소를 suspiciousPatterns에 추가 (강화됨)
      if (excelScanResult.hasVBAMacros) {
        suspiciousPatterns.push('📦 VBA 매크로 포함 - 악성 코드 실행 가능')
      }
      if (excelScanResult.hasDDEFormulas) {
        suspiciousPatterns.push('😨 DDE 공격 패턴 감지 - 극도로 위험한 수식')
      }
      if (excelScanResult.hasCommandInjection) {
        suspiciousPatterns.push('💀 명령어 주입 패턴 감지 - 시스템 명령 실행 시도')
      }
      if (excelScanResult.hasExternalLinks) {
        suspiciousPatterns.push('🔗 외부 링크 포함 - 외부 데이터 연결')
      }
      if (excelScanResult.hasHiddenSheets) {
        suspiciousPatterns.push('👁️ 숨겨진 시트 발견')
      }
      if (excelScanResult.hasEmbeddedObjects) {
        suspiciousPatterns.push('📎 내장된 객체 포함')
      }
      
      // 엑셀 보안 검사 결과를 스캔 상세 정보에 추가
      if (result.scanDetails) {
        result.scanDetails.findings.push(`엑셀 파일 보안 검사 완료`)
        result.scanDetails.findings.push(`시트 수: ${excelScanResult.sheetCount}개`)
        if (excelScanResult.formulaCount > 0) {
          result.scanDetails.findings.push(`수식 수: ${excelScanResult.formulaCount}개 검사됨`)
        }
        if (excelScanResult.securityIssues.length > 0) {
          result.scanDetails.findings.push(`보안 이슈 ${excelScanResult.securityIssues.length}개 발견`)
        }
      }
      
      // 엑셀 파일의 위험도를 고려하여 전체 위험도 재계산
      const excelRiskAdjustment = calculateRiskLevel(suspiciousPatterns, malwareDetected || excelScanResult.riskLevel === 'critical', true, excelScanResult.riskLevel)
      result.riskLevel = excelRiskAdjustment.level
      result.riskScore = excelRiskAdjustment.score
      
      // 엑셀 공격 패턴이 발견되면 악성코드로 표시 (기준 강화)
      if (excelScanResult.hasDDEFormulas || 
          excelScanResult.hasCommandInjection || 
          (excelScanResult.hasVBAMacros && excelScanResult.riskLevel === 'critical') ||
          (excelScanResult.hasVBAMacros && excelScanResult.hasExternalLinks && excelScanResult.hasHiddenSheets)) {
        result.malwareDetected = true
      }
    } catch (error) {
      console.error('Excel scan error:', error)
      suspiciousPatterns.push('엑셀 파일 스캔 실패')
    }
  }
  
  // 권장사항 생성
  result.recommendations = generateRecommendations(result)
  
  // 엑셀 파일인 경우 추가 권장사항
  if (result.isExcelFile && result.excelScanResult) {
    const excelRecommendations = generateExcelRecommendations(result.excelScanResult)
    result.recommendations = [...result.recommendations, ...excelRecommendations]
  }
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
          
          // 압축 파일 내부의 엑셀 파일도 검사했음을 표시
          if (result.isExcelFile) {
            console.log(`Excel file found in archive: ${filename}`)
          }
          
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