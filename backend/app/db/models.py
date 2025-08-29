# backend/app/db/models.py

import enum
from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum
from sqlalchemy.sql import func
from .database import Base

class TaskStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class EvaluationTask(Base):
    __tablename__ = "evaluation_tasks"

    id = Column(Integer, primary_key=True, index=True)
    
    # --- 输入信息 ---
    student_id = Column(String, index=True, nullable=False)
    unit_id = Column(String, index=True, nullable=False)
    session_index = Column(Integer, nullable=False)
    audio_path = Column(String, nullable=False)

    # --- 任务状态与结果 ---
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    result = Column(JSON, nullable=True) # 存储PRD定义的"诊断报告"JSON

    # --- 时间戳 ---
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<EvaluationTask(id={self.id}, student='{self.student_id}', status='{self.status.value}')>"