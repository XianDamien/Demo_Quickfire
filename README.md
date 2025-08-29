# AI助教 - 单词快反智能评测系统

## 📋 系统架构

本项目采用前后端分离架构，实现音频文件上传、ASR转写、AI智能分析、教师审核的完整流程。

### 🔄 完整工作流程

```
音频文件上传 → ASR转写 → AI智能分析 → 生成报告 → 教师审核 → 最终定夺
     ↓            ↓           ↓           ↓          ↓          ↓
   前端界面    AssemblyAI   Gemini    JSON报告   批改看板   成绩导出
```

## 🚀 快速启动指南

### 环境要求
- Python 3.8+
- Node.js 18+
- npm/yarn

### 1. 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用

## 🔧 配置说明

### 环境变量配置

在 `backend` 目录下创建 `.env` 文件：

```env
# AssemblyAI API配置
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Google Gemini API配置
GOOGLE_API_KEY=your_google_api_key_here

# 数据库配置
DATABASE_URL=sqlite:///./a_ta_database.db

# 文件上传配置
UPLOAD_DIR=app/data/student_uploads
MAX_FILE_SIZE=50000000  # 50MB
```

### 题库文件格式

在 `backend/app/data/` 目录下放置 `*_快反.csv` 文件：

```csv
Question,Expected Answer
Session 1,
avoid,避免
plate,盘子
sharp,尖锐的
title,"题目, 称呼"
look (n.),"名词, 看, 样子"
Session 2,
sound,声音
test,测试
```

## 📊 核心功能模块

### 1. 音频文件上传与处理

**API端点**: `POST /api/v1/evaluate/session`

**请求格式**:
```json
{
  "student_id": "student_001",
  "unit_id": "R200", 
  "session_index": 1,
  "audio_path": "/path/to/audio.mp3"
}
```

**响应格式**:
```json
{
  "task_id": 123
}
```

### 2. ASR转写服务

**技术栈**: AssemblyAI
- 支持词级别时间戳
- 高精度语音识别
- 多种音频格式支持

**输出格式**:
```json
{
  "text": "完整转写文本...",
  "words": [
    {"text": "avoid", "start": 800, "end": 1200},
    {"text": "避免", "start": 1500, "end": 2000}
  ]
}
```

### 3. AI智能分析引擎

**技术栈**: Google Gemini
- 基于RAG的标准答案对比
- 多维度问题分类
- 智能容错机制

**分析维度**:
- **硬性错误**: 发音错误、意思错误（影响评分）
- **软性观察**: 回答不完整、口齿不清、自我纠正（不影响评分）

### 4. 评估报告生成

**核心JSON结构**:
```json
{
  "unit_id": "R200",
  "session_index": 1,
  "final_grade_suggestion": "B",
  "mistake_count": 2,
  "ai_summary_comment": "整体表现不错...",
  "full_transcription": "完整转写文本...",
  "annotations": [
    {
      "card_index": 3,
      "question": "sharp",
      "expected_answer": "尖锐的",
      "detected_text": "shop", 
      "start_time": 5200,
      "end_time": 6100,
      "issue_type": "PRONUNCIATION_ERROR",
      "explanation": "发音错误：..."
    }
  ]
}
```

### 5. 教师审核界面

**功能特性**:
- 🎯 智能排序：C级优先，错误数量排序
- ⏱️ 时间戳跳转：点击问题点秒级跳转到音频
- 📝 可编辑评语：基于AI建议的可修改评语
- 🎨 问题高亮：不同颜色标识不同类型问题

## 🗂️ 项目文件结构

```
Demo_Quickfire/
├── backend/                     # FastAPI后端
│   ├── app/
│   │   ├── api/                 # API路由
│   │   │   └── evaluation.py    # 评测相关API
│   │   ├── core/                # AI引擎
│   │   │   ├── assemblyai_engine.py  # ASR转写引擎
│   │   │   └── gemini_engine.py      # AI分析引擎
│   │   ├── db/                  # 数据库
│   │   │   ├── database.py      # 数据库连接
│   │   │   └── models.py        # 数据模型
│   │   ├── services/            # 业务逻辑
│   │   │   ├── evaluation_service.py  # 评估服务
│   │   │   └── question_bank.py      # 题库服务
│   │   ├── main.py              # 应用入口
│   │   └── schemas.py           # 数据模式
│   ├── requirements.txt         # Python依赖
│   └── data/                    # 数据文件
│       ├── student_uploads/     # 学生音频上传
│       └── *_快反.csv          # 题库文件
├── frontend/                    # Next.js前端
│   ├── app/                     # Next.js App Router
│   ├── components/              # React组件
│   ├── hooks/                   # 自定义Hooks
│   ├── lib/                     # 工具函数
│   └── store/                   # 状态管理
└── docs/                        # 项目文档
    └── PRD.md                   # 产品需求文档
```

## 🔧 开发指南

### 后端开发

#### 实现真实的AI引擎

