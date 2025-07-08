import { Metadata } from 'next'
import { 
  Shield, Heart, Code, Users, Globe, Target, Lightbulb, 
  Github, Star, Coffee, Award, Zap, Lock 
} from 'lucide-react'

export const metadata: Metadata = {
  title: '소개 - URL Safety Checker',
  description: 'URL Safety Checker의 목표와 개발 철학, 기술 스택에 대해 알아보세요.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* 헤더 */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl text-white shadow-2xl">
            <Shield className="w-16 h-16" />
          </div>
        </div>
        <h1 className="text-5xl font-bold gradient-text">URL Safety Checker</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          더 안전한 인터넷 환경을 만들어가는 오픈소스 보안 도구
        </p>
      </div>

      {/* 미션 */}
      <section className="card animate-fade-in">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Target className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold">우리의 미션</h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            인터넷 사용자 모두가 안전하게 웹을 탐색할 수 있도록 도움을 주는 것입니다. 
            복잡한 보안 기술을 누구나 쉽게 사용할 수 있는 도구로 만들어, 
            피싱, 멀웨어, 악성 사이트로부터 사용자를 보호합니다.
          </p>
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">핵심 가치</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">보안 우선</h3>
            <p className="text-gray-600">
              사용자의 안전이 최우선입니다. 최신 보안 기술과 데이터베이스를 활용하여 
              실시간으로 위협을 탐지하고 대응합니다.
            </p>
          </div>
          
          <div className="card text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">개인정보 보호</h3>
            <p className="text-gray-600">
              사용자의 개인정보는 수집하지 않으며, 모든 데이터는 
              브라우저에서만 관리됩니다. 투명한 개인정보 처리를 약속합니다.
            </p>
          </div>
          
          <div className="card text-center space-y-4 hover:shadow-xl transition-shadow">
            <div className="flex justify-center">
              <div className="p-4 bg-purple-100 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">사용자 중심</h3>
            <p className="text-gray-600">
              복잡한 기술을 단순하고 직관적인 인터페이스로 제공하여 
              누구나 쉽게 사용할 수 있도록 설계했습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="card animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-8">주요 기능</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">멀웨어 및 피싱 탐지</h3>
                <p className="text-gray-600 text-sm">
                  VirusTotal과 Google Safe Browsing을 통한 
                  실시간 위협 탐지
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">종합 도메인 분석</h3>
                <p className="text-gray-600 text-sm">
                  SSL 인증서, 도메인 나이, HTTP 헤더 등 
                  다각도 보안 분석
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">스마트 패턴 인식</h3>
                <p className="text-gray-600 text-sm">
                  의심스러운 URL 패턴과 피싱 기법을 
                  자동으로 식별
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">실시간 분석</h3>
                <p className="text-gray-600 text-sm">
                  빠른 응답 시간으로 즉시 보안 상태를 
                  확인할 수 있음
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">사용자 친화적 인터페이스</h3>
                <p className="text-gray-600 text-sm">
                  직관적인 디자인과 명확한 결과 표시로 
                  누구나 쉽게 이해
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Code className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">오픈소스</h3>
                <p className="text-gray-600 text-sm">
                  투명한 개발 과정과 커뮤니티 기여를 통한 
                  지속적인 개선
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="card animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-8">기술 스택</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center space-y-3">
            <div className="p-4 bg-blue-100 rounded-xl">
              <Code className="w-8 h-8 text-blue-600 mx-auto" />
            </div>
            <h3 className="font-semibold">Frontend</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Next.js 14</p>
              <p>React 18</p>
              <p>TypeScript</p>
              <p>Tailwind CSS</p>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="p-4 bg-green-100 rounded-xl">
              <Globe className="w-8 h-8 text-green-600 mx-auto" />
            </div>
            <h3 className="font-semibold">Backend</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Next.js API Routes</p>
              <p>Node.js</p>
              <p>RESTful API</p>
              <p>Serverless</p>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="p-4 bg-purple-100 rounded-xl">
              <Shield className="w-8 h-8 text-purple-600 mx-auto" />
            </div>
            <h3 className="font-semibold">보안 API</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>VirusTotal</p>
              <p>Google Safe Browsing</p>
              <p>Custom Analysis</p>
              <p>Pattern Matching</p>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="p-4 bg-orange-100 rounded-xl">
              <Zap className="w-8 h-8 text-orange-600 mx-auto" />
            </div>
            <h3 className="font-semibold">인프라</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Vercel</p>
              <p>PWA</p>
              <p>Service Worker</p>
              <p>CDN</p>
            </div>
          </div>
        </div>
      </section>

      {/* 개발 이야기 */}
      <section className="card animate-fade-in bg-gradient-to-br from-gray-50 to-blue-50">
        <h2 className="text-3xl font-bold text-center mb-8">개발 이야기</h2>
        
        <div className="space-y-6 text-gray-700">
          <p className="leading-relaxed">
            URL Safety Checker는 일상적인 인터넷 사용 중 발생하는 보안 위협에 대한 우려에서 시작되었습니다. 
            피싱 이메일, 악성 링크, 가짜 웹사이트가 급증하는 현실에서, 일반 사용자들이 쉽게 사용할 수 있는 
            보안 도구의 필요성을 느꼈습니다.
          </p>
          
          <p className="leading-relaxed">
            기존의 보안 도구들은 대부분 전문가를 대상으로 하거나, 복잡한 설정이 필요했습니다. 
            우리는 "클릭 한 번으로 안전성을 확인할 수 있다면 어떨까?"라는 질문에서 출발하여 
            이 프로젝트를 시작했습니다.
          </p>
          
          <p className="leading-relaxed">
            개발 과정에서 가장 중요하게 생각한 것은 정확성과 속도의 균형이었습니다. 
            여러 보안 API를 조합하여 높은 정확도를 달성하면서도, 사용자가 기다리지 않아도 될 정도의 
            빠른 응답 시간을 구현하기 위해 많은 최적화 작업을 거쳤습니다.
          </p>
          
          <p className="leading-relaxed">
            또한 개인정보 보호를 최우선으로 고려했습니다. 사용자가 검사하는 URL이나 개인정보가 
            서버에 저장되지 않도록 설계하고, 모든 데이터 처리 과정을 투명하게 공개했습니다.
          </p>
        </div>
      </section>

      {/* 통계 */}
      <section className="card animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-8">프로젝트 현황</h2>
        
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-gray-600">보안 엔진 연동</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">99.9%</div>
            <div className="text-gray-600">서비스 가용성</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">&lt;2s</div>
            <div className="text-gray-600">평균 응답 시간</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">MIT</div>
            <div className="text-gray-600">오픈소스 라이센스</div>
          </div>
        </div>
      </section>

      {/* 로드맵 */}
      <section className="card animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-8">향후 계획</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              v1.1
            </div>
            <div>
              <h3 className="font-semibold text-lg">브라우저 확장 프로그램</h3>
              <p className="text-gray-600 text-sm">
                Chrome, Firefox 확장 프로그램으로 더 편리한 사용 환경 제공
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              v1.2
            </div>
            <div>
              <h3 className="font-semibold text-lg">모바일 앱</h3>
              <p className="text-gray-600 text-sm">
                네이티브 모바일 앱으로 더 빠르고 안정적인 서비스 제공
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              v2.0
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI 기반 위협 예측</h3>
              <p className="text-gray-600 text-sm">
                머신러닝을 활용한 새로운 위협 패턴 예측 및 사전 차단
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 기여하기 */}
      <section className="card animate-fade-in bg-gradient-to-br from-purple-50 to-pink-50 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Github className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-purple-900">함께 만들어가요</h2>
          <p className="text-purple-700 leading-relaxed max-w-2xl mx-auto">
            URL Safety Checker는 오픈소스 프로젝트입니다. 
            더 안전한 인터넷을 만들어가는 여정에 여러분의 참여를 기다립니다.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://github.com/your-username/url-safety-checker" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>GitHub에서 보기</span>
            </a>
            <a 
              href="/contact" 
              className="btn-secondary flex items-center space-x-2"
            >
              <Coffee className="w-5 h-5" />
              <span>개발팀에게 연락</span>
            </a>
          </div>
        </div>
      </section>

      {/* 감사 인사 */}
      <section className="card animate-fade-in text-center">
        <div className="space-y-4">
          <Heart className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">감사합니다</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            URL Safety Checker를 사용해주시고 피드백을 주시는 모든 분들께 감사드립니다. 
            여러분의 관심과 지원이 더 나은 서비스를 만드는 원동력입니다.
          </p>
        </div>
      </section>
    </div>
  )
}