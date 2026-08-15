"use client";

import { useEffect, useMemo, useState } from "react";
import type { Skill } from "@/lib/types";
import { getSampleData } from "@/lib/mock";
import Markdown from "@/components/Markdown";
import SkillConfig from "@/components/SkillConfig";

type Source = "llm" | "mock" | null;

const PRESETS = [
  "帮我创建一个抖音直播运营复盘 Skill",
  "帮我创建一个销售经营分析 Skill",
  "帮我创建一个用户增长分析 Skill",
  "帮我创建一个零售门店分析 Skill",
];

const STEPS = [
  { n: 1, label: "输入需求" },
  { n: 2, label: "生成配置" },
  { n: 3, label: "执行任务" },
  { n: 4, label: "输出结果" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [requirement, setRequirement] = useState(PRESETS[0]);
  const [generating, setGenerating] = useState(false);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [genSource, setGenSource] = useState<Source>(null);
  const [genNote, setGenNote] = useState<string | null>(null);

  const [inputText, setInputText] = useState(() =>
    JSON.stringify(getSampleData(PRESETS[0]), null, 2)
  );
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [execSource, setExecSource] = useState<Source>(null);
  const [execNote, setExecNote] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<Skill[]>([]);
  const [meta, setMeta] = useState<{ hasLLM: boolean; model: string } | null>(null);

  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => {});
    fetch("/api/skills")
      .then((r) => r.json())
      .then((d) => setLibrary(d.skills ?? []))
      .catch(() => {});
  }, []);

  const currentStep = useMemo(() => {
    if (!skill) return 1;
    if (!result) return 3;
    return 4;
  }, [skill, result]);

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      setError("请输入自然语言需求");
      return;
    }
    setGenerating(true);
    setError(null);
    setResult(null);
    setExecNote(null);
    setExecSource(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        return;
      }
      setSkill(data.skill);
      setGenSource(data.source);
      setGenNote(data.note || null);
      setInputText(
        JSON.stringify(data.sampleData ?? getSampleData(requirement), null, 2)
      );
      setTimeout(() => scrollTo("step2"), 60);
    } catch (e) {
      setError(`生成请求失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleExecute = async (targetSkill?: Skill) => {
    const s = targetSkill ?? skill;
    if (!s) {
      setError("请先生成或选择一个 Skill");
      return;
    }
    let inputData: unknown;
    try {
      inputData = JSON.parse(inputText);
    } catch {
      setError("输入数据不是合法 JSON，请检查后再执行");
      return;
    }
    setExecuting(true);
    setError(null);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: s, inputData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "执行失败");
        return;
      }
      setResult(data.result);
      setExecSource(data.source);
      setExecNote(data.note || null);
      setTimeout(() => scrollTo("step4"), 60);
    } catch (e) {
      setError(`执行请求失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setExecuting(false);
    }
  };

  const useLibrarySkill = (s: Skill) => {
    setSkill(s);
    setGenSource(null);
    setGenNote("已从资产库加载");
    setResult(null);
    setExecSource(null);
    setExecNote(null);
    setTimeout(() => scrollTo("step2"), 60);
  };

  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <span className="logo">⚡</span>
          <div>
            <h1>企业岗位经验 Skill 生成平台</h1>
            <p>
              自然语言 → 可执行 Skill → 分析结果 · 让业务人员无需代码创建 AI 员工能力
            </p>
          </div>
        </div>
        {meta ? (
          <span className={`mode-badge ${meta.hasLLM ? "llm" : "mock"}`}>
            {meta.hasLLM ? `● DeepSeek 已接入（${meta.model}）` : "● Mock 模式（未配置 Key）"}
          </span>
        ) : (
          <span className="mode-badge mock">连接中…</span>
        )}
      </header>

      <div className="stepper">
        {STEPS.map((s) => {
          const cls =
            s.n === currentStep ? "active" : s.n < currentStep ? "done" : "";
          return (
            <div key={s.n} className={`step ${cls}`}>
              <span className="dot">{s.n < currentStep ? "✓" : s.n}</span>
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      <section className="panel" id="step1">
        <h2>① 输入需求</h2>
        <p className="hint">用自然语言描述你想创建的岗位 Skill，系统自动生成 7 大组成</p>
        <div className="presets">
          {PRESETS.map((p) => (
            <button key={p} type="button" className="preset" onClick={() => setRequirement(p)}>
              {p}
            </button>
          ))}
        </div>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="例如：帮我创建一个抖音直播运营复盘 Skill"
        />
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating && <span className="spinner" />}
            {generating ? "生成中…" : "生成 Skill"}
          </button>
        </div>
        {error && <div className="notice error">{error}</div>}
        {genSource && (
          <div className={`notice ${genSource === "mock" ? "mock" : ""}`} style={genSource === "llm" ? { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" } : undefined}>
            {genSource === "llm"
              ? "✓ 已由 DeepSeek 生成结构化 Skill，已自动注册进资产库"
              : `⚠ ${genNote || "Mock 模式生成"}`}
          </div>
        )}
      </section>

      {/* Step 2 */}
      {skill && (
        <section className="panel" id="step2">
          <h2>② Skill 配置</h2>
          <p className="hint">查看并核对自动生成的 Skill，可切换到 JSON 查看完整定义</p>
          <SkillConfig skill={skill} />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => handleExecute()} disabled={executing}>
              使用此 Skill 执行任务 ↓
            </button>
          </div>
        </section>
      )}

      {/* Step 3 */}
      <section className="panel" id="step3">
        <h2>③ 输入业务数据</h2>
        <p className="hint">
          填写/粘贴 Skill 输入数据（Demo 内置了示例电商经营数据，可直接执行）
        </p>
        <textarea
          className="code"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={() => handleExecute()}
            disabled={!skill || executing}
          >
            {executing && <span className="spinner" />}
            {executing ? "执行分析中…" : "执行分析"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setInputText(JSON.stringify(getSampleData(requirement), null, 2))}
          >
            重置为示例数据
          </button>
        </div>
        {error && <div className="notice error">{error}</div>}
        {execSource && (
          <div className={`notice ${execSource === "mock" ? "mock" : ""}`} style={execSource === "llm" ? { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" } : undefined}>
            {execSource === "llm" ? "✓ 已由 DeepSeek 按 Skill 定义执行" : `⚠ ${execNote || "Mock 模式执行"}`}
          </div>
        )}
      </section>

      {/* Step 4 */}
      {result && (
        <section className="panel" id="step4">
          <h2>④ 分析结果</h2>
          <p className="hint">由 AI 员工按 Skill 的分析流程与输出模板生成</p>
          <Markdown text={result} />
        </section>
      )}

      {/* Skill 资产库 */}
      <section className="panel">
        <h2>Skill 资产库</h2>
        <p className="hint">演示 Skill 资产管理：注册、列表、复用（生产环境详见 技术方案.md）</p>
        <div className="library">
          {library.length === 0 && <p className="hint">暂无 Skill，先生成一个吧</p>}
          {library.map((s) => (
            <div className="library-item" key={s.id}>
              <div>
                <div className="li-title">{s.name}</div>
                <div className="li-desc">{s.description}</div>
              </div>
              <button className="btn btn-secondary" onClick={() => useLibrarySkill(s)}>
                加载并执行
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