1. **AssemblyAI引擎** (`backend/app/core/assemblyai_engine.py`):
```python
import assemblyai as aai

class AssemblyAIEngine:
    def __init__(self, api_key: str):
        aai.settings.api_key = api_key
        self.transcriber = aai.Transcriber()
    
    async def transcribe_audio(self, audio_path: str) -> dict:
        """转写音频文件，返回包含词级别时间戳的结果"""
        # 实现AssemblyAI API调用
        pass
```

2. **Gemini引擎** (`backend/app/core/gemini_engine.py`):
```python
import google.generativeai as genai

class GeminiEngine:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def analyze_response(self, standard_qna: list, transcription: dict) -> str:
        """分析学生回答，返回JSON格式报告"""
        # 实现Gemini API调用和Prompt设计
        pass
```

#### 完善数据模式

在 `backend/app/schemas.py` 中添加完整的Pydantic模式：

```python
from pydantic import BaseModel
from typing import List, Optional, Literal
from .db.models import TaskStatus

class Annotation(BaseModel):
    card_index: int
    question: str
    expected_answer: str
    detected_text: str
    start_time: int
    end_time: int
    issue_type: Literal[
        "PRONUNCIATION_ERROR",
        "WRONG_MEANING", 
        "INCOMPLETE",
        "ARTICULATION_UNCLEAR",
        "SELF_CORRECTION"
    ]
    explanation: str

class EvaluationReport(BaseModel):
    unit_id: str
    session_index: int
    final_grade_suggestion: Literal["A", "B", "C"]
    mistake_count: int
    ai_summary_comment: str
    full_transcription: str
    annotations: List[Annotation]
```

### 前端开发

#### 关键组件

1. **音频播放器组件** (`frontend/components/audio-player.tsx`):
   - 支持时间戳跳转
   - 播放控制
   - 进度条显示

2. **报告详情组件** (`frontend/components/report-detail-view.tsx`):
   - 问题高亮显示
   - 可编辑评语
   - 教师审核功能

3. **学生列表组件** (`frontend/components/student-list.tsx`):
   - 任务状态显示
   - 智能排序
   - 卡片展开/收起

#### 状态管理

使用Zustand管理全局状态：

```typescript
// frontend/store/evaluation-store.ts
import { create } from 'zustand'

interface EvaluationStore {
  tasks: EvaluationTask[]
  currentTask: EvaluationTask | null
  setTasks: (tasks: EvaluationTask[]) => void
  setCurrentTask: (task: EvaluationTask | null) => void
}
```

## 🧪 测试指南

### 后端测试

```bash
# 进入后端目录
cd backend

# 运行测试
pytest tests/

# 测试覆盖率
pytest --cov=app tests/
```

### 前端测试

```bash
# 进入前端目录
cd frontend

# 运行测试
npm test

# E2E测试
npm run test:e2e
```

## 🚀 部署指南

### Docker部署

1. **后端Dockerfile**:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **前端Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### 生产环境配置

1. **环境变量**:
```env
# 生产环境数据库
DATABASE_URL=postgresql://user:password@localhost/a_ta_db

# API密钥
ASSEMBLYAI_API_KEY=prod_api_key
GOOGLE_API_KEY=prod_api_key

# 文件存储
UPLOAD_DIR=/var/www/uploads
```

2. **反向代理** (Nginx):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## 🔍 故障排除

### 常见问题

1. **后端启动失败**:
   - 检查Python版本是否≥3.8
   - 确认依赖包安装成功
   - 检查数据库文件权限

2. **前端页面空白**:
   - 确认后端服务正常运行
   - 检查API接口连接
   - 查看浏览器控制台错误

3. **音频上传失败**:
   - 检查文件大小限制
   - 确认文件格式支持
   - 检查上传目录权限

### 日志查看

```bash
# 后端日志
cd backend
tail -f logs/app.log

# 前端日志
cd frontend
npm run dev  # 查看开发服务器日志
```

## 📈 性能优化

### 后端优化

1. **数据库优化**:
   - 添加适当索引
   - 使用连接池
   - 定期清理过期数据

2. **API优化**:
   - 实现分页查询
   - 添加缓存机制
   - 异步处理大文件

### 前端优化

1. **性能优化**:
   - 组件懒加载
   - 图片压缩
   - 代码分割

2. **用户体验**:
   - 加载状态指示
   - 错误边界处理
   - 离线缓存支持

## 📞 技术支持

### 开发团队联系
- 项目架构问题：查看 `docs/` 目录下的技术文档
- 代码实现问题：参考各模块的注释和示例
- 部署运维问题：查看部署指南和故障排除

### 相关资源
- [FastAPI官方文档](https://fastapi.tiangolo.com/)
- [Next.js官方文档](https://nextjs.org/docs)
- [AssemblyAI API文档](https://www.assemblyai.com/docs)
- [Google Gemini API文档](https://ai.google.dev/docs)

---

**最后更新**: 2025年8月29日  
**版本**: v1.0.0