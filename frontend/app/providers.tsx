'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 默认配置选项
        staleTime: 60 * 1000, // 1分钟
        gcTime: 10 * 60 * 1000, // 10分钟
        retry: (failureCount, error) => {
          // 对于网络错误重试，其他错误不重试
          if (failureCount < 3 && error && 'status' in error) {
            return true
          }
          return false
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
