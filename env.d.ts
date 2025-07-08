/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    
    // App Configuration
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_APP_NAME: string
    
    // Features
    NEXT_PUBLIC_MAX_ANALYSIS_HISTORY: string
    NEXT_PUBLIC_ENABLE_QR_SCANNER: string
    NEXT_PUBLIC_ENABLE_SHARING: string
    NEXT_PUBLIC_ENABLE_ANALYTICS: string
    NEXT_PUBLIC_ENABLE_DEBUG_PANEL?: string
    
    // API Keys
    VIRUSTOTAL_API_KEY?: string
    GOOGLE_SAFE_BROWSING_API_KEY?: string
    
    // Development
    DEBUG?: string
    LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'
    USE_MOCK_APIS?: string
    ANALYZE_BUNDLE?: string
    
    // Performance
    ENABLE_CACHE?: string
    CACHE_TTL?: string
    
    // Rate Limiting
    RATE_LIMIT_WINDOW?: string
    RATE_LIMIT_MAX_REQUESTS?: string
    
    // Analytics
    NEXT_PUBLIC_GA_ID?: string
    NEXT_PUBLIC_GTM_ID?: string
    
    // Error Tracking
    SENTRY_DSN?: string
    SENTRY_ENVIRONMENT?: string
    
    // Database
    DATABASE_URL?: string
    
    // Redis
    REDIS_URL?: string
    
    // CDN
    NEXT_PUBLIC_CDN_URL?: string
    
    // Email
    SMTP_HOST?: string
    SMTP_PORT?: string
    SMTP_USER?: string
    SMTP_PASS?: string
    EMAIL_FROM?: string
    
    // Vercel
    VERCEL?: string
    VERCEL_ENV?: 'production' | 'preview' | 'development'
    VERCEL_URL?: string
    VERCEL_REGION?: string
    
    // System
    PORT?: string
    HOSTNAME?: string
  }
}

// Global type augmentations
declare global {
  interface Window {
    // Google Analytics
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: any
    ) => void
    dataLayer?: any[]
    
    // Performance
    __PERFORMANCE_METRICS__?: {
      [key: string]: number
    }
    
    // Service Worker
    workbox?: any
    
    // Error tracking
    Sentry?: any
    
    // Feature flags
    __FEATURES__?: {
      [key: string]: boolean
    }
    
    // File system (for analysis tool)
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<any>
    }
    
    // Claude API (if available)
    claude?: {
      complete: (prompt: string) => Promise<string>
    }
  }
}

// Custom type definitions
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Extend existing types
declare module 'next' {
  export interface NextApiRequest {
    rateLimit?: {
      remaining: number
      reset: number
    }
    user?: {
      id: string
      ip: string
      userAgent: string
    }
  }
}

export {}