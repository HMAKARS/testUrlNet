import { Metadata } from 'next'
import { 
  Shield, AlertTriangle, CheckCircle, HelpCircle, Search, 
  Zap, Eye, Lock, Globe, Clock, QrCode, Share2, History 
} from 'lucide-react'

export const metadata: Metadata = {
  title: '도움말 - URL Safety Checker',
  description: 'URL Safety Checker 사용법과 기능에 대해 자세히 알아보세요.',
}

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-xl">
            <HelpCircle className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text">도움말</h1>
        <p className="text-lg text-gray-600">URL Safety Checker 사용법과 기능 안내</p>
      </div>

      {/* 빠른 시작 가이드 */}
      <section className="card animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-blue-600" />
          빠른 시작 가이드
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">URL 입력</h3>
            <p className="text-sm text-gray-600">검사하고 싶은 웹사이트 주소를 입력창에 입력하세요.</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">검사 실행</h3>
            <p className="text-sm text-gray-600">"검사하기" 버튼을 클릭하여 안전성 분석을 시작하세요.</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">결과 확인</h3>
            <p className="text-sm text-gray-600">상세한 분석 결과와 권장사항을 확인하고 방문 여부를 결정하세요.</p>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="card animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-green-600" />
          주요 기능
        </h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Lock className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">SSL 인증서 검사</h3>
              <p className="text-gray-600">웹사이트가 HTTPS를 사용하는지, SSL 인증서가 유효한지 확인합니다.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">멀웨어 및 피싱 탐지</h3>
              <p className="text-gray-600">VirusTotal과 Google Safe Browsing API를 통해 멀웨어와 피싱 사이트를 탐지합니다.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Search className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">의심스러운 패턴 분석</h3>
              <p className="text-gray-600">URL 구조, 도메인 패턴, 단축 URL 사용 등을 분석하여 위험 요소를 식별합니다.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Globe className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">네트워크 분석</h3>
              <p className="text-gray-600">HTTP 헤더, 리디렉션 체인, 응답 시간 등을 분석하여 웹사이트의 신뢰성을 평가합니다.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">도메인 정보 조회</h3>
              <p className="text-gray-600">도메인 생성 시기, 등록 정보 등을 확인하여 신규 도메인의 위험성을 평가합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 위험도 레벨 설명 */}
      <section className="card animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">위험도 레벨 이해하기</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">낮음 (안전)</h3>
              <p className="text-green-700">신뢰할 수 있는 웹사이트입니다. 안심하고 방문하세요.</p>
              <ul className="text-sm text-green-600 mt-2 list-disc list-inside">
                <li>HTTPS 사용</li>
                <li>멀웨어/피싱 탐지되지 않음</li>
                <li>정상적인 도메인 패턴</li>
                <li>빠른 응답 시간</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">보통 (주의)</h3>
              <p className="text-yellow-700">일부 위험 요소가 있습니다. 주의해서 방문하세요.</p>
              <ul className="text-sm text-yellow-600 mt-2 list-disc list-inside">
                <li>HTTP 사용 또는 인증서 문제</li>
                <li>URL 단축 서비스 사용</li>
                <li>신규 도메인</li>
                <li>일부 의심스러운 패턴</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">높음 (위험)</h3>
              <p className="text-red-700">매우 위험한 웹사이트입니다. 방문을 권장하지 않습니다.</p>
              <ul className="text-sm text-red-600 mt-2 list-disc list-inside">
                <li>멀웨어 또는 피싱 탐지</li>
                <li>IP 주소 직접 사용</li>
                <li>다수의 의심스러운 패턴</li>
                <li>과도한 리디렉션</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 고급 기능 */}
      <section className="card animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">고급 기능</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">QR 코드 스캔</h3>
            </div>
            <p className="text-gray-600 text-sm">
              카메라나 이미지 파일을 통해 QR 코드를 스캔하여 URL을 자동으로 입력할 수 있습니다.
            </p>
          </div> */}
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <History className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">검사 이력</h3>
            </div>
            <p className="text-gray-600 text-sm">
              최근 검사한 URL들의 이력을 확인하고 다시 검사할 수 있습니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">결과 공유</h3>
            </div>
            <p className="text-gray-600 text-sm">
              검사 결과를 다른 사람들과 공유하여 위험한 사이트에 대해 경고할 수 있습니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">상세 정보</h3>
            </div>
            <p className="text-gray-600 text-sm">
              HTTP 헤더, 리디렉션 체인 등 기술적인 상세 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="card animate-fade-in">
        <h2 className="text-2xl font-bold mb-6">자주 묻는 질문</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold mb-2">Q: 검사 결과가 100% 정확한가요?</h3>
            <p className="text-gray-600 text-sm">
              여러 보안 데이터베이스와 분석 기법을 조합하여 높은 정확도를 제공하지만, 
              100% 완벽하지는 않습니다. 중요한 정보 입력 시에는 추가적인 주의가 필요합니다.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold mb-2">Q: 개인정보가 수집되나요?</h3>
            <p className="text-gray-600 text-sm">
              검사한 URL이나 개인정보는 서버에 저장되지 않습니다. 
              모든 데이터는 브라우저에만 저장되며, 사용자가 직접 관리할 수 있습니다.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold mb-2">Q: 어떤 URL 형식을 지원하나요?</h3>
            <p className="text-gray-600 text-sm">
              HTTP, HTTPS 프로토콜을 사용하는 모든 웹사이트 URL을 지원합니다. 
              단축 URL도 지원하며, 실제 대상 URL로 자동 해석됩니다.
            </p>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold mb-2">Q: 위험한 사이트로 판정되었는데 실제로는 안전하다면?</h3>
            <p className="text-gray-600 text-sm">
              가끔 오탐(False Positive)이 발생할 수 있습니다. 
              신뢰할 수 있는 출처라고 확신한다면 주의깊게 방문하되, 개인정보 입력은 피하세요.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold mb-2">Q: 검사 속도를 높이려면?</h3>
            <p className="text-gray-600 text-sm">
              이전에 검사한 URL은 캐시되어 더 빠르게 결과를 제공합니다. 
              또한 브라우저가 최신 버전이고 안정적인 인터넷 연결이 있을 때 최적의 성능을 발휘합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 보안 팁 */}
      <section className="card animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">💡 인터넷 보안 팁</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-800">✅ 해야 할 것</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• 항상 HTTPS 사용하는 사이트 방문</li>
              <li>• 의심스러운 링크는 먼저 검사</li>
              <li>• 브라우저와 보안 소프트웨어 최신 업데이트</li>
              <li>• 중요한 사이트는 직접 주소 입력</li>
              <li>• 이메일이나 메시지의 링크 주의</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-red-800">❌ 하지 말아야 할 것</h3>
            <ul className="space-y-2 text-sm text-red-700">
              <li>• 의심스러운 사이트에 개인정보 입력</li>
              <li>• 출처 불명의 파일 다운로드</li>
              <li>• 팝업창의 경고 메시지 신뢰</li>
              <li>• 공공 Wi-Fi에서 중요 정보 입력</li>
              <li>• URL 단축 서비스 맹신</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 연락처 */}
      <section className="card animate-fade-in text-center">
        <h2 className="text-2xl font-bold mb-4">더 궁금한 점이 있으신가요?</h2>
        <p className="text-gray-600 mb-6">
          추가적인 도움이 필요하시거나 기능 개선 제안이 있으시면 언제든 연락해주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/contact" 
            className="btn-primary"
          >
            문의하기
          </a>
          <a 
            href="/faq" 
            className="btn-secondary"
          >
            FAQ 보기
          </a>
        </div>
      </section>
    </div>
  )
}