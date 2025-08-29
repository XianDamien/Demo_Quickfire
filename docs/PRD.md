### **产品需求文档 (PRD): AI助教 - 单词快反智能评测系统**

**版本: 3.0 (最终形态定义版)**
**日期: [当前日期]**
**文档状态: 已确认 (Confirmed)**

#### **1. 项目愿景与核心价值**

*   **项目名称**: AI助教 (AI TA) - 单词快反智能评测系统
*   **核心愿景**: **赋能语言教师，而非替代教师**。将教师从繁琐、重复的“全面收听”工作中解放出来，转变为基于AI预处理报告的“精准抽查与最终定夺”模式，大幅提升评测效率与质量。
*   **AI角色定义**: 一个高效、不知疲倦的**预处理助教**。其核心任务是为每一份学生录音生成一份详尽、客观、可供教师修改的**“诊断报告初稿” (Teacher-Ready Draft Report)**。

---

#### **2. 目标用户与核心工作流**

目标用户是语言培训机构的教师。其核心工作流如下：

1. **批量上传**: 教师将一个班级所有学生的练习录音（长音频文件）批量上传至系统。
    
2. **AI自动处理**: 系统在后台对所有音频进行异步处理。
    
3. **进入看板**: 教师进入“批改看板”页面，看到所有学生的评测任务列表。列表根据AI建议的评级（C级优先）和错误数量进行排序。
    
4. **精准复核**:
    
    - 对于AI建议评级为A/B的学生，其报告**默认折叠**，教师可选择抽查或直接通过。
        
    - 对于AI建议评级为C的学生，教师点开报告详情。
        
    - 教师在报告中看到AI生成的**评语初稿**、带**彩色高亮**的转写文本和**问题点总结列表**。
        
5. **时间戳跳转**: 教师点击任意一个问题点，音频播放器会**自动跳转到对应时间点**进行播放，实现秒级复核。
    
6. **最终定夺**: 教师可以**修改AI建议的评级**、**编辑评语**，然后点击“确认提交”，保存最终结果。
    
7. **结果导出**: 完成所有批改后，教师可以导出包含所有学生最终成绩和评语的报告。

---

#### **3. 核心系统技术流程 (异步)**

1. **API触发**: 客户端 POST /evaluate/session，请求体包含 { student_id, unit_id, session_index, audio_path }。
    
2. **任务入库**: 在SQLite中创建一条状态为PENDING的任务记录，并立即返回task_id。
    
3. **后台任务启动**:  
    a. **上下文检索 (RAG)**: 根据unit_id和session_index，从QuestionBank模块中检索出该会话的**完整标准问答列表**。  
    b. **ASR转写**: 将音频文件提交给**AssemblyAI**，获取包含**词级别时间戳 (word-level timestamps)** 的完整转写结果。  
    c. **LLM智能分析 (核心)**: 构造一个多任务分析Prompt，将**标准问答列表**和**带时间戳的转写文本**一同提交给**Google Gemini**。  
    d. **生成报告**: 指示Gemini完成分析并严格按照下述 **“诊断报告JSON结构”** 返回结果。  
    e. **结果存储**: 解析并验证Gemini返回的JSON，将其存入数据库，并将任务状态更新为COMPLETED。
---

#### **4. 关键数据结构定义**

##### **4.1 `QuestionBank` 数据结构 (内存中)**
*   一个嵌套字典，结构为：`{ unit_id: { session_index: [Card, Card, ...] } }`
*   `Card`对象包含：`card_index`, `question`, `expected_answer`。

##### **4.2 最终“诊断报告”JSON输出结构 (LLM返回)**
这是项目的核心数据产物，直接驱动前端UI。

```json
{
  "unit_id": "R200",
  "session_index": 1,
  
  // --- 底层概览信息 ---
  "final_grade_suggestion": "B",
  "mistake_count": 2,
  "ai_summary_comment": "整体表现不错，但在'sharp'的发音和'title'的完整性上存在一些小问题，建议针对性练习。",

  // --- 原始数据 ---
  "full_transcription": "okay first one avoid avoid is 避免... um... plate is 盘子... sharp... shop... yes... title is an稱呼...",
  
  // --- 详细标注列表 ---
  "annotations": [
    {
      "card_index": 3,
      "question": "sharp",
      "expected_answer": "尖锐的",
      "detected_text": "shop",
      "start_time": 5200, 
      "end_time": 6100,
      "issue_type": "PRONUNCIATION",
      "explanation": "发音错误：学生将 'sharp' /ʃɑːrp/ 误读为 'shop' /ʃɒp/。"
    },
    {
      "card_index": 4,
      "question": "title",
      "expected_answer": "题目，称呼",
      "detected_text": "an 稱呼",
      "start_time": 8300,
      "end_time": 9500,
      "issue_type": "INCOMPLETE_AND_EXTRA_WORD",
      "explanation": "回答不完整且包含额外信息：遗漏了'题目'，并增加了不必要的冠词'an'。"
    },
    { 
    "issue_type": "INCOMPLETE",
     "explanation": "回答不完整：遗漏了词性'名词'。", ... }
  ]
}
```

##### **4.3 字段详细说明**

| 字段                        | 类型      | 描述                    | UI用途            |
| :------------------------ | :------ | :-------------------- | :-------------- |
| `final_grade_suggestion`  | String  | AI根据评分规则建议的A/B/C评级。   | 列表排序、默认折叠判断     |
| `mistake_count`           | Integer | AI统计出的明确错误总数。         | 列表显示、排序依据       |
| `ai_summary_comment`      | String  | AI生成的约50字评语初稿。        | 自动填充到教师评语框      |
| `full_transcription`      | String  | 完整的ASR转写文本。           | 显示带高亮的文本        |
| `annotations`             | Array   | 包含所有检测到的问题点的对象列表。     | 生成“问题总结”列表      |
| `annotations.card_index`  | Integer | 问题点对应的题库卡片索引。         | 关联标准答案          |
| `annotations.start_time`  | Integer | 问题点在音频中的开始时间（毫秒）。     | **核心功能：点击跳转播放** |
| `annotations.end_time`    | Integer | 问题点在音频中的结束时间（毫秒）。     | 用于在转写文本中高亮      |
| `annotations.issue_type`  | String  | **问题的机器可读标签** (Enum)。 | **用于UI彩色高亮和分类** |
| `annotations.explanation` | String  | AI对该问题点的简短文字描述。       | 在问题总结中显示        |

---

#### **5. 核心功能需求**

##### **5.1 AI 智能分析引擎**
为使AI的评测更贴近真实教学场景的细节要求，我们对问题类型和评判逻辑进行如下最终定义：

**A. 评分与问题类型定义 (最终版)**

|   |   |   |   |
|---|---|---|---|
|问题标签 (issue_type)|描述|示例|类别|
|**PRONUNCIATION_ERROR**|**发音错误**: 单词被清晰地、错误地发音，导致词义改变或难以理解。|"sharp" 读成 "shop"。|**硬性错误 (Hard Error)**|
|**WRONG_MEANING**|**意思错误**: 回答与标准答案的核心意思完全不符。|question: "avoid", answer: "接受"。|**硬性错误 (Hard Error)**|
|---|---|---|---|
|**INCOMPLETE**|**回答不完整**: **【核心更新】** 包含以下两种情况：<br>1. **遗漏部分释义**: 未说出标准答案中的全部核心释义。<br>2. **遗漏词性**: 未说出标准答案中要求的词性。|1. expected: "题目, 称呼", detected: "称呼"。 <br>2. expected: "名词, 看", detected: "看"。|**软性观察点 (Soft Flag)**|
|**ARTICULATION_UNCLEAR**|**口齿不清**: 发音含混、模糊，但仍能大致辨别意思。|将 "sound" 含糊地发成类似 "sond" 的音。|**软性观察点 (Soft Flag)**|
|**HESITATION_OR_TIMING**|**犹豫或时机不当**: 回答前有过长停顿；或回答太晚，与下一题重叠。|在提示音后停顿超过3秒才作答。|**软性观察点 (Soft Flag)**|
|**SELF_CORRECTION**|**自我纠正**: 先说错后说对。这是一个积极行为的标记。|"shop... no, sharp"。|**软性观察点 (Soft Flag)**|

**核心评级逻辑**:

- **mistake_count**: **只统计“硬性错误”** (PRONUNCIATION_ERROR, WRONG_MEANING) 的数量。
    
- **final_grade_suggestion**: A/B/C评级**仅基于 mistake_count**。
    
- **annotations 列表**: 必须**包含所有被检测到的“硬性错误”和“软性观察点”**，以便教师全面了解情况。
    

**B. 核心AI容错逻辑 (LLM Prompt核心指令 - 已更新)**

1. **自我纠正原则 (Self-Correction Rule)**
    
    - **指令**: 如果学生先说错后说对，不计为错误。必须创建一个SELF_CORRECTION类型的**软性观察点**来标记。
        
2. **中性额外词容忍原则 (Neutral Extra Word Tolerance)**
    
    - **指令**: 不影响核心词义的中性、口头禅或语气词（如“嗯...”、“那个...”、“它的意思是...”），**应被完全忽略，不创建任何标记**。AI的输出应保持简洁，只关注有教学意义的偏差。

**新规则下的工作示例:**

- **场景**: Question: "look (n.)", Expected Answer: "名词, 看, 样子", Student Answer: "看样子"。
    
- **旧逻辑 (V3.3)**: 判定为完全正确。
    
- **新逻辑 (V3.4)**:
    
    - **分析**: 学生回答了核心释义，但遗漏了“名词”这个词性。
        
    - **输出**:
        
        - mistake_count 保持为0。
        - final_grade_suggestion 不受影响。
        - annotations 列表中**必须新增一个标记**:
            ```
            {
              "issue_type": "INCOMPLETE",
              "explanation": "回答不完整：遗漏了词性'名词'。",
              ...
            }
            ```
*   **
* 时间戳对齐**: 必须利用ASR的词级别时间戳，为每个`annotation`提供准确的`start_time`和`end_time`。
*   **Prompt 设计**: 核心技术挑战在于设计一个能够稳定、可靠地执行以上所有任务，并以指定JSON格式输出的Gemini Prompt。

##### **5.2 数据管理**
*   **批量导入**: 系统需支持批量导入音频文件。文件名或元数据中必须包含**学生标识（姓名/编号）**，以便关联。
*   **结果导出**: 提供功能，允许教师导出指定范围（如一个班级、一次作业）的评测结果。导出的数据必须包含**学生标识**、**教师最终确定的评级**和**教师最终的评语**。

---

#### **6. 技术栈**

*   **后端框架**: FastAPI (Python)
*   **语音识别 (ASR)**: AssemblyAI (必须使用支持词级别时间戳的服务)
*   **大语言模型 (LLM)**: Google Gemini
*   **数据库**: SQLite (用于异步任务追踪和存储最终评测结果)
*   **数据存储**: 本地文件系统 (用于存放音频和题库CSV)

#### **7. 前端技术栈与范围**

为了实现第2节中描述的“教师批改看板”工作流，我们定义以下前端技术栈和开发范围。

- **框架**: **Next.js (基于 React)** - 提供优秀的开发体验、强大的路由功能和性能优化能力，是现代Web应用的黄金标准。
    
- **语言**: **TypeScript** - 为JavaScript提供类型安全，能显著减少运行时错误，提高代码质量和可维护性。
    
- **UI组件库**: **Shadcn/ui** - 一个创新的组件集合，它将设计精美的组件（基于Tailwind CSS和Radix UI）直接复制到你的项目中，提供了极高的定制性和灵活性。
    
