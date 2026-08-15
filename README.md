# Skill Platform

企业岗位经验 Skill 生成平台 —— 通过自然语言描述，将企业岗位经验自动转换为可执行的智能体 Skill，让业务人员无需代码即可创建 AI 员工能力。

```
自然语言输入 → Skill 自动生成（7 大组成）→ 配置展示 → 调用执行 → 输出分析结果
```

## ✨ 功能特性

- **自然语言生成 Skill**：输入一句话需求，自动生成 Skill 的 7 大组成（名称、描述、使用场景、输入数据定义、分析流程、Agent Prompt、输出结果模板）
- **完整执行闭环**：生成 → 展示 → 执行 → 结果，全流程可跑通
- **多岗位场景**：内置电商运营、销售经营、用户增长、零售门店 4 个场景的示例 Skill 与示例数据
- **Skill 资产库**：Skill 的注册、列表与复用
- **Mock 兜底**：无 API Key、断网或模型故障时自动回退内置示例，演示永不中断
- **防幻觉约束**：执行时强制「结论基于输入数据，数据不足时明确标注，禁止编造数据」

## 🚀 快速开始

环境要求：Node.js ≥ 18.18，pnpm（或 npm / yarn）

```bash
# 1. 安装依赖
pnpm install

# 2.（可选）配置 DeepSeek API Key
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY=sk-xxx

# 3. 启动
pnpm dev
# 打开 http://localhost:3000
```

- 已配置 Key：页面右上角显示「● DeepSeek 已接入」，走真实模型。
- 未配置 Key：自动进入「● Mock 模式」，用内置示例跑通完整闭环。

生产构建：`pnpm build && pnpm start`
接口冒烟测试：`node smoke-test.mjs`

## 🧭 使用流程

1. 在「① 输入需求」输入或选择预设（抖音直播复盘 / 销售经营分析 / 用户增长分析 / 零售门店分析），点击「生成 Skill」
2. 「② Skill 配置」展示自动生成的 7 大组成，卡片 / JSON 双视图可切换核对
3. 「③ 输入业务数据」自动预填对应场景的示例数据，可直接执行或粘贴自己的 JSON
4. 「④ 分析结果」输出结构化的 Markdown 分析报告
5. 底部「Skill 资产库」查看、复用已注册的 Skill

## 🛠 技术栈

| 项目 | 选型 |
| --- | --- |
| 框架 | Next.js 15（App Router）+ React 19 + TypeScript |
| 模型 | DeepSeek API（OpenAI 兼容接口，`deepseek-chat`） |
| 结构化生成 | JSON Mode + Schema 约束 + few-shot + 归一化校验 |
| 兜底 | 内置 Mock（4 场景示例 Skill + 示例数据 + 报告生成器） |
| 样式 | 手写 CSS（零 UI 依赖，含轻量 Markdown 渲染器） |

## 📁 项目结构

```
├── app/
│   ├── page.tsx               # 主界面：生成 → 配置 → 执行 → 结果
│   ├── globals.css            # 全局样式
│   └── api/
│       ├── generate/          # POST 自然语言 → 生成 Skill
│       ├── execute/           # POST Skill + 数据 → 分析报告
│       ├── skills/            # GET/POST 资产库列表与注册
│       └── meta/              # GET 模型接入状态
├── components/
│   ├── SkillConfig.tsx        # Skill 配置展示（卡片 / JSON）
│   └── Markdown.tsx           # 轻量 Markdown 渲染
├── lib/
│   ├── types.ts               # Skill 数据结构（7 大组成）
│   ├── llm.ts                 # DeepSeek 客户端 + JSON 解析
│   ├── prompts.ts             # 生成 / 执行系统提示词
│   ├── skillEngine.ts         # 生成 / 执行 / 归一化校验引擎
│   ├── mock.ts                # 4 场景示例 Skill / 数据 / Mock 兜底
│   └── skillStore.ts          # 资产库（内存注册中心）
└── smoke-test.mjs             # 接口冒烟测试
```

## 🔌 API

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/api/generate` | POST | `{ requirement }` → `{ skill, source, sampleData }` |
| `/api/execute` | POST | `{ skill, inputData }` → `{ result, source }` |
| `/api/skills` | GET / POST | 资产库列表 / 注册 Skill |
| `/api/meta` | GET | 模型接入状态与模型名 |

## 🧩 Skill 结构

一个 Skill 是一份结构化的「岗位能力契约」，包含 7 大组成：名称、描述、使用场景、输入数据定义、分析流程、Agent Prompt、输出结果模板。其中「分析流程」是核心——它固化了岗位专家分析问题的方法论。

```json
{
  "name": "抖音直播运营复盘 Skill",
  "description": "对抖音直播间运营表现进行系统性复盘，输出可执行的优化建议",
  "scenarios": ["每周/每月的抖音直播间运营复盘"],
  "inputSchema": {
    "fields": [{ "name": "totalGMV", "type": "number", "description": "总成交额（万元）", "required": true }]
  },
  "analysisFlow": [
    { "step": 1, "name": "核心指标总览", "action": "汇总核心指标并与目标/历史对比", "method": "同比/环比 + 目标达成率" }
  ],
  "agentPrompt": "你是一名资深的抖音电商直播运营分析师……",
  "outputTemplate": {
    "sections": [{ "name": "一、核心指标概览", "description": "核心指标及总体判断" }]
  }
}
```

## 🗺 演进路线

- [x] 自然语言 → Skill 生成 → 配置展示 → 执行 → 结果（最小闭环）
- [x] Skill 资产库（注册 / 列表 / 复用）
- [x] Mock 兜底（无 Key / 故障可用）
- [ ] 评估层：黄金测试集 + LLM-as-judge
- [ ] 企业数据源直连
- [ ] 权限与审批、多租户
- [ ] Workflow 编排 / Agent 动态调用
