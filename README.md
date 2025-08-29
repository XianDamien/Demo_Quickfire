# AI助教 - 单词快反智能评测系统

> **赋能语言教师，而非替代教师** 

将教师从繁琐、重复的"全面收听"工作中解放出来，转变为基于AI预处理报告的"精准抽查与最终定夺"模式，大幅提升评测效率与质量。

## 🎯 项目愿景

AI助教是一个高效、不知疲倦的**预处理助教**，其核心任务是为每一份学生录音生成一份详尽、客观、可供教师修改的**"诊断报告初稿"**。

## 🏗️ 项目架构

```
ai_ta_project/
├── backend/                  # FastAPI后端服务
│   ├── app/
│   │   ├── api/              # API路由
│   │   ├── core/             # AI引擎（Gemini + AssemblyAI）
│   │   ├── db/               # 数据库模型
│   │   ├── services/         # 业务逻辑
│   │   └── main.py
│   ├── requirements.txt
│   └── README.md
├── frontend/                 # Next.js前端应用
│   ├── app/                  # Next.js App Router
│   ├── components/           # React组件
│   ├── hooks/                # 自定义Hooks
│   ├── lib/                  # 工具函数
│   ├── store/                # Zustand状态管理
│   └── README.md
└── docs/                     # 项目文档
    ├── PRD.md               # 产品需求文档
    ├── Sprint_plan.md       # 开发计划
    └── *.mermaid           # 架构图表
```

## 🚀 技术栈

### 后端 (FastAPI)
- **框架**: FastAPI (Python)
- **语音识别**: AssemblyAI (词级别时间戳)
- **AI分析**: Google Gemini
- **数据库**: SQLite
- **异步任务**: 内置异步处理

### 前端 (Next.js)
- **框架**: Next.js 14 + TypeScript
- **UI组件**: Shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **数据请求**: TanStack Query
- **图标**: Lucide React

## ✨ 核心功能

### 1. 教师批改看板
- 📊 **智能排序**: C级优先，错误数量排序
- 🎯 **精准复核**: A/B级默认折叠，C级重点关注
- ⏱️ **时间戳跳转**: 点击问题点秒级跳转到音频
- 📝 **可编辑评语**: 基于AI建议的可修改评语

### 2. AI智能分析引擎
- 🎤 **ASR转写**: 词级别时间戳精确定位
- 🧠 **LLM分析**: Gemini多任务智能评估
- 🏷️ **问题分类**: 硬性错误 vs 软性观察点
- 📋 **标准对比**: RAG检索标准答案库

### 3. 问题类型检测
| 类型 | 描述 | 影响评分 |
|------|------|----------|
| PRONUNCIATION_ERROR | 发音错误 | ✅ 硬性错误 |
| WRONG_MEANING | 意思错误 | ✅ 硬性错误 |
| INCOMPLETE | 回答不完整 | ❌ 软性观察 |
| ARTICULATION_UNCLEAR | 口齿不清 | ❌ 软性观察 |
| SELF_CORRECTION | 自我纠正 | ❌ 软性观察 |

### 4. 评级算法
- **A级**: 0个硬性错误
- **B级**: 1个硬性错误  
- **C级**: 2+个硬性错误

## 🔄 工作流程

1. **批量上传** → 教师上传学生录音文件
2. **AI处理** → 后台异步ASR转写 + LLM分析
3. **智能排序** → C级优先显示，错误数量排序
4. **精准复核** → 点击问题点音频跳转验证
5. **最终定夺** → 教师修改评级和评语
6. **结果导出** → 生成最终成绩报告

## 🎨 UI设计

### 颜色体系
- 🟢 **A级/自我纠正**: 绿色系
- 🔵 **B级/一般问题**: 蓝色系  
- 🔴 **C级/严重错误**: 红色系
- 🟡 **不完整回答**: 黄色系
- 🟠 **口齿不清**: 橙色系

### 交互特点
- **高亮点击**: 转写文本中的问题高亮可点击跳转
- **卡片展开**: 学生卡片支持详情展开/收起
- **实时状态**: 处理中任务显示动态状态
- **响应式**: 适配桌面/平板/移动端

## 🛠️ 快速开始

### 环境要求
- Python 3.8+
- Node.js 18+
- npm/yarn

### 后端启动
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 查看应用

## 📊 数据结构

### 核心JSON格式
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

## 🔌 API接口

### 主要端点
- `POST /evaluate/session` - 创建评测任务
- `GET /evaluate/tasks` - 获取任务列表
- `GET /evaluate/report/{id}` - 获取报告详情
- `POST /evaluate/feedback` - 提交教师反馈

## 📱 支持特性

### 音频处理
- ✅ 毫秒级时间戳跳转
- ✅ 播放控制（播放/暂停/跳转）
- ✅ 进度条拖拽
- ✅ 音量控制

### 实时同步
- ✅ 任务状态轮询
- ✅ 错误重试机制
- ✅ 离线缓存支持
- ✅ 乐观更新UI

## 🎯 项目特色

### 1. 教育专业性
- 基于真实教学场景设计
- 符合语言教师工作习惯
- 问题分类贴近教学需求

### 2. 技术先进性  
- 现代化技术栈
- 类型安全保障
- 性能优化设计

### 3. 用户体验
- 直观的界面设计
- 流畅的交互体验
- 完善的错误处理

## 📋 开发状态

### ✅ 已完成
- [x] 项目架构设计
- [x] 前端技术栈迁移
- [x] UI组件库集成
- [x] 状态管理配置
- [x] API层封装
- [x] 模拟数据支持
- [x] 响应式设计
- [x] 音频播放器
- [x] 时间戳跳转
- [x] 问题高亮显示

### 🚧 进行中
- [ ] 后端API开发
- [ ] AI引擎集成
- [ ] 数据库设计
- [ ] 文件上传功能

### 📅 计划中
- [ ] 单元测试覆盖
- [ ] 端到端测试
- [ ] 性能优化
- [ ] 部署配置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

Apache 2.0 License - 详见 [LICENSE](LICENSE) 文件

## 👥 开发团队

**AI助教项目组**
- 产品设计：基于真实教学需求
- 技术架构：现代化全栈解决方案
- UI/UX：专注教师用户体验

---

**最后更新**: 2024年8月29日  
**版本**: v0.1.0 (MVP)
