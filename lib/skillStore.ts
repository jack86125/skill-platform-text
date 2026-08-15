/**
 * Skill 资产存储（Demo 版）：内存注册中心。
 * 演示「Skill 资产管理」的最小闭环：注册、列表、检索。
 * 生产环境应替换为数据库 + 版本管理 + 权限（详见 技术方案.md）。
 */
import type { Skill } from "./types";
import { SCENARIOS } from "./mock";

/** 内置 4 个场景的示例 Skill 作为初始资产 */
const store: Skill[] = SCENARIOS.map((s) => s.skill);

export function listSkills(): Skill[] {
  return store;
}

export function addSkill(skill: Skill): Skill {
  store.unshift(skill);
  return skill;
}
