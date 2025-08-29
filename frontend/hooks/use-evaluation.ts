import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEvaluationStore } from '@/store/evaluation-store'
import { EvaluationTask, CreateEvaluationRequest, TeacherFeedback } from '@/lib/types'

// Query Keys
export const evaluationKeys = {
  all: ['evaluations'] as const,
  tasks: () => [...evaluationKeys.all, 'tasks'] as const,
  task: (id: string) => [...evaluationKeys.all, 'task', id] as const,
  report: (id: string) => [...evaluationKeys.all, 'report', id] as const,
}

// 获取所有评测任务
export function useEvaluationTasks() {
  const { setTasks, setLoading, setError } = useEvaluationStore()
  
  const queryResult = useQuery({
    queryKey: evaluationKeys.tasks(),
    queryFn: api.getAllTasks,
    refetchInterval: 10000, // 每10秒轮询任务列表
    staleTime: 10000, // 10秒内不重新获取
  })

  useEffect(() => {
    setLoading(queryResult.isFetching)
  }, [queryResult.isFetching, setLoading])

  useEffect(() => {
    if (queryResult.data) {
      setTasks(queryResult.data)
    }
  }, [queryResult.data, setTasks])

  useEffect(() => {
    if (queryResult.error) {
      setError(queryResult.error.message)
    }
  }, [queryResult.error, setError])

  return queryResult
}

// 获取单个任务状态
export function useEvaluationTask(taskId: string | null) {
  const { updateTask } = useEvaluationStore()
  
  return useQuery({
    queryKey: evaluationKeys.task(taskId!),
    queryFn: async () => {
      if (!taskId) return null
      const task = await api.getTaskStatus(taskId)
      updateTask(taskId, task)
      return task
    },
    enabled: !!taskId,
    refetchInterval: 5000, // 固定5秒轮询，简化逻辑
  })
}

// 获取报告详情
export function useEvaluationReport(taskId: string | null) {
  const { setSelectedReport } = useEvaluationStore()
  
  return useQuery({
    queryKey: evaluationKeys.report(taskId!),
    queryFn: async () => {
      if (!taskId) return null
      const report = await api.getReportDetail(taskId)
      setSelectedReport(report)
      return report
    },
    enabled: !!taskId,
    staleTime: 60000, // 报告内容相对稳定，1分钟内不重新获取
  })
}

// 创建评测任务
export function useCreateEvaluation() {
  const queryClient = useQueryClient()
  const { addTask, setError } = useEvaluationStore()
  
  return useMutation({
    mutationFn: (request: CreateEvaluationRequest) => api.createEvaluation(request),
    onSuccess: (response) => {
      // 添加新任务到store
      const newTask: EvaluationTask = {
        task_id: response.task_id,
        student_id: '',
        unit_id: '',
        session_index: 0,
        audio_path: '',
        status: response.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addTask(newTask)
      
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: evaluationKeys.tasks() })
    },
    onError: (error: Error) => {
      setError(`创建评测任务失败: ${error.message}`)
    }
  })
}

// 提交教师反馈
export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  const { setError } = useEvaluationStore()
  
  return useMutation({
    mutationFn: (feedback: TeacherFeedback) => api.submitTeacherFeedback(feedback),
    onSuccess: (_, variables) => {
      // 刷新相关缓存
      queryClient.invalidateQueries({ 
        queryKey: evaluationKeys.task(variables.task_id) 
      })
      queryClient.invalidateQueries({ 
        queryKey: evaluationKeys.report(variables.task_id) 
      })
    },
    onError: (error: Error) => {
      setError(`提交反馈失败: ${error.message}`)
    }
  })
}

// 导出结果
export function useExportResults() {
  const { setError } = useEvaluationStore()
  
  return useMutation({
    mutationFn: (taskIds: string[]) => api.exportResults(taskIds),
    onSuccess: (blob) => {
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `evaluation_results_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onError: (error: Error) => {
      setError(`导出失败: ${error.message}`)
    }
  })
}

// 健康检查
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
    refetchInterval: 30000, // 30秒检查一次
    retry: 3,
  })
}
