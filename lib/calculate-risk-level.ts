// 위험도 계산 - 엑셀 파일 지원 추가
function calculateRiskLevel(patterns: string[], malwareDetected: boolean, excelRiskScore?: number): { level: 'low' | 'medium' | 'high' | 'critical'; score: number } {
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
  
  // 엑셀 파일의 위험 점수도 고려
  if (excelRiskScore !== undefined) {
    score = Math.max(score, excelRiskScore)
  }
  
  const level = score >= 10 ? 'critical' : score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low'
  
  return { level, score: Math.min(10, score) }
}