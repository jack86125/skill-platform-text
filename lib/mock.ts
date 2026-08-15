/**
 * Mock 模式：在没有 API Key、断网或 LLM 调用失败时，用内置的高质量示例
 * 保证「自然语言输入 → Skill 生成 → 配置展示 → 执行 → 结果」闭环始终可跑。
 *
 * 覆盖 4 个常见岗位场景（电商/销售/增长/门店），仅用于离线兜底演示；
 * 真实 LLM 模式下，输入什么需求就动态生成什么 Skill，无需预置。
 */
import type { Skill } from "./types";

export interface Scenario {
  /** 用于把自然语言需求路由到对应场景的关键词 */
  keywords: RegExp;
  skill: Skill;
  sampleData: Record<string, unknown>;
  report: (input: unknown) => string;
}

/* =====================================================================
 * 场景 1：电商运营分析 AI 员工 —— 抖音直播运营复盘 Skill
 * ===================================================================== */
const ecommerceSkill: Skill = {
  id: "skill-ecommerce-live-review",
  name: "抖音直播运营复盘 Skill",
  description:
    "对抖音直播间一段时期内的运营表现进行系统性复盘，识别增长机会与问题，并输出可执行的优化建议。",
  scenarios: [
    "每周/每月的抖音直播间运营复盘",
    "大促活动（618/双11）直播效果复盘",
    "直播间改版或换品后的效果评估",
  ],
  tags: ["电商运营", "抖音直播", "经营分析", "复盘"],
  version: "1.0.0",
  inputSchema: {
    fields: [
      { name: "reportPeriod", type: "string", description: "复盘周期", required: true },
      { name: "liveSessions", type: "number", description: "直播场次", required: true },
      { name: "totalGMV", type: "number", description: "总成交额（万元）", required: true },
      { name: "totalViews", type: "number", description: "总观看人次", required: true },
      { name: "totalOrders", type: "number", description: "总订单数", required: true },
      { name: "conversionRate", type: "number", description: "整体转化率（%）", required: true },
      { name: "avgStaySeconds", type: "number", description: "平均停留时长（秒）", required: true },
      { name: "avgUVValue", type: "number", description: "平均 UV 价值（元）", required: false },
      { name: "trafficSources", type: "array", description: "流量渠道及占比、GMV", required: true },
      { name: "topProducts", type: "array", description: "Top 商品 GMV/订单/退款率", required: true },
    ],
  },
  analysisFlow: [
    { step: 1, name: "核心指标总览", action: "汇总核心指标并与目标/历史对比", method: "同比/环比 + 目标达成率" },
    { step: 2, name: "流量结构分析", action: "拆解各流量渠道占比与 GMV 贡献", method: "流量来源结构 + 渠道贡献对比" },
    { step: 3, name: "商品维度分析", action: "分析 Top 商品表现与退款率", method: "帕累托分析 + 退款率异常识别" },
    { step: 4, name: "转化漏斗诊断", action: "定位观看→停留→转化瓶颈", method: "漏斗分析 + 停留/转化相关性" },
    { step: 5, name: "问题与机会识别", action: "归纳 2~4 个核心问题与机会", method: "根因分析 + 影响面评估" },
    { step: 6, name: "优化建议输出", action: "给出可落地的优化动作", method: "行动清单 + 预期收益" },
  ],
  agentPrompt:
    "你是一名资深的抖音电商直播运营分析师，拥有 5 年以上直播运营复盘经验。基于给定的直播数据输出专业、客观、可执行的运营复盘报告。\n专业原则：1. 数据驱动，禁止编造数据；2. 客观中立；3. 建议可落地；4. 口径一致（转化率=订单/观看，UV价值=GMV/UV）；5. 数据不足时明确标注。",
  outputTemplate: {
    sections: [
      { name: "一、核心指标概览", description: "核心指标及总体判断" },
      { name: "二、流量结构分析", description: "各渠道占比与 GMV 贡献" },
      { name: "三、商品表现分析", description: "Top 商品与问题商品" },
      { name: "四、转化漏斗诊断", description: "观看→停留→转化瓶颈" },
      { name: "五、核心问题与机会", description: "按优先级排序的问题/机会" },
      { name: "六、优化建议", description: "可量化的优化动作清单" },
    ],
  },
  createdAt: "2025-06-30T10:00:00.000Z",
};

