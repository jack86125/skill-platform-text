import { NextResponse } from "next/server";
import { listSkills, addSkill } from "@/lib/skillStore";
import { normalizeSkill } from "@/lib/skillEngine";

export const runtime = "nodejs";

/** 列出资产库中的 Skill */
export async function GET() {
  return NextResponse.json({ skills: listSkills() });
}

/** 手动注册一个 Skill（用于资产库管理演示） */
export async function POST(request: Request) {
  let body: { skill?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
  }

  if (!body.skill || typeof body.skill !== "object") {
    return NextResponse.json({ error: "缺少有效的 Skill 定义" }, { status: 400 });
  }

  const skill = normalizeSkill(body.skill, "");
  addSkill(skill);
  return NextResponse.json({ skill }, { status: 201 });
}
