'use client'

import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { StudentList } from '@/components/student-list'
import { ReportDetailView } from '@/components/report-detail-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/error-boundary'
import { useEvaluationTasks } from '@/hooks/use-evaluation'
import { useEvaluationStore } from '@/store/evaluation-store'

export default function DashboardPage() {
  const { selectedTaskId } = useEvaluationStore()
  const { isLoading, error } = useEvaluationTasks()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">加载失败</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重新加载
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧学生列表 */}
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <StudentList />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
          
          {/* 右侧报告详情 */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {selectedTaskId ? (
                  <ReportDetailView taskId={selectedTaskId} />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      请选择学生查看评测报告
                    </h3>
                    <p className="text-gray-400">
                      从左侧列表中点击学生卡片来查看详细的评测报告和音频分析
                    </p>
                  </div>
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}
