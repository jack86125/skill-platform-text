"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";

function CardView({ skill }: { skill: Skill }) {
  return (
    <div className="skill-card">
      <div className="skill-card__head">
        <div>
          <div className="skill-card__title">
            {skill.name}
            <span className="version">v{skill.version}</span>
          </div>
          <p className="skill-card__desc">{skill.description}</p>
        </div>
        <div className="tags">
          {skill.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="skill-card__section">
        <h4>使用场景</h4>
        <ul className="chips">
          {skill.scenarios.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="skill-card__section">
        <h4>输入数据定义</h4>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>字段</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {skill.inputSchema.fields.map((f) => (
                <tr key={f.name}>
                  <td>
                    <code>{f.name}</code>
                  </td>
                  <td>{f.type}</td>
                  <td>{f.required ? "是" : "否"}</td>
                  <td>{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="skill-card__section">
        <h4>分析流程（专家方法论）</h4>
        <ol className="flow">
          {skill.analysisFlow.map((s) => (
            <li key={s.step}>
              <div className="flow__step">
                <span className="flow__num">{s.step}</span>
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.action}</p>
                  <span className="flow__method">方法：{s.method}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="skill-card__section">
        <h4>Agent Prompt</h4>
        <pre className="prompt">{skill.agentPrompt}</pre>
      </div>

      <div className="skill-card__section">
        <h4>输出结果模板</h4>
        <ol className="outline">
          {skill.outputTemplate.sections.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong>
              <span>{s.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function SkillConfig({ skill }: { skill: Skill }) {
  const [tab, setTab] = useState<"card" | "json">("card");
  return (
    <div className="skill-config">
      <div className="tabs">
        <button
          type="button"
          className={tab === "card" ? "tab active" : "tab"}
          onClick={() => setTab("card")}
        >
          卡片视图
        </button>
        <button
          type="button"
          className={tab === "json" ? "tab active" : "tab"}
          onClick={() => setTab("json")}
        >
          JSON 配置
        </button>
      </div>
      {tab === "card" ? (
        <CardView skill={skill} />
      ) : (
        <pre className="json-view">{JSON.stringify(skill, null, 2)}</pre>
      )}
    </div>
  );
}