const ecommerceData = {
  reportPeriod: "2025-06-01 ~ 2025-06-30",
  liveSessions: 30,
  totalGMV: 128.5,
  totalViews: 862340,
  totalOrders: 15624,
  conversionRate: 1.81,
  avgStaySeconds: 96,
  avgUVValue: 1.49,
  trafficSources: [
    { channel: "自然推荐", share: 38, gmv: 48.8 },
    { channel: "付费投流", share: 32, gmv: 41.1 },
    { channel: "关注页", share: 18, gmv: 23.1 },
    { channel: "搜索", share: 8, gmv: 10.3 },
    { channel: "其他", share: 4, gmv: 5.2 },
  ],
  topProducts: [
    { name: "A 品牌面膜", gmv: 32.1, orders: 4120, refundRate: 6.2 },
    { name: "B 精华液", gmv: 26.8, orders: 2980, refundRate: 8.5 },
    { name: "C 卸妆油", gmv: 18.9, orders: 2400, refundRate: 4.1 },
    { name: "D 防晒霜", gmv: 15.6, orders: 2100, refundRate: 11.3 },
    { name: "E 洗面奶", gmv: 12.4, orders: 1890, refundRate: 3.8 },
  ],
};

function ecommerceReport(input: unknown): string {
  const d = { ...ecommerceData, ...((input as object) ?? {}) } as typeof ecommerceData;
  const sessions = d.liveSessions || 0;
  const gmv = d.totalGMV ?? 0;
  const views = d.totalViews ?? 0;
  const orders = d.totalOrders ?? 0;
  const conv = d.conversionRate ?? 0;
  const stay = d.avgStaySeconds ?? 0;
  const uv = d.avgUVValue ?? 0;
  const traffic = Array.isArray(d.trafficSources) && d.trafficSources.length ? d.trafficSources : ecommerceData.trafficSources;
  const products = Array.isArray(d.topProducts) && d.topProducts.length ? d.topProducts : ecommerceData.topProducts;
  const topTraffic = [...traffic].sort((a, b) => b.gmv - a.gmv)[0];
  const topProduct = [...products].sort((a, b) => b.gmv - a.gmv)[0];
  const worstRefund = [...products].sort((a, b) => b.refundRate - a.refundRate)[0];
  const topGmvShare = gmv ? (((topProduct?.gmv ?? 0) / gmv) * 100).toFixed(1) : "0";
  const paid = traffic.find((t) => t.channel === "付费投流")?.share ?? 0;

  const trafficRows = traffic
    .map((t) => `| ${t.channel} | ${t.share}% | ${t.gmv} 万元 | ${((t.gmv / (gmv || 1)) * 100).toFixed(1)}% |`)
    .join("\n");
  const productRows = products
    .map((p) => `| ${p.name} | ${p.gmv} 万元 | ${p.orders} | ${p.refundRate}% |`)
    .join("\n");

  return `# 抖音直播运营复盘报告

**复盘周期**：${d.reportPeriod} ｜ **直播场次**：${sessions} 场

## 一、核心指标概览

| 指标 | 数值 | 参考判断 |
| --- | --- | --- |
| 总 GMV | ${gmv} 万元 | 场均 ${sessions ? (gmv / sessions).toFixed(2) : 0} 万元 |
| 总观看人次 | ${views.toLocaleString()} | 场均 ${Math.round(views / (sessions || 1)).toLocaleString()} 人 |
| 总订单数 | ${orders.toLocaleString()} | 场均 ${sessions ? Math.round(orders / sessions) : 0} 单 |
| 整体转化率 | ${conv}% | ${conv >= 1.5 ? "处于行业中等偏上水平" : "低于 1.5% 基准，需重点优化"} |
| 平均停留时长 | ${stay} 秒 | ${stay >= 90 ? "用户粘性较好" : "停留偏短，内容吸引力不足"} |
| 平均 UV 价值 | ${uv} 元 | 流量质量衡量基准 |

**总体判断**：本期整体经营${conv >= 1.5 ? "基本健康" : "承压"}，主要贡献来自「${topTraffic?.channel}」渠道与「${topProduct?.name}」单品。

## 二、流量结构分析

| 渠道 | 流量占比 | GMV 贡献 | GMV 占比 |
| --- | --- | --- | --- |
${trafficRows}

**结论**：${topTraffic?.channel} 是主要 GMV 来源（${topTraffic?.gmv} 万元）。付费投流占比 ${paid}%，需关注获客成本。

## 三、商品表现分析

| 商品 | GMV | 订单 | 退款率 |
| --- | --- | --- | --- |
${productRows}

**结论**：${topProduct?.name} 是绝对主力（GMV 占比 ${topGmvShare}%）。「${worstRefund?.name}」退款率 ${worstRefund?.refundRate}% 已超 8% 预警线，需重点排查。

## 四、转化漏斗诊断

- **观看 → 停留**：平均 ${stay} 秒，${stay >= 90 ? "内容钩子与话术有效" : "建议优化开场钩子与讲解节奏"}。
- **停留 → 下单**：转化率 ${conv}%，${conv >= 1.5 ? "转化链路通畅" : "转化偏弱，需优化选品与逼单话术"}。
- **瓶颈判断**：${conv >= 1.5 ? "瓶颈在流量质量与退款环节" : "瓶颈在停留到下单的转化环节"}。

## 五、核心问题与机会

1. 【高优先级】「${worstRefund?.name}」退款率 ${worstRefund?.refundRate}% 偏高。
2. 【高优先级】付费投流占比 ${paid}%，获客成本承压。
3. 【机会点】「${topProduct?.name}」已验证为爆款，可放大规模。
4. 【机会点】自然推荐渠道仍有提升空间。

## 六、优化建议

| 动作 | 具体措施 | 预期收益 |
| --- | --- | --- |
| 降低退款 | 优化「${worstRefund?.name}」话术与售前质检 | 退款率降至 8% 以内 |
| 优化流量结构 | 提升自然推荐占比 5~10 个百分点 | 降低获客成本约 10% |
| 放大爆款 | 「${topProduct?.name}」每周加 2~3 场专场 | GMV 环比 +10%~15% |
| 提升转化 | 优化开场钩子与逼单节奏 | 同等流量下订单 +10% |

> 说明：结论基于输入数据计算；缺历史同期数据时，同比/环比为「数据不足，无法判断」。`;
}

