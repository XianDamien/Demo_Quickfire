'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Save, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useEvaluationReport, useSubmitFeedback } from '@/hooks/use-evaluation'
import { formatTimestamp, getIssueTypeLabel, getIssueTypeColor, isHardError } from '@/lib/utils'
import { Annotation, GradeType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  audioUrl: string
  onSeek?: (time: number) => void
}

function AudioPlayer({ audioUrl, onSeek }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const seekTo = (time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
  }

  const seekRelative = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * duration
    seekTo(time)
  }

  // 外部调用的跳转方法
  useEffect(() => {
    if (onSeek) {
      // 将seekTo方法暴露给父组件
      window.audioSeekTo = (timeMs: number) => {
        seekTo(timeMs / 1000)
        if (!isPlaying) {
          togglePlayPause()
        }
      }
    }
  }, [onSeek, isPlaying, togglePlayPause])

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} />
      
      {/* 进度条 */}
      <div 
        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-100"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* 时间显示 */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTimestamp(currentTime * 1000)}</span>
        <span>{formatTimestamp(duration * 1000)}</span>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => seekRelative(-10)}
          className="flex items-center gap-1"
        >
          <SkipBack className="h-4 w-4" />
          -10s
        </Button>

        <Button
          onClick={togglePlayPause}
          className="flex items-center gap-2 px-6"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              暂停
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              播放
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => seekRelative(10)}
          className="flex items-center gap-1"
        >
          +10s
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>


    </div>
  )
}

interface TranscriptionViewProps {
  audioUrl: string
  transcription: string
  annotations: Annotation[]
  onAnnotationClick: (annotation: Annotation) => void
}

