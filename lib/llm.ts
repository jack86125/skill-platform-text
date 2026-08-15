/**
 * DeepSeek LLM 客户端（OpenAI 兼容接口）+ JSON 解析工具。
 * 无 Key 或调用失败时，由上层捕获异常并回退到 Mock 模式。
 */

const BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export function hasLLM(): boolean {
  return API_KEY.trim().length > 0;
}

export function llmConfig(): { model: string; baseUrl: string } {
  return { model: MODEL, baseUrl: BASE_URL };
}

interface ChatOptions {
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 调用 DeepSeek Chat Completions，返回首个 choice 的文本内容。
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  if (!hasLLM()) {
    throw new Error("NO_API_KEY");
  }

  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: options.temperature ?? 0.3,
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    ...(options.json ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM_API_ERROR ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM_EMPTY_RESPONSE");
  }
  return content;
}

/**
 * 从 LLM 返回的文本中稳健地提取 JSON 对象。
 * 兼容 `` ```json ... ``` `` 代码块包裹、前后多余文本等情况。
 */
export function extractJSON(text: string): Record<string, unknown> {
  const trimmed = text.trim();

  // 1) 去掉 markdown 代码块
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;

  // 2) 直接解析
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    /* 继续尝试 */
  }

  // 3) 截取第一个 { 到最后一个 } 之间的内容
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<
        string,
        unknown
      >;
    } catch {
      /* 继续抛出 */
    }
  }

  throw new Error("JSON_PARSE_FAILED");
}
