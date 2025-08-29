import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { GradeType, IssueType } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 获取等级样式类
export function getGradeClass(grade: GradeType): string {
  return `grade-${grade}`
}

// 获取问题类型的显示名称
export function getIssueTypeLabel(issueType: IssueType): string {
  const labels: Record<IssueType, string> = {
    'PRONUNCIATION_ERROR': '发音错误',
    'WRONG_MEANING': '意思错误',
    'INCOMPLETE': '回答不完整',
    'ARTICULATION_UNCLEAR': '口齿不清',
    'HESITATION_OR_TIMING': '犹豫或时机问题',
    'SELF_CORRECTION': '自我纠正',
    'INCOMPLETE_AND_EXTRA_WORD': '不完整且有多余词'
  }
  return labels[issueType] || issueType
}

// 获取问题类型的颜色类
export function getIssueTypeColor(issueType: IssueType): string {
  const colors: Record<IssueType, string> = {
    'PRONUNCIATION_ERROR': 'text-red-700 bg-red-100 border-red-200',
    'WRONG_MEANING': 'text-red-800 bg-red-200 border-red-300',
    'INCOMPLETE': 'text-yellow-700 bg-yellow-100 border-yellow-200',
    'ARTICULATION_UNCLEAR': 'text-orange-700 bg-orange-100 border-orange-200',
    'HESITATION_OR_TIMING': 'text-purple-700 bg-purple-100 border-purple-200',
    'SELF_CORRECTION': 'text-green-700 bg-green-100 border-green-200',
    'INCOMPLETE_AND_EXTRA_WORD': 'text-amber-700 bg-amber-100 border-amber-200'
  }
  return colors[issueType] || 'text-gray-700 bg-gray-100 border-gray-200'
}

// 是否为硬性错误（影响最终评分）
export function isHardError(issueType: IssueType): boolean {
  return ['PRONUNCIATION_ERROR', 'WRONG_MEANING'].includes(issueType)
}

// 格式化时间戳（毫秒转换为 mm:ss 格式）
export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 格式化日期
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 根据等级和错误数量计算优先级排序
export function calculatePriority(grade: GradeType, mistakeCount: number): number {
  const gradeWeight = { 'C': 3, 'B': 2, 'A': 1 }
  return gradeWeight[grade] * 100 + mistakeCount
}