/* =====================================================================
 * 场景 2：销售经营分析 AI 员工 —— 销售业绩诊断 Skill
 * ===================================================================== */
const salesSkill: Skill = {
  id: "skill-sales-performance",
  name: "销售业绩诊断 Skill",
  description:
    "对销售团队一段时期的业绩达成、销售漏斗转化、产品与人员效能进行诊断，定位增长瓶颈并输出改进建议。",
  scenarios: ["月度/季度销售业绩复盘", "销售漏斗健康度诊断", "销售目标缺口归因分析"],
  tags: ["销售经营", "业绩分析", "漏斗诊断", "归因"],
  version: "1.0.0",
  inputSchema: {
    fields: [
      { name: "reportPeriod", type: "string", description: "统计周期", required: true },
      { name: "salesTarget", type: "number", description: "销售目标（万元）", required: true },
      { name: "actualSales", type: "number", description: "实际销售额（万元）", required: true },
      { name: "pipelineLeads", type: "number", description: "线索总量", required: true },
      { name: "qualifiedLeads", type: "number", description: "合格线索数", required: true },
      { name: "proposals", type: "number", description: "报价/方案数", required: true },
      { name: "closedDeals", type: "number", description: "成交单数", required: true },
      { name: "avgDealSize", type: "number", description: "客单价（万元）", required: false },
      { name: "teamSize", type: "number", description: "销售人数", required: true },
      { name: "productSales", type: "array", description: "各产品线销售额与增速", required: true },
      { name: "repPerformance", type: "array", description: "各销售业绩与目标", required: true },
    ],
  },
  analysisFlow: [
    { step: 1, name: "目标达成总览", action: "计算达成率与缺口金额", method: "达成率=实际/目标" },
    { step: 2, name: "销售漏斗诊断", action: "计算线索→合格→报价→成交各阶段转化率", method: "漏斗转化率 + 环节薄弱定位" },
    { step: 3, name: "产品结构分析", action: "分析各产品线销售额占比与增速", method: "结构占比 + 同比增速" },
    { step: 4, name: "人员效能分析", action: "分析人均产出与业绩分布", method: "人均产值 + 标杆/落后识别" },
    { step: 5, name: "问题与机会识别", action: "归纳核心问题与增长机会", method: "根因分析 + 影响面评估" },
    { step: 6, name: "优化建议输出", action: "给出可落地的改进动作", method: "行动清单 + 预期收益" },
  ],
  agentPrompt:
    "你是一名资深的销售运营分析师，擅长销售漏斗诊断与业绩归因。基于给定数据输出客观、可执行的业绩诊断报告。\n专业原则：1. 数据驱动，禁止编造；2. 漏斗口径一致（转化率=下一阶段数/上一阶段数）；3. 建议可落地；4. 数据不足时明确标注。",
  outputTemplate: {
    sections: [
      { name: "一、目标达成总览", description: "达成率、缺口与总体判断" },
      { name: "二、销售漏斗诊断", description: "各阶段转化率与瓶颈" },
      { name: "三、产品结构分析", description: "产品线占比与增速" },
      { name: "四、人员效能分析", description: "人均产出与业绩分布" },
      { name: "五、核心问题与机会", description: "按优先级排序" },
      { name: "六、优化建议", description: "可量化动作清单" },
    ],
  },
  createdAt: "2025-06-30T10:00:00.000Z",
};

const salesData = {
  reportPeriod: "2025 Q2（2025-04-01 ~ 2025-06-30）",
  salesTarget: 2000,
  actualSales: 1680,
  pipelineLeads: 4800,
  qualifiedLeads: 1560,
  proposals: 620,
  closedDeals: 210,
  avgDealSize: 8.0,
  teamSize: 12,
  productSales: [
    { product: "标准版 SaaS", sales: 720, growth: 12 },
    { product: "专业版 SaaS", sales: 560, growth: 8 },
    { product: "企业版 SaaS", sales: 260, growth: -3 },
    { product: "实施服务", sales: 140, growth: 20 },
  ],
  repPerformance: [
    { rep: "销售A", sales: 210, target: 180 },
    { rep: "销售B", sales: 175, target: 180 },
    { rep: "销售C", sales: 168, target: 180 },
    { rep: "销售D", sales: 142, target: 180 },
    { rep: "销售E", sales: 96, target: 180 },
  ],
};

function salesReport(input: unknown): string {
  const d = { ...salesData, ...((input as object) ?? {}) } as typeof salesData;
  const target = d.salesTarget || 0;
  const actual = d.actualSales || 0;
  const achievement = target ? ((actual / target) * 100).toFixed(1) : "0";
  const gap = Math.max(0, target - actual);
  const leads = d.pipelineLeads || 0;
  const qualified = d.qualifiedLeads || 0;
  const proposals = d.proposals || 0;
  const closed = d.closedDeals || 0;
  const l2q = leads ? ((qualified / leads) * 100).toFixed(1) : "0";
  const q2p = qualified ? ((proposals / qualified) * 100).toFixed(1) : "0";
  const p2c = proposals ? ((closed / proposals) * 100).toFixed(1) : "0";
  const overall = leads ? ((closed / leads) * 100).toFixed(1) : "0";
  const perRep = d.teamSize ? (actual / d.teamSize).toFixed(1) : "0";
  const products = Array.isArray(d.productSales) && d.productSales.length ? d.productSales : salesData.productSales;
  const reps = Array.isArray(d.repPerformance) && d.repPerformance.length ? d.repPerformance : salesData.repPerformance;
  const topProduct = [...products].sort((a, b) => b.sales - a.sales)[0];
  const downProduct = [...products].find((p) => p.growth < 0);
  const topRep = [...reps].sort((a, b) => b.sales - a.sales)[0];
  const bottomRep = [...reps].sort((a, b) => a.sales - b.sales)[0];
  const weakest = +l2q <= +q2p && +l2q <= +p2c ? "线索→合格线索" : +q2p <= +p2c ? "合格线索→报价" : "报价→成交";

  const productRows = products
    .map((p) => `| ${p.product} | ${p.sales} 万元 | ${((p.sales / (actual || 1)) * 100).toFixed(1)}% | ${p.growth > 0 ? "+" : ""}${p.growth}% |`)
    .join("\n");
  const repRows = reps
    .map((r) => `| ${r.rep} | ${r.sales} 万元 | ${r.target} 万元 | ${((r.sales / (r.target || 1)) * 100).toFixed(0)}% |`)
    .join("\n");

  return `# 销售业绩诊断报告

**统计周期**：${d.reportPeriod} ｜ **销售人数**：${d.teamSize} 人

## 一、目标达成总览

| 指标 | 数值 |
| --- | --- |
| 销售目标 | ${target} 万元 |
| 实际销售额 | ${actual} 万元 |
| 目标达成率 | ${achievement}% |
| 缺口金额 | ${gap} 万元 |

**总体判断**：达成率 ${achievement}%${+achievement >= 100 ? "，已超额完成目标" : "，未达目标，缺口 " + gap + " 万元，需在下期补齐"}。

## 二、销售漏斗诊断

| 漏斗环节 | 数量 | 环节转化率 |
| --- | --- | --- |
| 线索总量 | ${leads} | — |
| 合格线索 | ${qualified} | ${l2q}%（线索→合格） |
| 报价/方案 | ${proposals} | ${q2p}%（合格→报价） |
| 成交单数 | ${closed} | ${p2c}%（报价→成交） |
| 整体转化 | ${overall}% | 线索→成交 |

**结论**：整体线索到成交转化率 ${overall}%，最薄弱环节是「${weakest}」，应优先优化。

## 三、产品结构分析

| 产品线 | 销售额 | 占比 | 增速 |
| --- | --- | --- | --- |
${productRows}

**结论**：${topProduct?.product} 是主力（占比 ${((topProduct?.sales ?? 0) / (actual || 1) * 100).toFixed(1)}%）${downProduct ? `；「${downProduct.product}」负增长 ${downProduct.growth}%，需重点关注` : ""}。

## 四、人员效能分析

| 销售 | 业绩 | 目标 | 达成率 |
| --- | --- | --- | --- |
${repRows}

**结论**：人均产出 ${perRep} 万元；标杆为「${topRep?.rep}」（${topRep?.sales} 万元），「${bottomRep?.rep}」达成率最低（${((bottomRep?.sales ?? 0) / (bottomRep?.target || 1) * 100).toFixed(0)}%）。

## 五、核心问题与机会

1. 【高优先级】目标缺口 ${gap} 万元，达成率 ${achievement}%。
2. 【高优先级】「${weakest}」环节转化率偏低。
3. 【机会点】「${topProduct?.product}」高增长，可加大投入。
4. 【机会点】复制「${topRep?.rep}」的打法，提升团队整体效能。

## 六、优化建议

| 动作 | 具体措施 | 预期收益 |
| --- | --- | --- |
| 补缺口 | 提升「${weakest}」转化率 10% | 预计增收 ${(gap * 0.4).toFixed(0)} 万元 |
| 优产品 | 聚焦「${topProduct?.product}」，${
  downProduct ? `处理「${downProduct.product}」负增长` : "维持增长"
} | 产品结构更健康 |
| 提效能 | 复制标杆打法 + 落后人员辅导 | 人均产出 +15% |
| 管漏斗 | 建立周度漏斗复盘机制 | 整体转化 +20% |

> 说明：结论基于输入数据计算；缺历史同期数据时，同比/环比为「数据不足，无法判断」。`;
}

/* =====================================================================
 * 场景 3：用户增长分析 AI 员工 —— 用户增长分析 Skill
 * ===================================================================== */
const growthSkill: Skill = {
  id: "skill-user-growth",
  name: "用户增长分析 Skill",
  description:
    "对产品的用户增长进行系统性分析，覆盖渠道获客、留存、转化，定位增长瓶颈并输出可执行的增长建议。",
  scenarios: ["月度用户增长复盘", "渠道投放 ROI 分析", "留存下降归因分析"],
  tags: ["用户增长", "渠道分析", "留存", "转化"],
  version: "1.0.0",
  inputSchema: {
    fields: [
      { name: "reportPeriod", type: "string", description: "统计周期", required: true },
      { name: "newUsers", type: "number", description: "新增用户数", required: true },
      { name: "dau", type: "number", description: "日活跃用户数", required: true },
      { name: "mau", type: "number", description: "月活跃用户数", required: true },
      { name: "retentionD1", type: "number", description: "次日留存率（%）", required: true },
      { name: "retentionD7", type: "number", description: "7 日留存率（%）", required: true },
      { name: "retentionD30", type: "number", description: "30 日留存率（%）", required: true },
      { name: "payingRate", type: "number", description: "付费转化率（%）", required: true },
      { name: "channels", type: "array", description: "各渠道成本/新增/ROI", required: true },
      { name: "funnel", type: "array", description: "转化漏斗各环节用户数", required: true },
    ],
  },
  analysisFlow: [
    { step: 1, name: "增长总览", action: "汇总新增/DAU/MAU 与增长趋势", method: "规模指标 + 环比" },
    { step: 2, name: "渠道获客分析", action: "分析各渠道成本、获客量与 ROI", method: "渠道 ROI = LTV/获客成本" },
    { step: 3, name: "留存分析", action: "分析 D1/D7/D30 留存与拐点", method: "留存曲线 + 拐点识别" },
    { step: 4, name: "转化漏斗诊断", action: "分析访问→注册→激活→付费转化", method: "漏斗转化率 + 薄弱环节" },
    { step: 5, name: "问题与机会识别", action: "归纳核心问题与增长机会", method: "根因分析 + 影响面评估" },
    { step: 6, name: "增长建议输出", action: "给出可落地的增长动作", method: "行动清单 + 预期收益" },
  ],
  agentPrompt:
    "你是一名资深的用户增长分析师，擅长渠道 ROI、留存与转化漏斗分析。基于给定数据输出客观、可执行的增长分析报告。\n专业原则：1. 数据驱动，禁止编造；2. 留存/转化口径一致；3. 建议可落地；4. 数据不足时明确标注。",
  outputTemplate: {
    sections: [
      { name: "一、增长总览", description: "规模指标与总体判断" },
      { name: "二、渠道获客分析", description: "渠道成本/新增/ROI" },
      { name: "三、留存分析", description: "留存曲线与拐点" },
      { name: "四、转化漏斗诊断", description: "各环节转化率" },
      { name: "五、核心问题与机会", description: "按优先级排序" },
      { name: "六、增长建议", description: "可量化增长动作" },
    ],
  },
  createdAt: "2025-06-30T10:00:00.000Z",
};

const growthData = {
  reportPeriod: "2025-06-01 ~ 2025-06-30",
  newUsers: 86000,
  dau: 92000,
  mau: 520000,
  retentionD1: 42,
  retentionD7: 25,
  retentionD30: 12,
  payingRate: 5.2,
  channels: [
    { channel: "信息流广告", cost: 28, newUsers: 32000, ltv: 42 },
    { channel: "KOL 投放", cost: 16, newUsers: 18000, ltv: 55 },
    { channel: "自然搜索", cost: 0, newUsers: 21000, ltv: 48 },
    { channel: "老带新裂变", cost: 6, newUsers: 15000, ltv: 60 },
  ],
  funnel: [
    { stage: "访问", users: 2400000 },
    { stage: "注册", users: 86000 },
    { stage: "激活", users: 52000 },
    { stage: "付费", users: 4472 },
  ],
};

function growthReport(input: unknown): string {
  const d = { ...growthData, ...((input as object) ?? {}) } as typeof growthData;
  const newUsers = d.newUsers || 0;
  const dau = d.dau || 0;
  const mau = d.mau || 0;
  const r1 = d.retentionD1 ?? 0;
  const r7 = d.retentionD7 ?? 0;
  const r30 = d.retentionD30 ?? 0;
  const paying = d.payingRate ?? 0;
  const channels = Array.isArray(d.channels) && d.channels.length ? d.channels : growthData.channels;
  const funnel = Array.isArray(d.funnel) && d.funnel.length ? d.funnel : growthData.funnel;
  const stickiness = mau ? ((dau / mau) * 100).toFixed(1) : "0";
  const bestChannel = [...channels].sort((a, b) => (b.ltv - b.cost) - (a.ltv - a.cost))[0];
  const worstChannel = [...channels].sort((a, b) => (a.ltv - a.cost) - (b.ltv - b.cost))[0];

  const channelRows = channels
    .map((c) => `| ${c.channel} | ${c.cost} 万元 | ${c.newUsers} | ${c.ltv} 元 | ${((c.ltv / (c.cost || 1)) * (c.cost ? 1 : 1)).toFixed(1)}（${c.cost ? "LTV/成本 " + (c.ltv / c.cost).toFixed(1) : "自然流量"}） |`)
    .join("\n");

  // 漏斗转化率
  const f = funnel.map((s) => s.users);
  const fRows = funnel
    .map((s, i) => {
      const rate = i === 0 ? "—" : `${((s.users / (f[i - 1] || 1)) * 100).toFixed(1)}%`;
      return `| ${s.stage} | ${s.users.toLocaleString()} | ${rate} |`;
    })
    .join("\n");

  return `# 用户增长分析报告

**统计周期**：${d.reportPeriod}

## 一、增长总览

| 指标 | 数值 |
| --- | --- |
| 新增用户 | ${newUsers.toLocaleString()} |
| DAU | ${dau.toLocaleString()} |
| MAU | ${mau.toLocaleString()} |
| DAU/MAU（粘性） | ${stickiness}% |

**总体判断**：新增 ${newUsers.toLocaleString()}，DAU/MAU ${stickiness}%，${+stickiness >= 15 ? "用户粘性良好" : "粘性偏低，需加强留存运营"}。

## 二、渠道获客分析

| 渠道 | 成本 | 新增 | LTV | 效率 |
| --- | --- | --- | --- | --- |
${channelRows}

**结论**：「${bestChannel?.channel}」效率最高（LTV ${bestChannel?.ltv} 元）；「${worstChannel?.channel}」效率最低，建议优化或降投。

## 三、留存分析

| 留存指标 | 数值 | 判断 |
| --- | --- | --- |
| 次日留存 D1 | ${r1}% | ${r1 >= 40 ? "达标" : "偏低"} |
| 7 日留存 D7 | ${r7}% | ${r7 >= 25 ? "达标" : "偏低"} |
| 30 日留存 D30 | ${r30}% | ${r30 >= 10 ? "达标" : "偏低"} |

**结论**：${r1 >= 40 ? "短期留存健康" : "次日留存偏低，需优化首日体验"}；${r30 >= 10 ? "长期留存尚可" : "30 日留存偏低，长期价值承压"}。

## 四、转化漏斗诊断

| 环节 | 用户数 | 环节转化率 |
| --- | --- | --- |
${fRows}

**结论**：付费转化率 ${paying}%，${paying >= 5 ? "处于行业合理区间" : "低于 5% 基准，需优化付费引导"}。

## 五、核心问题与机会

1. 【高优先级】${r1 < 40 ? "次日留存 " + r1 + "% 偏低" : "留存健康，可进一步放大"}。
2. 【高优先级】「${worstChannel?.channel}」渠道 ROI 偏低。
3. 【机会点】「${bestChannel?.channel}」已验证高效，可加大投放。
4. 【机会点】付费转化 ${paying}%，有提升空间。

## 六、增长建议

| 动作 | 具体措施 | 预期收益 |
| --- | --- | --- |
| 提留存 | 优化新用户首日激活引导 | D1 留存 +5pp |
| 优渠道 | 降投「${worstChannel?.channel}」，加投「${bestChannel?.channel}」 | 获客效率 +20% |
| 提付费 | 优化付费转化漏斗与定价 | 付费率 +1pp |
| 促裂变 | 放大老带新裂变机制 | 新增 +15% |

> 说明：结论基于输入数据计算；缺历史同期数据时，趋势对比为「数据不足，无法判断」。`;
}

/* =====================================================================
 * 场景 4：零售门店分析 AI 员工 —— 门店经营诊断 Skill
 * ===================================================================== */
