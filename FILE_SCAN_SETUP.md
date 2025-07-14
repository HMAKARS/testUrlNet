# 파일 스캔 기능 추가 - 필요한 패키지 설치

ZIP 파일 처리와 파일 스캔 기능을 위해 다음 패키지들을 설치해야 합니다:

```bash
# ZIP 파일 처리를 위한 패키지
npm install adm-zip
npm install --save-dev @types/adm-zip

# 파일 타입 감지를 위한 패키지 (선택사항)
npm install file-type
npm install --save-dev @types/file-type

# 바이러스 스캔을 위한 VirusTotal API (선택사항)
npm install node-virustotal
```

## 환경 변수 설정 (.env.local)

VirusTotal API를 사용하려면 다음 환경 변수를 추가하세요:

```
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

## ZIP 파일 처리 개선

실제 ZIP 파일 내부 스캔을 위해 `/app/api/scan-file/route.ts` 파일의 `scanArchiveContents` 함수를 다음과 같이 수정하세요:

```typescript
import AdmZip from 'adm-zip'

async function scanArchiveContents(buffer: Buffer): Promise<FileScanResult[]> {
  try {
    const zip = new AdmZip(buffer)
    const zipEntries = zip.getEntries()
    const results: FileScanResult[] = []

    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const entryData = entry.getData()
        const result = await scanFile(entry.entryName, entryData, false)
        results.push(result)
      }
    }

    return results
  } catch (error) {
    console.error('Archive extraction error:', error)
    return []
  }
}
```

## 추가 개선사항

1. **파일 크기 제한**: 현재 50MB로 설정되어 있으나, 서버 설정에 따라 조정 필요
2. **파일 타입 검증**: MIME 타입과 실제 파일 내용 비교
3. **실시간 스캔 진행률**: 대용량 파일이나 여러 파일 스캔 시 진행률 표시
4. **스캔 결과 다운로드**: JSON 또는 PDF 형식으로 스캔 결과 다운로드
5. **파일 격리**: 악성 파일 감지 시 격리 또는 삭제 옵션

## 보안 고려사항

1. 업로드된 파일은 임시 디렉토리에 저장 후 스캔 완료 시 즉시 삭제
2. 파일 경로 조작 공격 방지
3. 압축 폭탄(Zip Bomb) 방어
4. 메모리 사용량 제한