import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ReportData, EvaluationTask, GradeType } from '@/lib/types'

interface EvaluationState {
  // 状态数据
  tasks: EvaluationTask[]
  selectedTaskId: string | null
  selectedReport: ReportData | null
  isLoading: boolean
  error: string | null
  
  // 过滤和排序
  filterGrade: GradeType | 'ALL'
  sortBy: 'priority' | 'created_at' | 'student_name'
  
  // UI状态
  expandedCards: Set<string>
  audioPlayingTaskId: string | null
  
  // Actions
  setTasks: (tasks: EvaluationTask[]) => void
  addTask: (task: EvaluationTask) => void
  updateTask: (taskId: string, updates: Partial<EvaluationTask>) => void
  
  setSelectedTaskId: (taskId: string | null) => void
  setSelectedReport: (report: ReportData | null) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  setFilterGrade: (grade: GradeType | 'ALL') => void
  setSortBy: (sortBy: 'priority' | 'created_at' | 'student_name') => void
  
  toggleCardExpansion: (taskId: string) => void
  setAudioPlaying: (taskId: string | null) => void
  
  // 计算属性
  getFilteredAndSortedTasks: () => EvaluationTask[]
  getTaskById: (taskId: string) => EvaluationTask | undefined
  getPendingTasksCount: () => number
  getCompletedTasksCount: () => number
}

export const useEvaluationStore = create<EvaluationState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      tasks: [],
      selectedTaskId: null,
      selectedReport: null,
      isLoading: false,
      error: null,
      
      filterGrade: 'ALL',
      sortBy: 'priority',
      
      expandedCards: new Set(),
      audioPlayingTaskId: null,
      
      // Actions
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.task_id === taskId ? { ...task, ...updates } : task
        )
      })),
      
      setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
      setSelectedReport: (report) => set({ selectedReport: report }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      setFilterGrade: (grade) => set({ filterGrade: grade }),
      setSortBy: (sortBy) => set({ sortBy }),
      
      toggleCardExpansion: (taskId) => set((state) => {
        const newExpanded = new Set(state.expandedCards)
        if (newExpanded.has(taskId)) {
          newExpanded.delete(taskId)
        } else {
          newExpanded.add(taskId)
        }
        return { expandedCards: newExpanded }
      }),
      
      setAudioPlaying: (taskId) => set({ audioPlayingTaskId: taskId }),
      
      // 计算属性
      getFilteredAndSortedTasks: () => {
        const { tasks, filterGrade, sortBy } = get()
        let filtered = tasks
        
        // 按等级过滤
        if (filterGrade !== 'ALL') {
          filtered = filtered.filter(task => 
            task.result?.final_grade_suggestion === filterGrade
          )
        }
        
        // 排序
        const sorted = [...filtered].sort((a, b) => {
          if (sortBy === 'priority') {
            // C级优先，然后按错误数量排序
            const getPriority = (task: EvaluationTask) => {
              if (!task.result) return 0
              const gradeWeight = { 'C': 3, 'B': 2, 'A': 1 }
              return gradeWeight[task.result.final_grade_suggestion] * 100 + task.result.mistake_count
            }
            return getPriority(b) - getPriority(a)
          } else if (sortBy === 'created_at') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          } else if (sortBy === 'student_name') {
            const nameA = a.result?.student_name || a.student_id
            const nameB = b.result?.student_name || b.student_id
            return nameA.localeCompare(nameB, 'zh-CN')
          }
          return 0
        })
        
        return sorted
      },
      
      getTaskById: (taskId) => {
        return get().tasks.find(task => task.task_id === taskId)
      },
      
      getPendingTasksCount: () => {
        return get().tasks.filter(task => 
          task.status === 'PENDING' || task.status === 'PROCESSING'
        ).length
      },
      
      getCompletedTasksCount: () => {
        return get().tasks.filter(task => 
          task.status === 'COMPLETED' && task.result?.approved_at
        ).length
      }
    }),
    {
      name: 'evaluation-store',
    }
  )
)