const retailSkill: Skill = {
  id: "skill-retail-store",
  name: "门店经营诊断 Skill",
  description:
    "对零售门店的营收、坪效、客流转化与库存进行诊断，识别低效门店与经营问题并输出改善建议。",
  scenarios: ["月度门店经营复盘", "门店坪效对标分析", "库存与毛利健康度诊断"],
  tags: ["零售门店", "坪效", "库存", "经营诊断"],
  version: "1.0.0",
  inputSchema: {
    fields: [
      { name: "reportPeriod", type: "string", description: "统计周期", required: true },
      { name: "storeCount", type: "number", description: "门店数量", required: true },
      { name: "totalRevenue", type: "number", description: "总营收（万元）", required: true },
      { name: "totalFootTraffic", type: "number", description: "总进店客流", required: true },
      { name: "conversionRate", type: "number", description: "进店转化率（%）", required: true },
      { name: "avgOrderValue", type: "number", description: "客单价（元）", required: true },
      { name: "grossMargin", type: "number", description: "毛利率（%）", required: true },
      { name: "inventoryTurnover", type: "number", description: "库存周转（次/月）", required: true },
      { name: "storeMetrics", type: "array", description: "各门店营收/面积/客流/转化", required: true },
    ],
  },
  analysisFlow: [
    { step: 1, name: "经营总览", action: "汇总营收、客流、转化、毛利等核心指标", method: "核心指标 + 环比" },
    { step: 2, name: "坪效与人效分析", action: "计算各门店坪效并对标", method: "坪效=营收/面积" },
    { step: 3, name: "客流与转化分析", action: "分析进店客流与转化率", method: "客流×转化×客单 = 营收拆解" },
    { step: 4, name: "商品与库存分析", action: "分析毛利与库存周转健康度", method: "毛利率 + 周转率" },
    { step: 5, name: "问题与机会识别", action: "识别低效门店与经营问题", method: "对标分析 + 影响面评估" },
    { step: 6, name: "改善建议输出", action: "给出可落地的改善动作", method: "行动清单 + 预期收益" },
  ],
  agentPrompt:
    "你是一名资深的零售门店经营分析师，擅长坪效、客流转化与库存诊断。基于给定数据输出客观、可执行的门店经营诊断报告。\n专业原则：1. 数据驱动，禁止编造；2. 口径一致（坪效=营收/面积，转化率=成交/进店客流）；3. 建议可落地；4. 数据不足时明确标注。",
  outputTemplate: {
    sections: [
      { name: "一、经营总览", description: "核心指标与总体判断" },
      { name: "二、坪效与人效分析", description: "各门店坪效对标" },
      { name: "三、客流与转化分析", description: "客流×转化×客单拆解" },
      { name: "四、商品与库存分析", description: "毛利与周转健康度" },
      { name: "五、核心问题与机会", description: "按优先级排序" },
      { name: "六、改善建议", description: "可量化改善动作" },
    ],
  },
  createdAt: "2025-06-30T10:00:00.000Z",
};

const retailData = {
  reportPeriod: "2025-06-01 ~ 2025-06-30",
  storeCount: 8,
  totalRevenue: 640,
  totalFootTraffic: 320000,
  conversionRate: 18,
  avgOrderValue: 156,
  grossMargin: 42,
  inventoryTurnover: 3.2,
  storeMetrics: [
    { store: "旗舰店", revenue: 128, area: 800, footTraffic: 52000, conversionRate: 22 },
    { store: "商圈店A", revenue: 98, area: 500, footTraffic: 48000, conversionRate: 20 },
    { store: "商圈店B", revenue: 86, area: 450, footTraffic: 44000, conversionRate: 19 },
    { store: "社区店A", revenue: 72, area: 300, footTraffic: 38000, conversionRate: 18 },
    { store: "社区店B", revenue: 64, area: 280, footTraffic: 35000, conversionRate: 17 },
    { store: "郊区店", revenue: 45, area: 300, footTraffic: 26000, conversionRate: 14 },
  ],
};

