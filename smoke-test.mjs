// 冒烟测试脚本：用 UTF-8 正确验证完整闭环
// 运行：node smoke-test.mjs （需先启动服务：pnpm dev 或 pnpm start）
const BASE = "http://localhost:3000";

async function main() {
  console.log("=== 1) GET /api/meta ===");
  const meta = await (await fetch(`${BASE}/api/meta`)).json();
  console.log(JSON.stringify(meta));

  console.log("\n=== 2) POST /api/generate ===");
  const genRes = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirement: "帮我创建一个抖音直播运营复盘 Skill" }),
  });
  const gen = await genRes.json();
  console.log(
    `source=${gen.source}  name=${gen.skill.name}  flowSteps=${gen.skill.analysisFlow.length}  sections=${gen.skill.outputTemplate.sections.length}  inputFields=${gen.skill.inputSchema.fields.length}`
  );

  console.log("\n=== 3) POST /api/execute ===");
  const execRes = await fetch(`${BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill: gen.skill, inputData: {} }),
  });
  const exec = await execRes.json();
  console.log(`source=${exec.source}  resultLength=${exec.result.length}`);
  console.log(`preview: ${exec.result.slice(0, 90).replace(/\n/g, " ")}...`);

  console.log("\n=== 4) GET /api/skills ===");
  const skills = await (await fetch(`${BASE}/api/skills`)).json();
  console.log(`count=${skills.skills.length}  first=${skills.skills[0].name}`);

  console.log("\n=== 5) 校验结果是否覆盖输出模板的 6 个章节 ===");
  const sections = gen.skill.outputTemplate.sections.map((s) => s.name);
  for (const sec of sections) {
    const found = exec.result.includes(sec.replace(/^[一二三四五六七八九十]+、/, ""));
    console.log(`${found ? "✓" : "✗"} ${sec}`);
  }

  console.log("\nDONE");
}

main().catch((e) => {
  console.error("测试失败：", e.message);
  process.exit(1);
});
