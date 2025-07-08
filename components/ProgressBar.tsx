'use client'

interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  animated?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
}

export function ProgressBar({ 
  progress, 
  className = '', 
  animated = true, 
  color = 'blue',
  showPercentage = true 
}: ProgressBarProps) {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'red': return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'yellow': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">진행률</span>
        {showPercentage && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClass()} ${
            animated ? 'animate-pulse-gentle' : ''
          }`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

interface StepProgressProps {
  steps: Array<{
    name: string
    status: 'pending' | 'running' | 'completed' | 'error'
    description?: string
  }>
  className?: string
}

export function StepProgress({ steps, className = '' }: StepProgressProps) {
  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white'
      case 'running': return 'bg-blue-500 text-white animate-pulse'
      case 'error': return 'bg-red-500 text-white'
      default: return 'bg-gray-300 text-gray-600'
    }
  }

  const getConnectorColor = (currentStatus: string, nextStatus: string) => {
    if (currentStatus === 'completed') return 'bg-green-500'
    if (currentStatus === 'running') return 'bg-gradient-to-r from-green-500 to-gray-300'
    return 'bg-gray-300'
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-center">
            {/* 스텝 원 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${getStepColor(step.status)}`}
              >
                {step.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.status === 'error' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : step.status === 'running' ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              {step.description && (
                <p className="text-xs text-gray-600 mt-1 text-center max-w-20">
                  {step.description}
                </p>
              )}
            </div>

            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-16 mx-2 rounded-full transition-all duration-500 ${getConnectorColor(step.status, steps[index + 1].status)}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}