# backend/app/services/evaluation_service.py

import time
import json
import random
from sqlalchemy.orm import Session
from ..db import models
from .question_bank import question_bank_service

# --- 模拟AI引擎调用 ---
# 在实际项目中，这里会替换为对AssemblyAI和Gemini的真实API调用

def _mock_transcribe_audio(audio_path: str) -> dict:
    """模拟AssemblyAI的转写结果，包含词级别时间戳。"""
    print(f"[AI MOCK] Transcribing {audio_path}...")
    time.sleep(random.uniform(3, 6)) # 模拟网络和处理延迟
    # 这个转写文本故意包含了PRD中提到的所有错误类型
    return {
        "text": "okay first one avoid avoid is 避免... um... plate is 盘子... sharp... shop... yes... title is an 稱呼...",
        "words": [
            {"text": "avoid", "start": 800, "end": 1200},
            {"text": "避免", "start": 1500, "end": 2000},
            {"text": "plate", "start": 2500, "end": 2900},
            {"text": "盘子", "start": 3200, "end": 3700},
            {"text": "sharp", "start": 4200, "end": 4800},
            {"text": "shop", "start": 5200, "end": 6100}, # 错误发音
            {"text": "title", "start": 8000, "end": 8200},
            {"text": "is", "start": 8210, "end": 8290},
            {"text": "an", "start": 8300, "end": 8500},   # 额外词
            {"text": "稱呼", "start": 8600, "end": 9500},   # 回答不完整
        ]
    }

def _mock_analyze_with_llm(standard_qna: list, transcription: dict) -> str:
    """模拟Gemini的分析过程，严格返回PRD定义的JSON结构。"""
    print(f"[AI MOCK] Analyzing transcription with LLM...")
    time.sleep(random.uniform(2, 4))
    # 这个JSON是项目的核心产物，直接驱动前端UI
    report = {
        "unit_id": "R200",
        "session_index": 1,
        "final_grade_suggestion": "B",
        "mistake_count": 2, # 只统计硬性错误
        "ai_summary_comment": "整体表现不错，但在'sharp'的发音和'title'的完整性上存在一些小问题，建议针对性练习。",
        "full_transcription": transcription["text"],
        "annotations": [
            {
                "card_index": 2, # 对应 "sharp"
                "question": "sharp",
                "expected_answer": "尖锐的",
                "detected_text": "shop",
                "start_time": 5200,
                "end_time": 6100,
                "issue_type": "PRONUNCIATION_ERROR",
                "explanation": "发音错误：学生将 'sharp' /ʃɑːrp/ 误读为 'shop' /ʃɒp/。"
            },
            {
                "card_index": 3, # 对应 "title"
                "question": "title",
                "expected_answer": "题目, 称呼",
                "detected_text": "an 稱呼",
                "start_time": 8300,
                "end_time": 9500,
                "issue_type": "INCOMPLETE", # 根据V3.4规则，这是一个软性观察点
                "explanation": "回答不完整：遗漏了'题目'这一释义。"
            },
            {
                "card_index": 4, # 对应 "look (n.)"
                "question": "look (n.)",
                "expected_answer": "名词, 看, 样子",
                "detected_text": "看样子", # 模拟学生说了"看样子"
                "start_time": 10000, # 假设的时间戳
                "end_time": 11000,
                "issue_type": "INCOMPLETE", # 新逻辑下的核心更新
                "explanation": "回答不完整：遗漏了词性'名词'。"
            }
        ]
    }
    return json.dumps(report, ensure_ascii=False, indent=2)

# --- 核心后台任务 ---

def process_evaluation_task(task_id: int, db: Session):
    """
    后台任务的主体函数，执行完整的评测流程。
    """
    task = db.query(models.EvaluationTask).filter(models.EvaluationTask.id == task_id).first()
    if not task:
        print(f"[ERROR] Task with id {task_id} not found.")
        return

    try:
        # 1. 更新状态为处理中
        task.status = models.TaskStatus.PROCESSING
        db.commit()
        print(f"[Processing] Task {task.id} for student {task.student_id}")

        # 2. RAG: 从QuestionBank检索上下文
        standard_qna = question_bank_service.get_session(task.unit_id, task.session_index)
        if not standard_qna:
            raise ValueError(f"Question bank for unit '{task.unit_id}', session '{task.session_index}' not found.")

        # 3. ASR: 转写音频 (模拟)
        transcription_result = _mock_transcribe_audio(task.audio_path)
        
        # 4. LLM: 智能分析 (模拟)
        report_json_str = _mock_analyze_with_llm(standard_qna, transcription_result)
        report_data = json.loads(report_json_str)

        # 5. 结果存储: 更新数据库
        task.result = report_data
        task.status = models.TaskStatus.AWAITING_TEACHER_REVIEW
        db.commit()
        print(f"[Awaiting Review] Task {task.id} for student {task.student_id} finished AI evaluation, awaiting teacher review.")

    except Exception as e:
        # 错误处理
        task.status = models.TaskStatus.FAILED
        task.result = {"error": str(e)}
        db.commit()
        print(f"[Failed] Task {task.id} failed. Error: {e}")