- **样式**: **Tailwind CSS** - 一个“功能优先”的CSS框架，能极大地加速UI开发，无需离开HTML即可构建美观、响应式的界面。
    
- **状态管理**: **Zustand** - 一个轻量、快速、易于使用的React状态管理库，完美适用于管理全局状态，如当前用户信息、评测列表等，避免了Redux的复杂性。
    
- **数据请求与缓存**: **TanStack Query (原 React Query)** - 一个强大的异步状态管理库。它能优雅地处理数据获取、缓存、轮询（**对于检查异步任务状态至关重要**）以及加载和错误状态。
    

前端需要实现以下核心界面和组件：

1. **登录页面 (可选/模拟)**: 一个简单的入口。
    
2. **教师批改看板 (Dashboard)**:
    
    - **学生列表 (Student List)**: 左侧或主列表，展示所有待批改/已批改的学生任务。每项应显示学生姓名、AI建议评级、错误数和任务状态（处理中/已完成）。
        
    - **报告详情视图 (Report Detail View)**: 点击一个学生后，展示其完整的诊断报告。
        
    - **可编辑的评级和评语**: 允许教师修改AI建议的final_grade_suggestion和ai_summary_comment。
        
    - **带高亮的转写文本**: 根据annotations中的start_time和end_time，在full_transcription上渲染出不同颜色的高亮块。
        
    - **问题总结列表**: 循环annotations数组，生成一个清晰的问题点列表。
        
    - **带时间戳跳转的音频播放器**: 一个自定义的音频播放器组件，点击问题总结列表或高亮文本时，能接收start_time并自动跳转到该时间点播放。
        

---

#### **8. 最终项目文件结构**

为了清晰地分离前后端关注点，同时便于管理，我们采用一个单仓库（monorepo-style）的目录结构。

codeCode

```
ai_ta_project/
│
├── backend/                  # 后端 FastAPI 项目
│   ├── app/
│   │   ├── api/              # API 路由/端点
│   │   │   └── evaluation.py
│   │   ├── core/             # 核心AI引擎逻辑
│   │   │   ├── gemini_engine.py
│   │   │   └── assemblyai_engine.py
│   │   ├── data/             # 存放CSV题库和学生音频文件
│   │   │   ├── R200_快反.csv
│   │   │   └── student_uploads/
│   │   ├── db/               # 数据库相关
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── services/         # 服务层，编排核心逻辑
│   │   │   ├── question_bank.py
│   │   │   └── evaluation_service.py
│   │   └── main.py           # FastAPI应用入口
│   │
│   ├── .env                  # 环境变量
│   ├── requirements.txt      # Python依赖
│   └── README.md             # 后端说明
│
├── frontend/                 # 前端 Next.js 项目
│   ├── app/                  # Next.js App Router
│   │   ├── dashboard/        # 教师看板页面
│   │   │   └── page.tsx      # 看板主页面组件
│   │   ├── (auth)/           # 登录相关页面 (可选)
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── layout.tsx        # 全局布局
│   │   └── globals.css       # 全局样式
│   │
│   ├── components/           # 可复用的UI组件
│   │   ├── ui/               # Shadcn/ui 生成的组件 (e.g., Button, Card)
│   │   ├── audio-player.tsx  # 自定义音频播放器
│   │   ├── report-card.tsx   # 报告详情卡片
│   │   └── student-list.tsx  # 学生列表组件
│   │
│   ├── hooks/                # 自定义React Hooks
│   │   └── use-evaluation.ts # 处理评测任务轮询逻辑的Hook
│   │
│   ├── lib/                  # 辅助函数和工具
│   │   └── api.ts            # 封装所有对后端API的请求
│   │
│   ├── store/                # 全局状态管理 (Zustand)
│   │   └── evaluation-store.ts
│   │
│   ├── package.json          # Node.js依赖和脚本
│   ├── tailwind.config.ts    # Tailwind CSS 配置文件
│   └── tsconfig.json         # TypeScript 配置文件
│
├── .gitignore
└── README.md                 # 整个项目的总说明
```

