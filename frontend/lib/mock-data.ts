import { ReportData, EvaluationTask } from './types'

export const MOCK_REPORTS: ReportData[] = [
  {
    task_id: 't003',
    student_id: 's003',
    student_name: '学生C',
    audio_url: 'https://storage.googleapis.com/maker-suite-apps/prompts-api-explore/quick-reply-audio-3.mp3',
    unit_id: 'R200',
    session_index: 1,
    final_grade_suggestion: 'C',
    mistake_count: 2,
    ai_summary_comment: "整体表现不错，但在'sharp'的发音和'title'的完整性上存在一些小问题，建议针对性练习。",
    full_transcription: "okay first one avoid avoid is 避免... um... plate is 盘子... sharp... shop... yes... title is an 稱呼...",
    annotations: [
      {
        card_index: 3,
        question: "sharp",
        expected_answer: "尖锐的",
        detected_text: "shop",
        start_time: 5200,
        end_time: 6100,
        issue_type: "PRONUNCIATION_ERROR",
        explanation: "发音错误：学生将 'sharp' /ʃɑːrp/ 误读为 'shop' /ʃɒp/。"
      },
      {
        card_index: 4,
        question: "title",
        expected_answer: "题目，称呼",
        detected_text: "an 稱呼",
        start_time: 8300,
        end_time: 9500,
        issue_type: "INCOMPLETE_AND_EXTRA_WORD",
        explanation: "回答不完整且包含额外信息：遗漏了'题目'，并增加了不必要的冠词'an'。"
      }
    ],
    status: 'COMPLETED',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z'
  },
  {
    task_id: 't002',
    student_id: 's002',
    student_name: '学生B',
    audio_url: 'https://storage.googleapis.com/maker-suite-apps/prompts-api-explore/quick-reply-audio-2.mp3',
    unit_id: 'R200',
    session_index: 1,
    final_grade_suggestion: 'B',
    mistake_count: 1,
    ai_summary_comment: "整体表现很好，反应迅速准确。只有'sound'的回答不完整，遗漏了词性部分。稍加注意细节就能达到完美分数。",
    full_transcription: "声音听起来... 看着看上去... 看样子... 感觉觉得... 触摸联系摸起来... 联系... 吃起来品尝... 味道... 听到听见... 闻起来...",
    annotations: [
      {
        card_index: 1,
        question: "sound",
        expected_answer: "行为动词, 声音",
        detected_text: "声音听起来",
        start_time: 1000,
        end_time: 2500,
        issue_type: "INCOMPLETE_AND_EXTRA_WORD",
        explanation: "回答不完整且有多余词汇：遗漏了词性'行为动词'，并添加了'听起来'。"
      }
    ],
    status: 'COMPLETED',
    created_at: '2024-01-15T09:20:00Z',
    updated_at: '2024-01-15T09:25:00Z'
  },
  {
    task_id: 't001',
    student_id: 's001',
    student_name: '学生A',
    audio_url: 'https://storage.googleapis.com/maker-suite-apps/prompts-api-explore/quick-reply-audio-1.mp3',
    unit_id: 'R200',
    session_index: 1,
    final_grade_suggestion: 'A',
    mistake_count: 0,
    ai_summary_comment: "优秀表现！所有回答都迅速、准确、完整。发音清晰自信，贯穿整个练习。",
    full_transcription: "声音... 看... 样子... 感觉觉得... 触摸联系... 联系... 吃起来品尝... 味道... 听到听见... 闻起来...",
    annotations: [],
    status: 'COMPLETED',
    created_at: '2024-01-15T08:10:00Z',
    updated_at: '2024-01-15T08:15:00Z'
  }
]

export const MOCK_TASKS: EvaluationTask[] = MOCK_REPORTS.map(report => ({
  task_id: report.task_id,
  student_id: report.student_id,
  unit_id: report.unit_id,
  session_index: report.session_index,
  audio_path: `/uploads/${report.student_id}_${report.unit_id}_session${report.session_index}.mp3`,
  status: report.status,
  created_at: report.created_at!,
  updated_at: report.updated_at!,
  result: report
}))

// 模拟API延迟
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 检查是否在开发环境中使用模拟数据
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL
