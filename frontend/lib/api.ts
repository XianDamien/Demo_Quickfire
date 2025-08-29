import { 
  ReportData, 
  EvaluationTask, 
  CreateEvaluationRequest, 
  CreateEvaluationResponse,
  TeacherFeedback
} from './types'
import { MOCK_TASKS, MOCK_REPORTS, delay, USE_MOCK_DATA } from './mock-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status, 
      errorData.detail || `HTTP ${response.status}: ${response.statusText}`
    )
  }

  return response.json()
}

export const api = {
  // 创建评测任务
  async createEvaluation(request: CreateEvaluationRequest): Promise<CreateEvaluationResponse> {
    const formData = new FormData()
    formData.append('student_id', request.student_id)
    formData.append('unit_id', request.unit_id)
    formData.append('session_index', request.session_index.toString())
    formData.append('audio_file', request.audio_file)

    const response = await fetch(`${API_BASE_URL}/evaluate/session`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status, 
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return response.json()
  },

  // 获取任务状态
  async getTaskStatus(taskId: string): Promise<EvaluationTask> {
    if (USE_MOCK_DATA) {
      await delay(200)
      const task = MOCK_TASKS.find(t => t.task_id === taskId)
      if (!task) {
        throw new ApiError(404, 'Task not found')
      }
      return task
    }
    return fetchApi<EvaluationTask>(`/evaluate/task/${taskId}`)
  },

  // 获取所有评测任务列表
  async getAllTasks(): Promise<EvaluationTask[]> {
    if (USE_MOCK_DATA) {
      await delay(500) // 模拟网络延迟
      return MOCK_TASKS
    }
    return fetchApi<EvaluationTask[]>('/evaluate/tasks')
  },

  // 获取报告详情
  async getReportDetail(taskId: string): Promise<ReportData> {
    if (USE_MOCK_DATA) {
      await delay(300)
      const report = MOCK_REPORTS.find(r => r.task_id === taskId)
      if (!report) {
        throw new ApiError(404, 'Report not found')
      }
      return report
    }
    return fetchApi<ReportData>(`/evaluate/report/${taskId}`)
  },

  // 提交教师反馈
  async submitTeacherFeedback(feedback: TeacherFeedback): Promise<{ success: boolean }> {
    if (USE_MOCK_DATA) {
      await delay(800)
      console.log('Mock: Submitted teacher feedback:', feedback)
      return { success: true }
    }
    return fetchApi<{ success: boolean }>('/evaluate/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    })
  },

  // 批量导出结果
  async exportResults(taskIds: string[]): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/evaluate/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_ids: taskIds }),
    })

    if (!response.ok) {
      throw new ApiError(response.status, 'Export failed')
    }

    return response.blob()
  },

  // 健康检查
  async healthCheck(): Promise<{ status: string }> {
    return fetchApi<{ status: string }>('/health')
  }
}

export { ApiError }
