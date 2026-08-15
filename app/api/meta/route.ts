import { NextResponse } from "next/server";
import { hasLLM, llmConfig } from "@/lib/llm";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ hasLLM: hasLLM(), model: llmConfig().model });
}
