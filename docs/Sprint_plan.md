3. 敏捷开发计划 (Agile Development Plan)
这是一个建议的、为期6周的开发计划，采用Scrum框架，每周为一个Sprint。
Sprint 0: Foundation & Setup (Week 0)
目标: 搭建开发环境，确保所有工具和服务都已就绪。
用户故事:
作为开发者，我需要建立一个Git仓库并设置好backend和frontend的目录结构。
作为开发者，我需要配置好后端的Python虚拟环境和requirements.txt。
作为开发者，我需要设置好前端的Next.js项目，并集成TypeScript, Tailwind CSS, и Shadcn/ui。
作为开发者，我需要获取并安全地管理所有API密钥（Google Gemini, AssemblyAI）在.env文件中。
产出: 一个可以分别运行“Hello World”的FastAPI后端和Next.js前端的项目骨架。
Sprint 1: The Headless Backend Engine (Week 1)
目标: 实现核心的、无API的评估逻辑。这是项目的技术核心。
用户故事:
作为系统，我需要能从CSV文件中加载并解析题库，构建QuestionBank内存数据结构。
作为系统，我需要一个assemblyai_engine模块，能够接收一个音频文件路径并返回带词级别时间戳的转写结果。
作为系统，我需要一个gemini_engine模块，它能接收题库和转写文本，并根据核心Prompt生成（目前只是打印到控制台）符合PRD规范的JSON报告。
产出: 一个可以从命令行调用的Python脚本 (run_test.py)，输入一个音频路径和session ID，能成功输出完整的诊断报告JSON。
Sprint 2: Backend API & Task Management (Week 2)
目标: 将“无头引擎”封装成一个异步的、可供前端调用的Web服务。
用户故事:
作为后端，我需要实现SQLite数据库模型 (EvaluationTask) 和数据库连接。
作为后端，我需要提供一个POST /evaluate/session API端点，它能接收文件上传和元数据，在数据库中创建一条PENDING任务记录，并启动一个后台评估任务。
作为后端，我需要提供一个GET /evaluate/status/{task_id} API端点，供前端轮询任务状态和获取最终的JSON结果。
产出: 一个可以通过Postman或curl进行完整测试的后端API。可以上传音频，获取task_id，轮询状态，并最终拿到结果。
Sprint 3: Frontend - Dashboard & API Integration (Week 3)
目标: 搭建前端看板，并实现与后端的通信。
用户故事:
作为教师，我需要一个看板页面，能显示一个（目前是静态的）学生任务列表。
作为教师，我可以在页面上选择一个音频文件并提交评估，前端应调用后端API并获取task_id。
作为前端应用，我需要使用TanStack Query来实现对任务状态的自动轮询，并在UI上显示“处理中...”或“已完成”。
作为开发者，我需要建立一个API客户端 (lib/api.ts) 来统一管理所有后端请求。
产出: 一个可以提交任务并实时更新任务状态的前端看板。此时点击“已完成”的任务可能只显示原始JSON。
Sprint 4: Frontend - The Interactive Report Viewer (Week 4)
目标: 将后端返回的JSON数据渲染成一个对教师友好的、可交互的报告。这是核心用户体验。
用户故事:
作为教师，当我点击一个已完成的任务时，我能看到AI建议的评级、评语和错误总数。
作为教师，我能看到完整的、根据annotations数据进行了彩色高亮的转写文本。
作为教师，我能看到一个清晰的“问题总结列表”，逐条列出所有annotations。
作为教师，我需要一个音频播放器。当我点击问题列表中的某一项或高亮的文本时，播放器能自动跳转到对应的时间点播放。
产出: 一个功能完整的、交互式的报告查看器，实现了PRD中定义的所有核心复核功能。
Sprint 5: Teacher Finalization & Workflow Completion (Week 5)
目标: 完善教师“最终定夺”的工作流，并增加辅助功能。
用户故事:
作为教师，我可以在报告页面修改AI建议的评级和编辑评语。
作为教师，我需要一个“确认提交”按钮，点击后会将我的最终决定保存到后端（需要新增一个PATCH /evaluate/{task_id} API）。
作为教师，我希望看板列表能根据AI建议的评级（C级优先）和错误数进行默认排序。
作为教师，我需要一个“全部导出”按钮，能将所有已确认的学生报告（学生ID，最终评级，最终评语）下载为CSV文件。
产出: 一个完整闭环的教师批改工作流，从查看报告到最终提交和导出。
Sprint 6: Testing, Refinement & Deployment Prep (Week 6)
目标: 确保系统稳定可靠，并为上线做准备。
用户故事:
作为QA/开发者，我需要对整个系统进行端到端测试，覆盖各种正常和异常场景（如ASR失败、音频格式错误等）。
作为产品经理/开发者，我需要用5-10个真实的、多样的学生录音来测试和微调Gemini Prompt，以提高准确性。
作为开发者，我需要为项目编写README文档，说明如何安装、配置和运行。
作为运维，我需要将应用容器化（Docker），并准备部署脚本。
产出: 一个经过充分测试、文档齐全、准备好部署的稳定版本。