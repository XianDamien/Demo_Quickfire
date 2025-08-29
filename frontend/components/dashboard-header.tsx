'use client'

import { Download, RefreshCw, Filter, Users, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEvaluationStore } from '@/store/evaluation-store'
import { useExportResults, useEvaluationTasks } from '@/hooks/use-evaluation'
import { GradeType } from '@/lib/types'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const {
    filterGrade,
    setFilterGrade,
    sortBy,
    setSortBy,
    getFilteredAndSortedTasks,
    getPendingTasksCount,
    getCompletedTasksCount
  } = useEvaluationStore()

  const { refetch, isLoading: isRefetching } = useEvaluationTasks()
  const exportMutation = useExportResults()

  const filteredTasks = getFilteredAndSortedTasks()
  const pendingCount = getPendingTasksCount()
  const completedCount = getCompletedTasksCount()
  const totalTasks = filteredTasks.length

  const handleExport = () => {
    const completedTaskIds = filteredTasks
      .filter(task => task.status === 'COMPLETED')
      .map(task => task.task_id)
    
    if (completedTaskIds.length === 0) {
      alert('没有已完成的评测任务可以导出')
      return
    }
    
    exportMutation.mutate(completedTaskIds)
  }

  const handleRefresh = () => {
    refetch()
  }

  const gradeOptions: Array<{ value: GradeType | 'ALL', label: string, color: string }> = [
    { value: 'ALL', label: '全部', color: 'bg-gray-100 text-gray-700' },
    { value: 'C', label: 'C级', color: 'bg-red-100 text-red-700' },
    { value: 'B', label: 'B级', color: 'bg-blue-100 text-blue-700' },
    { value: 'A', label: 'A级', color: 'bg-green-100 text-green-700' },
  ]

  const sortOptions = [
    { value: 'priority', label: '优先级排序' },
    { value: 'created_at', label: '创建时间' },
    { value: 'student_name', label: '学生姓名' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* 主标题区域 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI助教 - 单词快反看板
            </h1>
            <p className="text-gray-600 mt-1">
              智能评测系统，提升批改效率
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
              刷新
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending || completedCount === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportMutation.isPending ? '导出中...' : '导出结果'}
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">总任务数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">处理中</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">已完成</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 过滤和排序控件 */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">筛选:</span>
          </div>
          
          {/* 等级筛选 */}
          <div className="flex items-center gap-2">
            {gradeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterGrade(option.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  filterGrade === option.value
                    ? option.color + " border-current"
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* 排序选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