#### **7. MVP范围之外 (Out of Scope)**
*   **实时评测**: 所有评测均为异步后台处理，不提供实时流式评测。
*   **多用户与权限管理**: 原型阶段默认为单教师用户场景。
*   **复杂的声学分析**: 不进行音高、语调、流利度等专业声学维度的分析，仅聚焦于内容和发音的准确性。

**2. 输入数据结构与`QuestionBank`模块**

*   **数据源**: 一个包含多个`*快反.csv`题库文件的本地目录。
*   **ID体系**: `unit_id`, `session_index`, `card_index`。
*   **核心模块 `QuestionBank`**:
    *   一个在系统启动时初始化的确定性数据加载模块，**不涉及AI**。
    *   **核心解析规则**: Session标题行只作为标题，不作为Card。
    *   **功能**: 为AI提供指定`Session`的**完整标准问答列表**作为RAG数据源。


### **1. 上下文检索 (RAG) - 模拟**

根据音频中的教师提示音，我识别出本次练习会话包含以下9张卡片：

| card_index | 问题 (Question) | 标准答案 (Expected Answer) |
| :--------- | :------------ | :--------------------- |
| 1          | sound         | 行为动词, 声音               |
| 2          | look (v.)     | 看, 瞧, 看上去              |
| 3          | look (n.)     | 名词, 看, 样子              |
| 4          | feel          | 感觉, 觉得                 |
| 5          | touch (v.)    | 行为动词, 触摸, 联系, 摸起来      |
| 6          | touch (n.)    | 名词, 联系                 |
| 7          | taste (v.)    | 吃起来, 品尝                |
| 8          | taste (n.)    | 名词, 味道                 |
| 9          | hear          | 听到, 听见                 |
| 10         | smell         | 闻味道, 闻起来               |

### **2. ASR转写**

**学生完整录音转写:**
`"声音听起来... 看着看下去... 看样子... 感觉觉得... 触摸联系摸起来... 联系... 吃起来品尝... 味道... 听到听见... 闻起来..."`

### **3. LLM 智能分析**

现在，我将逐一对比学生的回答和标准答案：

*   **Card 1 (sound):**
    *   **学生回答:** "声音听起来"
    *   **标准答案:** "行为动词, 声音"
    *   **分析:** 学生回答正确了核心词“声音”，但**遗漏了词性“行为动词”**，并且**加入了额外的词“听起来”**。这是一个明确的、需要标注的偏差。**(错误 +1)**
*   **Card 2 (look - v.):**
    *   **学生回答:** "看着看下去" (应为“看着看上去”)
    *   **标准答案:** "看, 瞧, 看上去"
    *   **分析:** 学生将“上去”说成了“下去”，有轻微口误，但核心意思“看”和“看上/下/去”表达正确。AI应具备**口误容错**能力，判定为基本正确。
*   **Card 3 (look - n.):**
    *   **学生回答:** "看样子"
    *   **标准答案:** "名词, 看, 样子"
    *   **分析:** 学生回答正确，但遗漏了词性。在“单词快反”场景下，这通常不计为错误。判定为正确。
*   **Card 4 (feel):**
    *   **学生回答:** "感觉觉得"
    *   **标准答案:** "感觉, 觉得"
    *   **分析:** 完全正确。
*   **Card 5 (touch - v.):**
    *   **学生回答:** "触摸联系摸起来"
    *   **标准答案:** "行为动词, 触摸, 联系, 摸起来"
    *   **分析:** 学生回答非常完整，但同样遗漏了词性。同Card 3，判定为正确。
*   **Card 6-10:** 经分析，学生对 `touch (n.)`, `taste (v.)`, `taste (n.)`, `hear`, `smell` 的回答均准确无误。

**分析结论:** 在整个练习会话中，共识别出 **1个** 明确的错误。

