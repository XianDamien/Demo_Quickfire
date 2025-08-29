# backend/app/api/evaluation.py

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..db import models
from ..db.database import get_db
from ..services.evaluation_service import process_evaluation_task

router = APIRouter()

class EvaluationRequest(BaseModel):
    student_id: str
    unit_id: str
    session_index: int
    audio_path: str

class EvaluationResponse(BaseModel):
    task_id: int

class TaskStatusResponse(BaseModel):
    task_id: int
    status: models.TaskStatus
    result: Optional[dict]

@router.post("/evaluate/session", response_model=EvaluationResponse, status_code=202)
async def create_evaluation_session(
    request: EvaluationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    接收评测请求，创建任务并立即返回task_id。
    实际处理在后台进行。
    """
    # 1. 创建任务记录
    new_task = models.EvaluationTask(
        student_id=request.student_id,
        unit_id=request.unit_id,
        session_index=request.session_index,
        audio_path=request.audio_path,
        status=models.TaskStatus.PENDING
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # 2. 将耗时任务添加到后台
    background_tasks.add_task(process_evaluation_task, new_task.id, db)

    # 3. 立即返回任务ID
    return {"task_id": new_task.id}


@router.get("/evaluate/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: int, db: Session = Depends(get_db)):
    """
    前端轮询此接口以获取任务状态和最终结果。
    """
    task = db.query(models.EvaluationTask).filter(models.EvaluationTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "task_id": task.id,
        "status": task.status,
        "result": task.result
    }