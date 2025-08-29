# AI助教 - 单词快反智能评测系统 前端

基于 Next.js 14 + TypeScript + Tailwind CSS + Zustand 构建的现代化前端系统。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI库**: Shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **数据请求**: TanStack Query (React Query)
- **图标**: Lucide React

## 📁 项目结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 教师批改看板页面
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 主页面（重定向到dashboard）
│   ├── providers.tsx      # 全局Provider配置
│   └── globals.css        # 全局样式
├── components/            # React组件
│   ├── ui/               # 基础UI组件（Button, Card等）
│   ├── dashboard-header.tsx    # 看板头部
│   ├── student-list.tsx        # 学生列表
│   ├── report-detail-view.tsx  # 报告详情视图
│   └── error-boundary.tsx      # 错误边界
├── hooks/                 # 自定义React Hooks
│   └── use-evaluation.ts  # 评测数据相关hooks
├── lib/                   # 工具函数和类型
│   ├── api.ts            # API封装
│   ├── types.ts          # TypeScript类型定义
│   ├── utils.ts          # 工具函数
│   └── mock-data.ts      # 模拟数据（开发用）
├── store/                 # Zustand状态管理
│   └── evaluation-store.ts
├── next.config.js         # Next.js配置
├── tailwind.config.ts     # Tailwind CSS配置
└── tsconfig.json          # TypeScript配置
```

## 🎯 核心功能

### 1. 教师批改看板
- **统计概览**: 显示总任务数、处理中、已完成任务数量
- **智能排序**: 根据AI建议评级和错误数量优先级排序
- **筛选功能**: 按评级（A/B/C）筛选任务
- **实时状态**: 自动轮询检查任务处理状态

### 2. 学生评测列表
- **卡片式布局**: 直观显示学生信息和评测状态
- **优先级标识**: 彩色圆点表示不同评级
- **可展开详情**: 显示AI评语预览和问题类型
- **状态管理**: 实时更新任务处理状态

### 3. 报告详情视图
- **音频播放器**: 支持播放控制、进度条、音量调节
- **时间戳跳转**: 点击问题点直接跳转到音频对应位置
- **高亮转写**: 在转写文本中高亮显示问题区域
- **问题分类**: 按硬性错误和软性观察点分类显示
- **教师反馈**: 可编辑的评级和评语表单

### 4. 智能交互
- **彩色高亮**: 不同问题类型使用不同颜色标识
- **一键跳转**: 从问题列表或高亮文本跳转到音频时间点
- **状态同步**: 前端状态与后端数据实时同步
- **错误处理**: 完善的错误边界和用户反馈

## 🎨 UI设计特点

### 评级颜色体系
- **A级**: 绿色 - 优秀表现
- **B级**: 蓝色 - 良好表现  
- **C级**: 红色 - 需要关注

### 问题类型颜色
- **发音/意思错误**: 红色系 - 严重问题
- **回答不完整**: 黄色系 - 中等问题
- **口齿不清**: 橙色系 - 轻微问题
- **自我纠正**: 绿色系 - 积极行为

## 🔧 开发指南

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
npm start
```

### 类型检查
```bash
npx tsc --noEmit
```

## 📊 数据流架构

### 状态管理（Zustand）
- `tasks`: 所有评测任务列表
- `selectedTaskId`: 当前选中的任务ID
- `selectedReport`: 当前显示的报告详情
- `filterGrade`: 当前筛选的评级
- `expandedCards`: 展开的卡片集合

### API集成（TanStack Query）
- 自动缓存和同步后端数据
- 智能轮询处理中的任务
- 错误重试和状态管理
- 离线数据缓存

### 模拟数据
开发环境下使用模拟数据，包含：
- 3个不同评级的学生样本
- 完整的问题标注数据
- 真实的音频URL（Google存储）

## 🔌 API接口

### 主要端点
- `GET /evaluate/tasks` - 获取所有任务
- `GET /evaluate/task/{id}` - 获取单个任务状态
- `GET /evaluate/report/{id}` - 获取报告详情
- `POST /evaluate/feedback` - 提交教师反馈
- `POST /evaluate/export` - 导出结果

### 代理配置
Next.js配置了API代理，将 `/api/*` 请求转发到 `http://localhost:8000/*`

## 🎵 音频处理

### 时间戳功能
- 毫秒级精度的时间戳跳转
- 音频播放器状态同步
- 自动播放跳转后的音频片段

### 支持格式
- MP3, WAV, M4A等常见音频格式
- 支持在线音频URL
- 浏览器原生audio元素

## 📱 响应式设计

### 布局适配
- **桌面端**: 三栏布局（头部 + 左侧列表 + 右侧详情）
- **平板端**: 两栏布局，可切换显示
- **移动端**: 单栏布局，卡片堆叠

### 组件优化
- 使用CSS Grid和Flexbox
- 适配不同屏幕尺寸
- 触摸友好的交互设计

## 🔒 类型安全

### TypeScript集成
- 完整的类型定义覆盖
- API响应类型检查
- 组件Props类型验证
- Zustand Store类型安全

### 开发体验
- 实时类型检查
- 智能代码补全
- 重构安全保障

## 🚧 待优化项目

1. **性能优化**
   - 虚拟滚动大量数据
   - 音频预加载机制
   - 图片懒加载

2. **用户体验**
   - 更多快捷键支持
   - 批量操作功能
   - 离线模式支持

3. **可访问性**
   - ARIA标签优化
   - 键盘导航支持
   - 屏幕阅读器兼容

## 📄 许可证

Apache 2.0 License

---

**开发团队**: AI助教项目组  
**最后更新**: 2024年8月29日