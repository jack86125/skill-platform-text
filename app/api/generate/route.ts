import { NextResponse } from "next/server";
import { generateSkill } from "@/lib/skillEngine";
import { addSkill } from "@/lib/skillStore";
import { getSampleData } from "@/lib/mock";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { requirement?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
  }

  const requirement = (body.requirement ?? "").trim();
  if (!requirement) {
    return NextResponse.json({ error: "请输入自然语言需求" }, { status: 400 });
  }

  const result = await generateSkill(requirement);

  // 生成成功后注册进资产库
  try {
    addSkill(result.skill);
  } catch {
    /* 注册失败不影响主流程 */
  }

  // 附上匹配的示例输入数据，方便前端预填「③ 输入业务数据」
  return NextResponse.json({ ...result, sampleData: getSampleData(requirement) });
}
