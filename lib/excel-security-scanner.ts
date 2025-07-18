import * as XLSX from 'xlsx'

export interface ExcelSecurityIssue {
  type: 'macro' | 'external_link' | 'hidden_content' | 'malicious_formula' | 'embedded_object' | 'dde_attack' | 'suspicious_pattern' | 'command_injection'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  details?: string
  rawContent?: string // 원본 내용 추가
}

export interface ExcelScanResult {
  hasVBAMacros: boolean
  hasExternalLinks: boolean
  hasHiddenSheets: boolean
  hasHiddenRowsCols: boolean
  hasDDEFormulas: boolean
  hasEmbeddedObjects: boolean
  hasCommandInjection: boolean // 새로 추가
  securityIssues: ExcelSecurityIssue[]
  sheetCount: number
  formulaCount: number
  externalLinkCount: number
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// 강화된 DDE 공격 패턴 - = 없이 시작하는 패턴도 포함
const ENHANCED_DDE_PATTERNS = [
  // 기존 패턴
  /=DDE\(/i,
  /=DDEAUTO\(/i,
  /=cmd\|/i,
  /=msexcel\|/i,
  /=excel\|/i,
  /@SUM\(.*cmd/i,
  /=.*\|'.*!/i,
  
  // 강화된 패턴 - = 없이 시작
  /^cmd\|/i,
  /^msexcel\|/i,
  /^excel\|/i,
  /^winword\|/i,
  /^powershell\|/i,
  /^[a-zA-Z]+\|.*![A-Z0-9]+$/i, // 일반적인 DDE 패턴
  
  // 명령어 실행 패턴
  /cmd.*\/c/i,
  /powershell.*exe/i,
  /system32.*exe/i,
  /calc\.exe/i,
  /notepad\.exe/i,
  /cmd\.exe/i,
  
  // 숨겨진 DDE 패턴
  /DDEAUTO.*cmd/i,
  /DDEAUTO.*powershell/i,
  /DDEAUTO.*system32/i,
]

// 강화된 위험한 함수들
const ENHANCED_DANGEROUS_FUNCTIONS = [
  'HYPERLINK',
  'WEBSERVICE', 
  'FILTERXML',
  'RTD',
  'CUBEVALUE',
  'CUBEMEMBER',
  'CUBERANKEDMEMBER',
  'CUBESET',
  'CUBESETCOUNT',
  'CUBEKPIMEMBER',
  'CALL', // 외부 DLL 호출
  'REGISTER', // 외부 함수 등록
  'EVALUATE', // 동적 수식 실행
  'EXEC', // 실행
  'SHELL', // 쉘 실행
]

// 명령어 주입 패턴
const COMMAND_INJECTION_PATTERNS = [
  /\/c\s+/i, // cmd /c
  /\/k\s+/i, // cmd /k
  /-c\s+/i, // powershell -c
  /-e\s+/i, // powershell -e
  /\\system32\\/i, // system32 경로
  /\\windows\\/i, // windows 경로
  /\.exe\b/i, // 실행 파일
  /\.bat\b/i, // 배치 파일
  /\.cmd\b/i, // 명령 파일
  /\.ps1\b/i, // PowerShell 스크립트
  /calc\b/i, // 계산기 실행 (테스트용)
  /notepad\b/i, // 메모장 실행
  /taskkill/i, // 프로세스 종료
  /net\s+user/i, // 사용자 계정 조작
]

// 의심스러운 외부 프로토콜 (확장)
const ENHANCED_SUSPICIOUS_PROTOCOLS = [
  'file://',
  'ftp://',
  'http://',
  'https://',
  'ldap://',
  'mailto:',
  'news:',
  'nntp:',
  'telnet:',
  'gopher:',
  'wais:',
  'smb://', // 네트워크 공유
  'unc://', // UNC 경로
  '\\\\', // UNC 경로 시작
]

export function scanExcelFile(buffer: Buffer): ExcelScanResult {
  let workbook: XLSX.WorkBook
  
  try {
    workbook = XLSX.read(buffer, {
      type: 'buffer',
      bookVBA: true,
      bookFiles: true,
      bookProps: true,
      cellFormula: true,
      cellHTML: false,
      cellStyles: true,
      cellNF: true,
      raw: true, // 원시 데이터도 읽어오도록 설정
      cellText: true // 텍스트도 읽어오도록 설정
    })
    console.log('Excel file parsed successfully')
    console.log('SheetNames:', workbook.SheetNames)
  } catch (error) {
    console.error('Failed to parse Excel file:', error)
    return {
      hasVBAMacros: false,
      hasExternalLinks: false,
      hasHiddenSheets: false,
      hasHiddenRowsCols: false,
      hasDDEFormulas: false,
      hasEmbeddedObjects: false,
      hasCommandInjection: false,
      securityIssues: [{
        type: 'suspicious_pattern',
        severity: 'medium',
        description: '엑셀 파일 형식이 손상되었거나 알 수 없는 형식입니다',
        details: '파일을 열 수 없으므로 보안 검사를 수행할 수 없습니다'
      }],
      sheetCount: 0,
      formulaCount: 0,
      externalLinkCount: 0,
      riskScore: 5,
      riskLevel: 'medium'
    }
  }

  const result: ExcelScanResult = {
    hasVBAMacros: false,
    hasExternalLinks: false,
    hasHiddenSheets: false,
    hasHiddenRowsCols: false,
    hasDDEFormulas: false,
    hasEmbeddedObjects: false,
    hasCommandInjection: false,
    securityIssues: [],
    sheetCount: workbook.SheetNames ? workbook.SheetNames.length : 0,
    formulaCount: 0,
    externalLinkCount: 0,
    riskScore: 0,
    riskLevel: 'low'
  }

  // VBA 매크로 검사 (강화)
  if (workbook.vbaraw || (workbook as any).Macros || (workbook as any).vba) {
    result.hasVBAMacros = true
    result.securityIssues.push({
      type: 'macro',
      severity: 'critical', // high에서 critical로 상향
      description: 'VBA 매크로가 포함되어 있습니다',
      details: '매크로는 악성 코드를 실행할 수 있는 가장 일반적인 방법입니다'
    })
    result.riskScore += 10 // 8에서 10으로 상향
  }

  // 각 시트 검사 (강화된 로직)
  if (workbook.SheetNames && workbook.SheetNames.length > 0) {
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      const sheet = workbook.Sheets[sheetName]
      
      if (!sheet) return
      
      // 숨겨진 시트 검사
      if ((workbook as any).Workbook?.Sheets?.[sheetIndex]?.Hidden) {
        result.hasHiddenSheets = true
        result.securityIssues.push({
          type: 'hidden_content',
          severity: 'high', // medium에서 high로 상향
          description: `숨겨진 시트 발견: ${sheetName}`,
          location: sheetName,
          details: '숨겨진 시트에 악성 코드나 데이터가 포함될 수 있습니다'
        })
        result.riskScore += 5 // 3에서 5로 상향
      }

      // 강화된 셀 검사
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        // 숨겨진 행 검사
        if (sheet['!rows']?.[row]?.hidden) {
          result.hasHiddenRowsCols = true
          if (!result.securityIssues.some(issue => 
            issue.type === 'hidden_content' && issue.description.includes('숨겨진 행/열'))) {
            result.securityIssues.push({
              type: 'hidden_content',
              severity: 'medium',
              description: '숨겨진 행/열이 발견되었습니다',
              location: sheetName,
              details: '숨겨진 행/열에 민감한 데이터가 포함될 수 있습니다'
            })
            result.riskScore += 3
          }
        }

        for (let col = range.s.c; col <= range.e.c; col++) {
          // 숨겨진 열 검사
          if (sheet['!cols']?.[col]?.hidden) {
            result.hasHiddenRowsCols = true
          }

          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = sheet[cellAddress]
          
          if (!cell) continue

          // 강화된 수식 검사 - 모든 가능한 형태의 수식 검사
          const formulaCandidates: string[] = []
          
          // 1. 표준 수식 필드
          if (cell.f) {
            formulaCandidates.push(cell.f.toString())
            result.formulaCount++
          }
          
          // 2. 값 필드에서 수식 형태
          if (cell.v && typeof cell.v === 'string') {
            if (cell.v.startsWith('=')) {
              formulaCandidates.push(cell.v)
              result.formulaCount++
            } else {
              // = 없이 시작하는 DDE 패턴도 검사
              formulaCandidates.push(cell.v)
            }
          }
          
          // 3. 원시 텍스트 검사
          if (cell.w && typeof cell.w === 'string') {
            formulaCandidates.push(cell.w)
          }
          
          // 4. HTML 형태 검사 (필요시)
          if (cell.h && typeof cell.h === 'string') {
            formulaCandidates.push(cell.h)
          }

          // 모든 후보에 대해 보안 검사 수행
          formulaCandidates.forEach(formula => {
            if (!formula || formula.trim() === '') return
            
            console.log(`Checking formula at ${sheetName}!${cellAddress}: ${formula}`)
            
            // 강화된 DDE 공격 패턴 검사
            for (const pattern of ENHANCED_DDE_PATTERNS) {
              if (pattern.test(formula)) {
                result.hasDDEFormulas = true
                result.securityIssues.push({
                  type: 'dde_attack',
                  severity: 'critical',
                  description: 'DDE 공격 패턴이 감지되었습니다',
                  location: `${sheetName}!${cellAddress}`,
                  details: `위험한 수식 패턴이 발견되었습니다`,
                  rawContent: formula.substring(0, 100) // 원본 내용 일부 저장
                })
                result.riskScore += 15 // 10에서 15로 상향
                break
              }
            }

            // 명령어 주입 패턴 검사
            for (const pattern of COMMAND_INJECTION_PATTERNS) {
              if (pattern.test(formula)) {
                result.hasCommandInjection = true
                result.securityIssues.push({
                  type: 'command_injection',
                  severity: 'critical',
                  description: '명령어 실행 패턴이 감지되었습니다',
                  location: `${sheetName}!${cellAddress}`,
                  details: `시스템 명령어를 실행하려는 시도가 발견되었습니다`,
                  rawContent: formula.substring(0, 100)
                })
                result.riskScore += 12
                break
              }
            }

            // 강화된 위험한 함수 검사
            for (const func of ENHANCED_DANGEROUS_FUNCTIONS) {
              if (formula.toUpperCase().includes(func)) {
                const severity = ['CALL', 'REGISTER', 'EXEC', 'SHELL'].includes(func) ? 'critical' : 'high'
                result.securityIssues.push({
                  type: 'malicious_formula',
                  severity: severity as 'critical' | 'high',
                  description: `위험한 함수 사용: ${func}`,
                  location: `${sheetName}!${cellAddress}`,
                  details: '외부 코드 실행이나 시스템 호출이 가능합니다',
                  rawContent: formula.substring(0, 100)
                })
                result.riskScore += severity === 'critical' ? 10 : 6
                break
              }
            }

            // 강화된 외부 링크 검사
            if (formula.includes('[') || formula.includes('!') || formula.includes('://')) {
              result.hasExternalLinks = true
              result.externalLinkCount++
              
              // 의심스러운 프로토콜 검사
              for (const protocol of ENHANCED_SUSPICIOUS_PROTOCOLS) {
                if (formula.toLowerCase().includes(protocol.toLowerCase())) {
                  result.securityIssues.push({
                    type: 'external_link',
                    severity: protocol.includes('file://') || protocol.includes('\\\\') ? 'critical' : 'high',
                    description: `의심스러운 외부 링크: ${protocol}`,
                    location: `${sheetName}!${cellAddress}`,
                    details: '로컬 파일이나 네트워크 리소스에 접근을 시도할 수 있습니다',
                    rawContent: formula.substring(0, 100)
                  })
                  result.riskScore += protocol.includes('file://') || protocol.includes('\\\\') ? 8 : 6
                  break
                }
              }
            }
          })

          // 하이퍼링크 검사 (강화)
          if (cell.l) {
            result.hasExternalLinks = true
            result.externalLinkCount++
            
            const target = cell.l.Target || ''
            for (const protocol of ENHANCED_SUSPICIOUS_PROTOCOLS) {
              if (target.toLowerCase().includes(protocol.toLowerCase())) {
                result.securityIssues.push({
                  type: 'external_link',
                  severity: 'high',
                  description: `하이퍼링크 발견: ${protocol}`,
                  location: `${sheetName}!${cellAddress}`,
                  details: `링크 대상: ${target.substring(0, 50)}...`,
                  rawContent: target
                })
                result.riskScore += 4
                break
              }
            }
          }
        }
      }
    })
  }

  // 내장 객체 검사 (강화)
  if ((workbook as any).Workbook?.Objects || (workbook as any).embeddings || (workbook as any).objects) {
    result.hasEmbeddedObjects = true
    result.securityIssues.push({
      type: 'embedded_object',
      severity: 'critical', // high에서 critical로 상향
      description: '내장된 객체가 발견되었습니다',
      details: '내장된 객체는 악성 코드를 포함할 수 있습니다'
    })
    result.riskScore += 8 // 6에서 8로 상향
  }

  // 정의된 이름(Named Ranges) 검사 강화
  if ((workbook as any).Workbook?.Names && Array.isArray((workbook as any).Workbook.Names)) {
    const suspiciousNames: string[] = [
      'Auto_Open', 'Auto_Close', 'Auto_Exec', 'AutoOpen', 'AutoClose', 'AutoExec',
      'Workbook_Open', 'Workbook_Close', 'Workbook_Activate', 'Workbook_Deactivate'
    ]
    
    ((workbook as any).Workbook.Names as any[]).forEach((name: any) => {
      if (suspiciousNames.some(suspicious => 
        name.Name?.toUpperCase().includes(suspicious.toUpperCase()))) {
        result.securityIssues.push({
          type: 'suspicious_pattern',
          severity: 'critical', // high에서 critical로 상향
          description: `의심스러운 자동 실행 이름 발견: ${name.Name}`,
          details: '파일을 열 때 자동으로 코드가 실행될 수 있습니다'
        })
        result.riskScore += 10 // 7에서 10으로 상향
      }
    })
  }

  // 최종 위험도 평가 (기준 강화)
  if (result.riskScore >= 15) {
    result.riskLevel = 'critical'
  } else if (result.riskScore >= 10) {
    result.riskLevel = 'high'
  } else if (result.riskScore >= 5) {
    result.riskLevel = 'medium'
  } else {
    result.riskLevel = 'low'
  }

  console.log(`Excel scan completed. Risk score: ${result.riskScore}, Level: ${result.riskLevel}`)
  console.log(`Security issues found: ${result.securityIssues.length}`)

  return result
}

// 강화된 엑셀 파일 권장사항 생성
export function generateExcelRecommendations(scanResult: ExcelScanResult): string[] {
  const recommendations: string[] = []

  if (scanResult.riskLevel === 'critical') {
    recommendations.push('🚨 이 파일은 극도로 위험합니다. 즉시 삭제하세요.')
    recommendations.push('🛡️ 절대 매크로를 활성화하거나 파일을 실행하지 마세요.')
    recommendations.push('🔒 백신 프로그램으로 시스템 전체 검사를 수행하세요.')
  } else if (scanResult.riskLevel === 'high') {
    recommendations.push('⚠️ 이 파일에는 심각한 위험 요소가 있습니다.')
    recommendations.push('🔍 파일 출처를 반드시 확인하고, 매크로는 비활성화하세요.')
    recommendations.push('💡 신뢰할 수 있는 출처에서 다시 다운로드하는 것을 권장합니다.')
  }

  if (scanResult.hasVBAMacros) {
    recommendations.push('📌 VBA 매크로가 포함되어 있습니다. 매크로를 절대 활성화하지 마세요.')
    recommendations.push('💡 Excel에서 "보호된 보기"로 먼저 열어보세요.')
  }

  if (scanResult.hasDDEFormulas) {
    recommendations.push('🚫 DDE 공격 패턴이 발견되었습니다. 이 파일을 열지 마세요.')
    recommendations.push('⚡ Excel의 DDE 및 외부 링크 기능을 비활성화하세요.')
  }

  if (scanResult.hasCommandInjection) {
    recommendations.push('🚨 시스템 명령어 실행 시도가 발견되었습니다. 매우 위험합니다.')
    recommendations.push('🛡️ 이 파일을 격리하고 보안 팀에 신고하세요.')
  }

  if (scanResult.hasExternalLinks) {
    recommendations.push('🔗 외부 링크가 포함되어 있습니다. 자동 업데이트를 비활성화하세요.')
    recommendations.push('🌐 링크된 외부 파일이나 웹사이트가 안전한지 확인하세요.')
  }

  if (scanResult.hasHiddenSheets || scanResult.hasHiddenRowsCols) {
    recommendations.push('👁️ 숨겨진 시트나 행/열이 있습니다. 모두 표시하여 내용을 확인하세요.')
  }

  if (scanResult.hasEmbeddedObjects) {
    recommendations.push('📎 내장된 객체가 있습니다. 더블클릭하여 실행하지 마세요.')
  }

  if (scanResult.riskLevel === 'low' && scanResult.securityIssues.length === 0) {
    recommendations.push('✅ 기본적인 보안 검사를 통과했습니다.')
    recommendations.push('💡 그래도 출처가 불분명한 파일은 항상 주의하세요.')
  }

  return recommendations
}
