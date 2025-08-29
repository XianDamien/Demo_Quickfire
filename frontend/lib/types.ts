// 基于PRD文档的类型定义

export type IssueType =
  | 'PRONUNCIATION_ERROR'
  | 'WRONG_MEANING'
  | 'INCOMPLETE'
  | 'ARTICULATION_UNCLEAR'
  | 'HESITATION_OR_TIMING'
  | 'SELF_CORRECTION'
  | 'INCOMPLETE_AND_EXTRA_WORD'

export type GradeType = 'A' | 'B' | 'C'

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface Annotation {
  card_index: number
  question: string
  expected_answer: string
  detected_text: string
  start_time: number // 毫秒
  end_time: number // 毫秒
  issue_type: IssueType
  explanation: string
}

export interface ReportData {
  task_id: string
  student_id: string
  student_name: string
  audio_url: string
  unit_id: string
  session_index: number
  final_grade_suggestion: GradeType
  mistake_count: number
  ai_summary_comment: string
  full_transcription: string
  annotations: Annotation[]
  status: TaskStatus
  created_at?: string
  updated_at?: string
}

export interface EvaluationTask {
  task_id: string
  student_id: string
  unit_id: string
  session_index: number
  audio_path: string
  status: TaskStatus
  created_at: string
  updated_at: string
  result?: ReportData
}

export interface CreateEvaluationRequest {
  student_id: string
  unit_id: string
  session_index: number
  audio_file: File
}

export interface CreateEvaluationResponse {
  task_id: string
  status: TaskStatus
  message: string
}

export interface TeacherFeedback {
  task_id: string
  final_grade: GradeType
  teacher_comment: string
  approved_at: string
}
