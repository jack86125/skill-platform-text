import { NextResponse } from "next/server";
import { executeSkill, normalizeSkill } from "@/lib/skillEngine";
import type { Skill } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { skill?: unknown; inputData?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
  }

  if (!body.skill || typeof body.skill !== "object") {
    return NextResponse.json({ error: "缺少有效的 Skill 定义" }, { status: 400 });
  }

  let skill: Skill;
  try {
    skill = normalizeSkill(body.skill, "");
  } catch (e) {
    return NextResponse.json(
      { error: `Skill 定义不合法：${e instanceof Error ? e.message : "未知错误"}` },
      { status: 400 }
    );
  }

  const result = await executeSkill(skill, body.inputData ?? {});
  return NextResponse.json(result);
}