function TranscriptionView({ audioUrl, transcription, annotations, onAnnotationClick }: TranscriptionViewProps) {
  // 创建带高亮的转写文本
  const createHighlightedText = () => {
    let result = transcription
    const highlights: { text: string; annotation: Annotation; index: number }[] = []
    
    // 收集所有需要高亮的文本段
    annotations.forEach((annotation, index) => {
      const textIndex = result.indexOf(annotation.detected_text)
      if (textIndex !== -1) {
        highlights.push({
          text: annotation.detected_text,
          annotation,
          index: textIndex
        })
      }
    })

    // 按位置排序，避免重叠
    highlights.sort((a, b) => a.index - b.index)

    // 构建JSX元素
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    highlights.forEach((highlight, i) => {
      // 添加高亮前的普通文本
      if (highlight.index > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>
            {result.slice(lastIndex, highlight.index)}
          </span>
        )
      }

      // 添加高亮文本
      elements.push(
        <mark
          key={`highlight-${i}`}
          className={cn(
            "cursor-pointer transition-colors hover:opacity-80 rounded px-1",
            getIssueTypeColor(highlight.annotation.issue_type),
            isHardError(highlight.annotation.issue_type) && "font-semibold"
          )}
          onClick={() => onAnnotationClick(highlight.annotation)}
          title={`${getIssueTypeLabel(highlight.annotation.issue_type)}: ${highlight.annotation.explanation}`}
        >
          {highlight.text}
        </mark>
      )

      lastIndex = highlight.index + highlight.text.length
    })

    // 添加剩余的普通文本
    if (lastIndex < result.length) {
      elements.push(
        <span key="text-end">
          {result.slice(lastIndex)}
        </span>
      )
    }

    return elements
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">学生录音与转写文本</CardTitle>
        <CardDescription>
          播放录音，点击高亮文本可跳转至音频对应位置。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 音频播放器 */}
        <div className="mb-3">
          <AudioPlayer audioUrl={audioUrl} />
        </div>

        {/* 分割线和转写文本 */}
        <div className="border-t border-gray-200 pt-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {createHighlightedText()}
            </p>
          </div>
          
          {/* 紧凑图例 */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-600">高亮颜色:</span>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-200 rounded"></div>
                <span>错误</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-200 rounded"></div>
                <span>不完整</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-200 rounded"></div>
                <span>不清</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-200 rounded"></div>
                <span>纠正</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnnotationListProps {
  annotations: Annotation[]
  onAnnotationClick: (annotation: Annotation) => void
}

function AnnotationList({ annotations, onAnnotationClick }: AnnotationListProps) {
  if (annotations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">问题总结</CardTitle>
          <CardDescription>AI识别出的待复核问题点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-green-500 text-2xl mb-2">🎉</div>
            <p className="text-gray-600">未检测到错误，表现优秀！</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hardErrors = annotations.filter(a => isHardError(a.issue_type))
  const softFlags = annotations.filter(a => !isHardError(a.issue_type))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          问题总结 ({annotations.length}个问题点)
        </CardTitle>
        <CardDescription>
          AI识别出的待复核问题点。点击可跳转到音频对应位置。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 硬性错误 */}
        {hardErrors.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-2">
              严重问题 ({hardErrors.length}个)
            </h4>
            <div className="space-y-1">
              {hardErrors.map((annotation, index) => (
                <div
                  key={`hard-${index}`}
                  onClick={() => onAnnotationClick(annotation)}
                  className="flex items-center justify-between p-2 border border-red-200 rounded cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-red-600 font-medium text-sm">{index + 1}.</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs font-medium rounded border",
                      getIssueTypeColor(annotation.issue_type)
                    )}>
                      {getIssueTypeLabel(annotation.issue_type)}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      &quot;{annotation.detected_text}&quot;
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(annotation.start_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 软性观察点 */}
        {softFlags.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-700 mb-2">
              观察点 ({softFlags.length}个)
            </h4>
            <div className="space-y-1">
              {softFlags.map((annotation, index) => (
                <div
                  key={`soft-${index}`}
                  onClick={() => onAnnotationClick(annotation)}
                  className="flex items-center justify-between p-2 border border-orange-200 rounded cursor-pointer hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-orange-600 font-medium text-sm">{hardErrors.length + index + 1}.</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-xs font-medium rounded border",
                      getIssueTypeColor(annotation.issue_type)
                    )}>
                      {getIssueTypeLabel(annotation.issue_type)}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      &quot;{annotation.detected_text}&quot;
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(annotation.start_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TeacherFeedbackFormProps {
  taskId: string
  initialGrade: GradeType
  initialComment: string
}

function TeacherFeedbackForm({ taskId, initialGrade, initialComment }: TeacherFeedbackFormProps) {
  const [grade, setGrade] = useState<GradeType>(initialGrade)
  const [comment, setComment] = useState(initialComment)
  const [isSaved, setIsSaved] = useState(false)
  
  const submitFeedback = useSubmitFeedback()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    submitFeedback.mutate({
      task_id: taskId,
      final_grade: grade,
      teacher_comment: comment,
      approved_at: new Date().toISOString()
    }, {
      onSuccess: () => {
        setIsSaved(true)
        // 3秒后重置保存状态，允许再次编辑
        setTimeout(() => setIsSaved(false), 3000)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">教师综合评语</CardTitle>
            <CardDescription>复核AI建议，并给出最终评定</CardDescription>
          </div>
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">已保存</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 等级选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最终评级
            </label>
            <div className="flex gap-2">
              {(['A', 'B', 'C'] as GradeType[]).map((gradeOption) => (
                <button
                  key={gradeOption}
                  type="button"
                  onClick={() => setGrade(gradeOption)}
                  className={cn(
                    "px-4 py-2 rounded border font-medium transition-colors",
                    grade === gradeOption
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {gradeOption}级
                </button>
              ))}
            </div>
          </div>

          {/* 评语输入 */}
          <div>
            <label htmlFor="teacher-comment" className="block text-sm font-medium text-gray-700 mb-2">
              评语
            </label>
            <textarea
              id="teacher-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-white"
              placeholder="请输入您的评语..."
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitFeedback.isPending || isSaved}
              className="flex items-center gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {submitFeedback.isPending ? '保存中...' : '保存反馈'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface ReportDetailViewProps {
  taskId: string
}

export function ReportDetailView({ taskId }: ReportDetailViewProps) {
  const { data: report, isLoading, error } = useEvaluationReport(taskId)

  const handleAnnotationClick = (annotation: Annotation) => {
    // 使用全局方法跳转音频
    if (window.audioSeekTo) {
      window.audioSeekTo(annotation.start_time)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">加载报告失败: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">未找到报告数据</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 学生信息头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {report.student_name} - 评测报告
              </CardTitle>
              <CardDescription>
                单元: {report.unit_id} | 会话: {report.session_index}
              </CardDescription>
            </div>
            <div className={cn(
              "px-3 py-1 rounded text-sm font-medium border",
              `grade-${report.final_grade_suggestion}`
            )}>
              {report.final_grade_suggestion} 级
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 合并后的录音与转写 */}
      <TranscriptionView
        audioUrl={report.audio_url}
        transcription={report.full_transcription}
        annotations={report.annotations}
        onAnnotationClick={handleAnnotationClick}
      />

      {/* 问题总结 */}
      <AnnotationList
        annotations={report.annotations}
        onAnnotationClick={handleAnnotationClick}
      />

      {/* 教师反馈 */}
      <TeacherFeedbackForm
        taskId={taskId}
        initialGrade={report.final_grade_suggestion}
        initialComment={report.ai_summary_comment}
      />
    </div>
  )
}

// 声明全局类型
declare global {
  interface Window {
    audioSeekTo?: (timeMs: number) => void
  }
}
