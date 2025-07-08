/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../app/page'

// Mock the components that depend on browser APIs
jest.mock('../components/Toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
    ToastContainer: () => <div data-testid="toast-container" />,
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}))

jest.mock('../components/QRScanner', () => ({
  QRScanner: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="qr-scanner">
      <button onClick={onClose}>Close QR Scanner</button>
    </div>
  ),
}))

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Home Page', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /URL 안전성 검사/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the URL input field', () => {
    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'url')
  })

  it('renders the analyze button', () => {
    render(<Home />)
    const button = screen.getByRole('button', { name: /검사하기/i })
    expect(button).toBeInTheDocument()
  })

  it('shows error when submitting empty URL', async () => {
    render(<Home />)
    const button = screen.getByRole('button', { name: /검사하기/i })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/URL을 입력해주세요/i)).toBeInTheDocument()
    })
  })

  it('validates URL format in real-time', async () => {
    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    
    fireEvent.change(input, { target: { value: 'invalid-url' } })
    
    await waitFor(() => {
      expect(input).toHaveClass('input-error')
    })
  })

  it('accepts valid URL format', async () => {
    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    
    await waitFor(() => {
      expect(input).not.toHaveClass('input-error')
    })
  })

  it('shows loading state during analysis', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          ssl: true,
          risk_level: 'low',
          risk_score: 1,
          recommendations: ['Safe to visit']
        })
      }), 100))
    )

    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    const button = screen.getByRole('button', { name: /검사하기/i })
    
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)
    
    expect(screen.getByText(/분석 중.../i)).toBeInTheDocument()
  })

  it('displays analysis results', async () => {
    const mockResult = {
      ssl: true,
      risk_level: 'low',
      risk_score: 1,
      recommendations: ['Safe to visit'],
      suspicious_patterns: [],
      ip_address: false,
      url_shortener: false,
      domain_age: 365,
      redirects: [],
      response_time: 150,
      malware_detected: false,
      phishing_detected: false,
      status_code: 200,
      final_url: 'https://example.com',
      page_title: 'Example Domain',
      http_headers: {},
      content_type: 'text/html',
      shortened_url_resolved: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult)
    })

    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    const button = screen.getByRole('button', { name: /검사하기/i })
    
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/위험도: 낮음/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<Home />)
    const input = screen.getByPlaceholderText(/검사할 URL을 입력하세요/i)
    const button = screen.getByRole('button', { name: /검사하기/i })
    
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/알 수 없는 오류가 발생했습니다/i)).toBeInTheDocument()
    })
  })

  it('shows QR scanner when QR button is clicked', async () => {
    render(<Home />)
    const qrButton = screen.getByText(/QR 코드 스캔/i)
    
    fireEvent.click(qrButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
    })
  })
})