function retailReport(input: unknown): string {
  const d = { ...retailData, ...((input as object) ?? {}) } as typeof retailData;
  const count = d.storeCount || 0;
  const revenue = d.totalRevenue || 0;
  const traffic = d.totalFootTraffic || 0;
  const conv = d.conversionRate ?? 0;
  const aov = d.avgOrderValue ?? 0;
  const margin = d.grossMargin ?? 0;
  const turnover = d.inventoryTurnover ?? 0;
  const stores = Array.isArray(d.storeMetrics) && d.storeMetrics.length ? d.storeMetrics : retailData.storeMetrics;
  const avgPerStore = count ? (revenue / count).toFixed(1) : "0";
  const best = [...stores].sort((a, b) => (b.revenue / b.area) - (a.revenue / a.area))[0];
  const worst = [...stores].sort((a, b) => (a.revenue / a.area) - (b.revenue / b.area))[0];

  const storeRows = stores
    .map((s) => `| ${s.store} | ${s.revenue} 万元 | ${s.area}㎡ | ${(s.revenue / s.area * 10000).toFixed(0)} 元/㎡ | ${s.conversionRate}% |`)
    .join("\n");

  return `# 门店经营诊断报告

**统计周期**：${d.reportPeriod} ｜ **门店数**：${count} 家

## 一、经营总览

| 指标 | 数值 |
| --- | --- |
| 总营收 | ${revenue} 万元 |
| 单店平均营收 | ${avgPerStore} 万元 |
| 总进店客流 | ${traffic.toLocaleString()} |
| 进店转化率 | ${conv}% |
| 客单价 | ${aov} 元 |
| 毛利率 | ${margin}% |
| 库存周转 | ${turnover} 次/月 |

**总体判断**：营收 ${revenue} 万元，${conv >= 15 ? "转化率健康" : "转化率偏低"}，${margin >= 40 ? "毛利水平良好" : "毛利承压"}。

## 二、坪效与人效分析

| 门店 | 营收 | 面积 | 坪效 | 转化率 |
| --- | --- | --- | --- | --- |
${storeRows}

**结论**：「${best?.store}」坪效最高（${(best?.revenue! / best?.area! * 10000).toFixed(0)} 元/㎡）；「${worst?.store}」坪效最低（${(worst?.revenue! / worst?.area! * 10000).toFixed(0)} 元/㎡），需重点诊断。

## 三、客流与转化分析

- **营收拆解**：营收 = 客流 × 转化率 × 客单价 = ${traffic.toLocaleString()} × ${conv}% × ${aov} 元。
- **转化诊断**：${conv >= 15 ? "转化率处于健康区间" : "转化率低于 15% 基准，需优化导购与陈列"}。
- **客单诊断**：${aov >= 150 ? "客单价良好" : "客单价偏低，可优化连带销售"}。

## 四、商品与库存分析

- **毛利率** ${margin}%：${margin >= 40 ? "健康" : "偏低，需优化商品结构"}。
- **库存周转** ${turnover} 次/月：${turnover >= 3 ? "周转良好" : "周转偏慢，库存资金占用偏高"}。

## 五、核心问题与机会

1. 【高优先级】「${worst?.store}」坪效明显低于标杆。
2. 【高优先级】${turnover < 3 ? "库存周转 " + turnover + " 次/月偏慢" : "库存周转健康"}。
3. 【机会点】复制「${best?.store}」的经营打法。
4. 【机会点】${aov < 150 ? "客单价有提升空间" : "可进一步放大高坪效门店"}。

## 六、改善建议

| 动作 | 具体措施 | 预期收益 |
| --- | --- | --- |
| 提坪效 | 诊断「${worst?.store}」商品陈列与导购配置 | 坪效 +15% |
| 优库存 | 优化 SKU 结构与补货节奏 | 周转提升至 4 次/月 |
| 提客单 | 加强连带销售与套餐推荐 | 客单价 +10% |
| 树标杆 | 推广「${best?.store}」经营标准 | 整体营收 +8% |

> 说明：结论基于输入数据计算；缺历史同期数据时，环比为「数据不足，无法判断」。`;
}

/* =====================================================================
 * 场景路由与对外接口
 * ===================================================================== */

export const SCENARIOS: Scenario[] = [
  { keywords: /抖音|直播|电商|带货|运营复盘/, skill: ecommerceSkill, sampleData: ecommerceData, report: ecommerceReport },
  { keywords: /销售|业绩|漏斗|商机|CRM|线索/, skill: salesSkill, sampleData: salesData, report: salesReport },
  { keywords: /增长|用户|留存|拉新|DAU|MAU|活跃/, skill: growthSkill, sampleData: growthData, report: growthReport },
  { keywords: /门店|零售|坪效|库存|客流|毛利/, skill: retailSkill, sampleData: retailData, report: retailReport },
];

/** 根据自然语言需求匹配场景（用于 Mock 兜底与示例数据预填） */
export function matchScenario(text: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.keywords.test(text));
}

/** 根据需求文本返回对应的示例输入数据（无匹配时回退电商场景） */
export function getSampleData(text: string): Record<string, unknown> {
  return matchScenario(text)?.sampleData ?? SCENARIOS[0].sampleData;
}

/** 兼容旧导出（smoke-test / 其他引用） */
export const mockDouyinSkill: Skill = ecommerceSkill;
export const sampleInputData = ecommerceData;

/** Mock 生成：按关键词路由到对应场景的示例 Skill */
export function mockGenerateSkill(requirement: string): Skill {
  const sc = matchScenario(requirement);
  return {
    ...(sc ? sc.skill : SCENARIOS[0].skill),
    createdAt: new Date().toISOString(),
  };
}

/** Mock 执行：优先按内置 Skill id 精确匹配，再按名称关键词匹配（覆盖 LLM 生成后执行失败的回退路径） */
export function mockExecuteSkill(skill: Skill, input: unknown): string {
  const byId = SCENARIOS.find((s) => s.skill.id === skill.id);
  if (byId) return byId.report(input);
  const byName = matchScenario(skill.name) ?? matchScenario(skill.description) ?? SCENARIOS[0];
  return byName.report(input);
}
