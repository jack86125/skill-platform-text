"use client";

import React, { type ReactNode } from "react";

/** 行内文本：解析 **加粗** 与 `行内代码` */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * 轻量 Markdown 渲染器：支持标题、表格、列表、引用、分隔线、段落、加粗、行内代码。
 * 仅覆盖本平台输出报告的常见结构，足够演示，无需额外依赖。
 */
export default function Markdown({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listOrdered = false;
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    nodes.push(
      listOrdered ? (
        <ol key={`ol-${key++}`}>{items}</ol>
      ) : (
        <ul key={`ul-${key++}`}>{items}</ul>
      )
    );
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t === "") {
      flushList();
      i++;
      continue;
    }

    // 表格
    if (
      t.startsWith("|") &&
      i + 1 < lines.length &&
      /^\|[\s:\-|]+\|$/.test(lines[i + 1].trim())
    ) {
      flushList();
      const header = t
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim());
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        rows.push(
          lines[j]
            .trim()
            .split("|")
            .slice(1, -1)
            .map((s) => s.trim())
        );
        j++;
      }
      nodes.push(
        <div className="table-wrap" key={`t-${key++}`}>
          <table>
            <thead>
              <tr>
                {header.map((h, hi) => (
                  <th key={hi}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci}>{renderInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = j;
      continue;
    }

    // 标题
    const heading = t.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      if (level === 1) nodes.push(<h2 key={`h-${key++}`}>{content}</h2>);
      else if (level === 2) nodes.push(<h3 key={`h-${key++}`}>{content}</h3>);
      else if (level === 3) nodes.push(<h4 key={`h-${key++}`}>{content}</h4>);
      else nodes.push(<h5 key={`h-${key++}`}>{content}</h5>);
      i++;
      continue;
    }

    // 列表
    const ul = t.match(/^[-*+]\s+(.*)$/);
    const ol = t.match(/^\d+[.、)]\s+(.*)$/);
    if (ul || ol) {
      const isOrdered = !!ol;
      const text = (ul ? ul[1] : ol![1]).trim();
      if (listItems.length === 0) {
        listOrdered = isOrdered;
      } else if (listOrdered !== isOrdered) {
        flushList();
        listOrdered = isOrdered;
      }
      listItems.push(<li key={`li-${key++}`}>{renderInline(text)}</li>);
      i++;
      continue;
    }

    // 引用
    if (t.startsWith(">")) {
      flushList();
      nodes.push(
        <blockquote key={`bq-${key++}`}>
          {renderInline(t.replace(/^>\s?/, ""))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 分隔线
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flushList();
      nodes.push(<hr key={`hr-${key++}`} />);
      i++;
      continue;
    }

    // 段落
    flushList();
    nodes.push(<p key={`p-${key++}`}>{renderInline(t)}</p>);
    i++;
  }
  flushList();

  return <div className="markdown">{nodes}</div>;
}
