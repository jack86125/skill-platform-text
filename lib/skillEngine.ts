/**
 * Skill 引擎：Skill 的生成、归一化校验、执行。
 * 生成/执行优先走真实 LLM，失败或无 Key 时回退到 Mock，保证闭环可用。
 */
import type {
  AnalysisStep,
  GenerateResult,
  ExecuteResult,
  InputField,
  OutputSection,
  Skill,
} from "./types";
import { chat, extractJSON, hasLLM } from "./llm";
import { GENERATE_SYSTEM_PROMPT, EXECUTE_SYSTEM_PROMPT, buildExecuteUserMessage } from "./prompts";
import { mockGenerateSkill, mockExecuteSkill } from "./mock";

function asString(v: unknown): string {
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean);
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return null;
}

/** 从需求文本推导一个兜底名称 */
function deriveName(requirement: string): string {
  const cleaned = requirement
    .replace(/[帮我创建一下个请,，。.!！?？\s]/g, "")
    .replace(/\bskill\b/gi, "")
    .trim();
  return cleaned ? `${cleaned.slice(0, 24)} Skill` : "企业分析 Skill";
}

/**
 * 归一化与校验 LLM 生成的 Skill：
 * - 补齐缺失字段
 * - 修正类型
 * - 保证结构合法（这是"避免 AI 生成错误 Skill"的工程兜底之一）
 */
export function normalizeSkill(
  raw: unknown,
  requirement: string
): Skill {
  const r = (raw ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  // 解析输入字段
  const fields: InputField[] = [];
  const rawFields = (
    (r.inputSchema as Record<string, unknown> | undefined)?.fields ??
    r.fields ??
    []
  ) as unknown[];
  if (Array.isArray(rawFields)) {
    for (const f of rawFields) {
      const fo = (f ?? {}) as Record<string, unknown>;
      const name = asString(fo.name);
      if (!name) continue;
      fields.push({
        name,
        type: asString(fo.type) || "string",
        description: asString(fo.description) || name,
        required: fo.required !== false,
      });
    }
  }

  // 解析分析流程
  const analysisFlow: AnalysisStep[] = [];
  const rawFlow = (r.analysisFlow ?? []) as unknown[];
  if (Array.isArray(rawFlow)) {
    rawFlow.forEach((s, i) => {
      const so = (s ?? {}) as Record<string, unknown>;
      analysisFlow.push({
        step: asNumber(so.step) ?? i + 1,
        name: asString(so.name) || `步骤 ${i + 1}`,
        action: asString(so.action) || asString(so.description) || "",
        method: asString(so.method) || "",
      });
    });
  }

  // 解析输出模板
  const sections: OutputSection[] = [];
  const rawSections = (
    (r.outputTemplate as Record<string, unknown> | undefined)?.sections ??
    r.sections ??
    []
  ) as unknown[];
  if (Array.isArray(rawSections)) {
    for (const s of rawSections) {
      const so = (s ?? {}) as Record<string, unknown>;
      const name = asString(so.name);
      if (!name) continue;
      sections.push({
        name,
        description: asString(so.description) || name,
      });
    }
  }

  const name = asString(r.name) || deriveName(requirement);

  return {
    id:
      asString(r.id) ||
      `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description: asString(r.description) || `${name} 的企业经营分析能力`,
    scenarios: asStringArray(r.scenarios),
    tags: asStringArray(r.tags),
    version: asString(r.version) || "1.0.0",
    inputSchema: { fields },
    analysisFlow,
    agentPrompt:
      asString(r.agentPrompt) ||
      `你是负责「${name}」的资深分析师，数据驱动、客观中立、建议可落地；数据不足时明确标注，禁止编造数据。`,
    outputTemplate: { sections },
    createdAt: now,
  };
}

/** 生成 Skill：优先真实 LLM，失败回退 Mock */
export async function generateSkill(
  requirement: string
): Promise<GenerateResult> {
  if (!hasLLM()) {
    return {
      skill: mockGenerateSkill(requirement),
      source: "mock",
      note: "未配置 DeepSeek API Key，已使用内置示例 Skill（Mock 模式）",
    };
  }

  try {
    const content = await chat(
      [
        { role: "system", content: GENERATE_SYSTEM_PROMPT },
        { role: "user", content: `请帮我创建以下 Skill：\n${requirement}` },
      ],
      { json: true, temperature: 0.3 }
    );
    const raw = extractJSON(content);
    const skill = normalizeSkill(raw, requirement);

    // 生成质量兜底：如果核心字段缺失严重，视为失败并回退 Mock
    if (skill.analysisFlow.length === 0 || skill.outputTemplate.sections.length === 0) {
      throw new Error("SKILL_QUALITY_LOW");
    }

    return { skill, source: "llm" };
  } catch (e) {
    console.error("[generateSkill] LLM 调用失败，回退 Mock：", e);
    return {
      skill: mockGenerateSkill(requirement),
      source: "mock",
      note: `LLM 生成失败（${e instanceof Error ? e.message : "未知错误"}），已回退 Mock 示例`,
    };
  }
}

/** 执行 Skill：优先真实 LLM，失败回退 Mock */
export async function executeSkill(
  skill: Skill,
  inputData: unknown
): Promise<ExecuteResult> {
  if (!hasLLM()) {
    return {
      result: mockExecuteSkill(skill, inputData),
      source: "mock",
      note: "未配置 DeepSeek API Key，已使用内置分析结果（Mock 模式）",
    };
  }

  try {
    const content = await chat(
      [
        { role: "system", content: EXECUTE_SYSTEM_PROMPT },
        { role: "user", content: buildExecuteUserMessage(skill, inputData) },
      ],
      { temperature: 0.4, maxTokens: 4000 }
    );
    if (!content || content.trim().length < 20) {
      throw new Error("EXECUTE_EMPTY");
    }
    return { result: content, source: "llm" };
  } catch (e) {
    console.error("[executeSkill] LLM 调用失败，回退 Mock：", e);
    return {
      result: mockExecuteSkill(skill, inputData),
      source: "mock",
      note: `LLM 执行失败（${e instanceof Error ? e.message : "未知错误"}），已回退 Mock 结果`,
    };
  }
}
