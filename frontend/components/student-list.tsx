'use client'

import { Clock, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useEvaluationStore } from '@/store/evaluation-store'
import { useEvaluationTasks } from '@/hooks/use-evaluation'
import { formatDate, getGradeClass, getIssueTypeLabel, calculatePriority } from '@/lib/utils'
import { TaskStatus, GradeType, EvaluationTask } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StudentCardProps {
  task: EvaluationTask // EvaluationTask with result
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpansion: () => void
}

function StudentCard({ task, isSelected, isExpanded, onSelect, onToggleExpansion }: StudentCardProps) {
  const report = task.result
  const studentName = report?.student_name || `学生${task.student_id}`
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING': return '等待处理'
      case 'PROCESSING': return '处理中...'
      case 'COMPLETED': return '已完成'
      case 'FAILED': return '处理失败'
      default: return '未知状态'
    }
  }

  const getPriorityIndicator = () => {
    if (!report) return null
    const priority = calculatePriority(report.final_grade_suggestion, report.mistake_count)
    if (priority >= 300) { // C级
      return <div className="w-2 h-2 rounded-full bg-red-500" />
    } else if (priority >= 200) { // B级
      return <div className="w-2 h-2 rounded-full bg-blue-500" />
    } else { // A级
      return <div className="w-2 h-2 rounded-full bg-green-500" />
    }
  }

  return (
    <Card className={cn(
      "transition-all duration-200 cursor-pointer hover:shadow-md",
      isSelected && "border-2 border-blue-400 bg-blue-50 shadow-md",
      task.status === 'COMPLETED' && report?.final_grade_suggestion === 'C' && "border-red-200 bg-red-50"
    )}>
      <CardContent className="p-4">
        {/* 主要信息行 */}
        <div className="flex items-center justify-between mb-3" onClick={onSelect}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getPriorityIndicator()}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {studentName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(task.status)}
                <span className="text-sm text-gray-500">
                  {getStatusText(task.status)}
                </span>
              </div>
            </div>
          </div>

          {/* 等级徽章 */}
          {report && (
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium border",
              getGradeClass(report.final_grade_suggestion)
            )}>
              {report.final_grade_suggestion}
            </div>
          )}
        </div>

        {/* 错误统计（仅已完成任务显示） */}
        {report && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>错误数量: {report.mistake_count}</span>
            <span>{formatDate(task.updated_at)}</span>
          </div>
        )}

        {/* 可展开的详细信息 */}
        {task.status === 'COMPLETED' && report && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpansion()
              }}
              className="w-full justify-between p-2 h-auto text-left hover:bg-gray-50"
            >
              <span className="text-sm text-gray-600">
                {isExpanded ? '收起详情' : '展开详情'}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {/* AI评语预览 */}
                <div>
                  <p className="text-sm font-medium text-gray-700">AI评语:</p>
                  <p className="text-sm text-gray-600 overflow-hidden text-ellipsis" style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical' 
                  }}>
                    {report.ai_summary_comment}
                  </p>
                </div>

                {/* 问题类型总结 */}
                {report.annotations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">问题类型:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.from(new Set(report.annotations.map(a => a.issue_type))).map(type => (
                        <span
                          key={type}
                          className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                        >
                          {getIssueTypeLabel(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 音频信息 */}
                <div className="text-xs text-gray-500">
                  单元: {report.unit_id} | 会话: {report.session_index}
                </div>
              </div>
            )}
          </>
        )}

        {/* 处理失败的错误信息 */}
        {task.status === 'FAILED' && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">
              处理失败，请重新上传或联系技术支持
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StudentList() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    expandedCards,
    toggleCardExpansion,
    getFilteredAndSortedTasks
  } = useEvaluationStore()

  const { isLoading, error } = useEvaluationTasks()
  const tasks = getFilteredAndSortedTasks()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">学生列表</h2>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">学生列表</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">学生列表</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              暂无评测任务
            </p>
            <p className="text-sm text-gray-400 mt-1">
              上传学生录音文件以开始评测
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          学生列表 ({tasks.length})
        </h2>
        {/* 这里可以添加批量操作按钮 */}
      </div>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {tasks.map((task) => (
          <StudentCard
            key={task.task_id}
            task={task}
            isSelected={selectedTaskId === task.task_id}
            isExpanded={expandedCards.has(task.task_id)}
            onSelect={() => setSelectedTaskId(task.task_id)}
            onToggleExpansion={() => toggleCardExpansion(task.task_id)}
          />
        ))}
      </div>
    </div>
  )
}
