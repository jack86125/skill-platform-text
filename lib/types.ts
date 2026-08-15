/**
 * Skill 的核心数据结构 —— 与 Skill 的 7 大核心组成一一对应。
 * 这是整个平台的"能力契约"，前端展示、后端生成、执行引擎都围绕它工作。
 */

export interface InputField {
  /** 字段名，例如 totalGMV */
  name: string;
  /** 字段类型：string / number / date / array / object */
  type: string;
  /** 字段含义说明 */
  description: string;
  /** 是否必填 */
  required: boolean;
}

export interface AnalysisStep {
  /** 步骤序号，从 1 开始 */
  step: number;
  /** 步骤名称 */
  name: string;
  /** 这一步具体做什么 */
  action: string;
  /** 采用的分析方法 / 口径 */
  method: string;
}

export interface OutputSection {
  /** 输出报告章节标题 */
  name: string;
  /** 该章节要输出什么内容 */
  description: string;
}

export interface Skill {
  /** 唯一标识 */
  id: string;
  /** 1. Skill 名称 */
  name: string;
  /** 2. Skill 描述 */
  description: string;
  /** 3. 使用场景 */
  scenarios: string[];
  /** 标签（用于资产检索） */
  tags: string[];
  /** 版本号 */
  version: string;
  /** 4. 输入数据定义 */
  inputSchema: {
    fields: InputField[];
  };
  /** 5. 分析流程（专家方法论，Skill 的核心价值） */
  analysisFlow: AnalysisStep[];
  /** 6. Agent Prompt（执行该 Skill 的 AI 员工的系统提示词） */
  agentPrompt: string;
  /** 7. 输出结果模板 */
  outputTemplate: {
    sections: OutputSection[];
  };
  /** 创建时间 */
  createdAt: string;
}

export type GenerateSource = "llm" | "mock";

export interface GenerateResult {
  skill: Skill;
  source: GenerateSource;
  note?: string;
}

export interface ExecuteResult {
  result: string;
  source: GenerateSource;
  note?: string;
}
