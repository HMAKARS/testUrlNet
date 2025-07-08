'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { 
  MessageCircle, Search, ChevronDown, ChevronUp, Shield, 
  AlertTriangle, Settings, Zap, Globe, Lock 
} from 'lucide-react'

const faqData = [
  {
    category: 'basic',
    title: '기본 사용법',
    icon: <Zap className="w-5 h-5" />,
    questions: [
      {
        q: 'URL Safety Checker는 무엇인가요?',
        a: 'URL Safety Checker는 웹사이트의 안전성을 분석하여 멀웨어, 피싱, 기타 보안 위협으로부터 사용자를 보호하는 도구입니다. URL을 입력하면 다양한 보안 데이터베이스와 분석 기법을 통해 해당 사이트의 위험도를 평가합니다.'
      },
      {
        q: '어떻게 사용하나요?',
        a: '메인 페이지의 입력창에 검사하고 싶은 URL을 입력하고 "검사하기" 버튼을 클릭하세요. 몇 초 후 상세한 분석 결과와 위험도가 표시됩니다. 결과를 바탕으로 해당 사이트 방문 여부를 결정할 수 있습니다.'
      },
      {
        q: '어떤 형식의 URL을 입력할 수 있나요?',
        a: 'http://, https://로 시작하는 모든 웹사이트 URL을 지원합니다. 프로토콜을 생략하면 자동으로 https://가 추가됩니다. 또한 bit.ly, tinyurl.com 같은 단축 URL도 분석 가능합니다.'
      },
      {
        q: '검사 결과는 얼마나 정확한가요?',
        a: 'VirusTotal, Google Safe Browsing 등 다양한 보안 데이터베이스와 자체 분석 알고리즘을 조합하여 높은 정확도를 제공합니다. 하지만 100% 완벽하지는 않으므로 중요한 정보 입력 시에는 추가적인 주의가 필요합니다.'
      }
    ]
  },
  {
    category: 'security',
    title: '보안 및 위험도',
    icon: <Shield className="w-5 h-5" />,
    questions: [
      {
        q: '위험도는 어떻게 계산되나요?',
        a: 'SSL 인증서 유무(3점), IP 주소 직접 사용(4점), URL 단축 서비스(2점), 의심스러운 패턴(패턴당 1점), 신규 도메인(최대 3점), 멀웨어/피싱 탐지(5점) 등의 요소를 종합하여 0-10점으로 계산합니다. 2점 이하는 낮음, 3-6점은 보통, 7점 이상은 높음으로 분류됩니다.'
      },
      {
        q: '멀웨어와 피싱은 어떻게 탐지하나요?',
        a: 'VirusTotal API를 통해 50개 이상의 보안 엔진에서 멀웨어를 검사하고, Google Safe Browsing API로 피싱 사이트를 탐지합니다. 또한 자체 패턴 분석을 통해 의심스러운 URL 구조나 도메인 특성을 식별합니다.'
      },
      {
        q: '안전한 사이트가 위험하다고 나오는 경우',
        a: '오탐(False Positive)이 발생할 수 있습니다. 신뢰할 수 있는 출처의 사이트라면 주의깊게 방문하되, 개인정보나 금융 정보 입력은 피하세요. 지속적으로 문제가 있다면 해당 사이트 관리자에게 문의하거나 저희에게 신고해주세요.'
      },
      {
        q: '위험한 사이트를 방문하면 어떻게 되나요?',
        a: '멀웨어 감염, 개인정보 도용, 금융 사기 등의 위험이 있습니다. 위험도가 높은 사이트는 가능한 방문을 피하고, 부득이하게 방문해야 한다면 개인정보 입력을 절대 하지 마세요.'
      }
    ]
  },
  {
    category: 'privacy',
    title: '개인정보 및 프라이버시',
    icon: <Lock className="w-5 h-5" />,
    questions: [
      {
        q: '입력한 URL이 저장되나요?',
        a: '서버에는 저장되지 않습니다. 검사 이력은 브라우저의 로컬 스토리지에만 저장되며, 사용자가 직접 삭제할 수 있습니다. 서버로는 분석을 위한 최소한의 정보만 전송되고 즉시 삭제됩니다.'
      },
      {
        q: '개인정보가 수집되나요?',
        a: '개인을 식별할 수 있는 정보는 수집하지 않습니다. 서비스 개선을 위한 익명화된 사용 통계(검사 횟수, 위험도 분포 등)만 수집하며, 이는 개인과 연결될 수 없습니다.'
      },
      {
        q: '쿠키나 추적 기술을 사용하나요?',
        a: '필수적인 기능(검사 이력, 설정 저장)을 위한 로컬 스토리지만 사용합니다. 광고나 추적 목적의 쿠키는 사용하지 않으며, 외부 추적 서비스와 연동하지 않습니다.'
      },
      {
        q: '데이터를 제3자와 공유하나요?',
        a: '절대 공유하지 않습니다. 외부 API(VirusTotal, Google Safe Browsing) 사용 시에도 분석에 필요한 URL만 전송되며, 이는 해당 서비스의 개인정보처리방침을 따릅니다.'
      }
    ]
  },
  {
    category: 'technical',
    title: '기술적 질문',
    icon: <Settings className="w-5 h-5" />,
    questions: [
      {
        q: '어떤 브라우저에서 사용할 수 있나요?',
        a: 'Chrome, Firefox, Safari, Edge 등 모든 모던 브라우저에서 사용 가능합니다. JavaScript가 활성화되어 있어야 하며, 최적의 경험을 위해 최신 버전 사용을 권장합니다.'
      },
      {
        q: '오프라인에서도 사용할 수 있나요?',
        a: 'PWA(Progressive Web App) 기술을 사용하여 제한적인 오프라인 기능을 제공합니다. 이전 검사 결과 확인, 도움말 보기 등은 가능하지만, 새로운 URL 분석은 인터넷 연결이 필요합니다.'
      },
      {
        q: '모바일에서도 사용할 수 있나요?',
        a: '네, 반응형 웹 디자인으로 모바일 기기에서도 최적화된 경험을 제공합니다. 또한 홈 화면에 추가하여 앱처럼 사용할 수 있습니다.'
      },
      {
        q: 'API를 제공하나요?',
        a: '현재는 웹 인터페이스만 제공하고 있습니다. API 제공에 대한 계획이 있으니, 필요하시면 문의해주세요.'
      },
      {
        q: '검사 속도가 느린 이유는?',
        a: '여러 외부 API를 조합하여 분석하기 때문에 몇 초의 시간이 필요합니다. 인터넷 연결 상태, 대상 서버의 응답 속도, API 서버 상태 등이 영향을 줄 수 있습니다.'
      }
    ]
  },
  {
    category: 'features',
    title: '기능 및 사용법',
    icon: <Globe className="w-5 h-5" />,
    questions: [
      {
        q: 'QR 코드 스캔 기능은 어떻게 사용하나요?',
        a: 'URL 입력창 아래의 "QR 코드 스캔" 버튼을 클릭하세요. 카메라 권한을 허용한 후 QR 코드를 스캔하거나, QR 코드 이미지 파일을 업로드할 수 있습니다.'
      },
      {
        q: '검사 이력은 어떻게 관리하나요?',
        a: '검사 이력은 브라우저에 자동 저장되며, 최대 50개 항목까지 보관됩니다. 이력에서 이전 검사 결과를 다시 확인하거나 재검사할 수 있으며, 수동으로 삭제도 가능합니다.'
      },
      {
        q: '결과를 다른 사람과 공유할 수 있나요?',
        a: '검사 결과 페이지의 공유 버튼을 통해 링크를 복사하거나 소셜 미디어로 공유할 수 있습니다. 공유되는 정보는 위험도와 기본적인 분석 결과만 포함됩니다.'
      },
      {
        q: '북마크 기능이 있나요?',
        a: '자주 검사하는 사이트를 즐겨찾기에 추가할 수 있습니다. 즐겨찾기에서 바로 재검사하거나 관리할 수 있습니다.'
      }
    ]
  },
  {
    category: 'troubleshooting',
    title: '문제 해결',
    icon: <AlertTriangle className="w-5 h-5" />,
    questions: [
      {
        q: '"검사에 실패했습니다" 오류가 나타나는 경우',
        a: '1) 인터넷 연결을 확인하세요. 2) URL 형식이 올바른지 확인하세요. 3) 페이지를 새로고침하고 다시 시도하세요. 4) 문제가 지속되면 잠시 후 재시도하거나 문의해주세요.'
      },
      {
        q: '페이지가 로딩되지 않는 경우',
        a: '브라우저 캐시를 삭제하고 새로고침하거나, 다른 브라우저에서 시도해보세요. 광고 차단기나 보안 프로그램이 간섭할 수 있으니 일시적으로 비활성화해보세요.'
      },
      {
        q: 'QR 코드 스캔이 작동하지 않는 경우',
        a: '카메라 권한이 허용되어 있는지 확인하세요. 브라우저 설정에서 카메라 권한을 확인하고, HTTPS 연결에서만 작동하므로 URL을 확인하세요.'
      },
      {
        q: '검사 결과가 다른 도구와 다른 경우',
        a: '각 도구마다 다른 데이터베이스와 분석 방법을 사용하므로 결과가 다를 수 있습니다. 여러 도구의 결과를 종합적으로 고려하여 판단하시기 바랍니다.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // 검색 및 필터링
  const filteredQuestions = faqData.filter(category => {
    if (selectedCategory && category.category !== selectedCategory) return false
    
    if (!searchTerm) return true
    
    return category.questions.some(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }).map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      !searchTerm || 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const toggleExpanded = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-xl">
            <MessageCircle className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text">자주 묻는 질문</h1>
        <p className="text-lg text-gray-600">URL Safety Checker에 대한 궁금증을 해결해보세요</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="card space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="질문이나 키워드를 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {faqData.map(category => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                selectedCategory === category.category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ 내용 */}
      {filteredQuestions.map((category, categoryIndex) => (
        <section key={category.category} className="card animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {category.icon}
            </div>
            <h2 className="text-2xl font-bold">{category.title}</h2>
          </div>
          
          <div className="space-y-4">
            {category.questions.map((item, questionIndex) => {
              const isExpanded = expandedItems[`${categoryIndex}-${questionIndex}`]
              
              return (
                <div 
                  key={questionIndex}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <button
                    onClick={() => toggleExpanded(categoryIndex, questionIndex)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-0">
                      <div className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {item.a}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {/* 검색 결과 없음 */}
      {filteredQuestions.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-6">
            다른 키워드로 검색하거나 카테고리를 변경해보세요.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
            }}
            className="btn-primary"
          >
            전체 보기
          </button>
        </div>
      )}

      {/* 추가 도움말 */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-4">원하는 답변을 찾지 못하셨나요?</h3>
        <p className="text-blue-700 mb-6">
          더 자세한 도움말을 확인하거나 직접 문의해주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/help" className="btn-primary">
            상세 도움말
          </a>
          <a href="/contact" className="btn-secondary">
            문의하기
          </a>
        </div>
      </div>
    </div>
  )
}