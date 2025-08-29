# backend/app/main.py

from fastapi import FastAPI
from .db.database import create_db_and_tables
from .api import evaluation

app = FastAPI(
    title="AI助教 - 单词快反智能评测系统",
    description="将教师从繁琐的收听工作中解放出来，提供基于AI预处理的诊断报告初稿。",
    version="3.0"
)

@app.on_event("startup")
def on_startup():
    # 应用启动时创建数据库表（如果不存在）
    create_db_and_tables()
    # 题库服务已在导入时自动加载数据
    print("[*] Application startup complete. AI TA Backend is running.")

# 包含评测相关的API路由
app.include_router(evaluation.router, prefix="/api/v1", tags=["Evaluation"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI TA Backend API"}