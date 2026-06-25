// ============================================================
// 数据口径说明 · 所有指标的含义和计算逻辑
// ============================================================

export interface GlossaryEntry {
  term: string;           // 指标/符号名称
  label: string;          // 简短标签
  explanation: string;    // 含义说明
  calc?: string;          // 计算逻辑（可选）
}

// ═══ 竞品情报页 ═══
export const competitorGlossary: GlossaryEntry[] = [
  {
    term: "postCount",
    label: "近30天发帖",
    explanation: "该品牌在监测平台（TikTok/Instagram/Facebook）上最近30个自然日内发布的公开帖子总数。数据来自社媒平台公开API或手工采集。",
    calc: "统计口径：以帖子发布时间戳为准，取过去30天的去重帖子数量。同一帖子跨平台发布分别计数。",
  },
  {
    term: "postChange",
    label: "发帖变化率",
    explanation: "近30天发帖量与前一个30天周期的对比变化百分比。正值表示发帖量增加，负值表示减少。",
    calc: "(本期发帖量 − 上期发帖量) ÷ 上期发帖量 × 100%。上期时间窗口：过去第31-60天。",
  },
  {
    term: "engagementRate",
    label: "互动率",
    explanation: "该品牌帖子在监测周期内获得的平均互动率（点赞+评论+分享之和除以帖子曝光量）。反映内容质量而非发布频率。",
    calc: "单帖互动率 = (赞+评+转) ÷ 曝光量。品牌互动率 = 全部帖子的单帖互动率均值。",
  },
  {
    term: "heat",
    label: "热度标记",
    explanation: "基于帖子互动量、互动率、发布后24小时内的互动增速综合评估的内容热度等级。「高」表示显著高于该品牌平均水平，「中」表示接近均值，「低」表示低于均值。",
    calc: "热度分 = 0.4×互动量归一化 + 0.3×互动率归一化 + 0.3×增速归一化。高≥80分位，中≥50分位，低<50分位。",
  },
  {
    term: "activityType",
    label: "活动分类",
    explanation: "将竞品社媒帖子按业务动作分为七类。新品：新产品线/口味上市；开店：新门店开业或预热；联名：与IP/品牌合作；促销：折扣/优惠活动；品牌：品牌形象/故事/理念内容；文化：节日/文化活动相关内容；其他：不属以上分类。",
    calc: "分类依据：帖子标题、标签和内容的语义分析。当前Demo阶段为人工标注。",
  },
  {
    term: "platform",
    label: "平台来源",
    explanation: "该条社媒动态的原始发布平台。TT = TikTok（短视频），IG = Instagram（图文+Reels），FB = Facebook（图文+视频）。",
  },
  {
    term: "confidence",
    label: "AI 洞察置信度",
    explanation: "AI信号洞察引擎对该条结论的信心评分。基于支撑证据的数量、来源多样性和信号一致性综合计算。置信度越高，该洞察越可靠。",
    calc: "置信度 = 0.4×证据数量因子 + 0.3×来源多样性因子 + 0.3×信号一致性因子。每个因子归一化到0-1区间。",
  },
  {
    term: "signal",
    label: "信号来源",
    explanation: "AI洞察引擎从跨平台、跨品牌的数据中检测到的异常模式或趋势信号。例如多个品牌同时推出同一原料的新品。",
  },
  {
    term: "evidence",
    label: "证据链",
    explanation: "支撑AI洞察结论的具体帖子、账号和内容。每条证据包含来源品牌/账号、发布平台、日期和内容摘要。",
  },
  {
    term: "brandColor",
    label: "品牌色条",
    explanation: "统一时间线中每个条目左侧的彩色竖条，用于快速区分不同品牌。绿色=喜茶，红色=蜜雪冰城，蓝色=瑞幸，金色=CHAGEE。",
  },
];

// ═══ 行业趋势页 ═══
export const trendsGlossary: GlossaryEntry[] = [
  {
    term: "discussionVolume",
    label: "讨论量",
    explanation: "在TikTok、Instagram、Facebook三个平台上，围绕该趋势话题的帖子、评论和分享的月度估算总量。反映话题热度规模。",
    calc: "估算口径：话题相关帖子数 + 帖子下讨论量。跨平台汇总后以万为单位展示。当前Demo阶段为基于真实社媒数据规模的合理估算。",
  },
  {
    term: "growthRate",
    label: "增长率",
    explanation: "话题讨论量在过去30天与前一个30天周期的对比变化率。正值为上升趋势，负值为下降趋势。",
    calc: "(本期30天讨论量 − 上期30天讨论量) ÷ 上期讨论量 × 100%",
  },
  {
    term: "platformDistribution",
    label: "平台分布",
    explanation: "该趋势话题在三个平台上的讨论量占比分布。反映不同平台对该话题的讨论热度差异——例如TikTok占比高说明该话题以短视频为主要传播载体。",
    calc: "平台占比 = 该平台相关讨论量 ÷ 三平台总讨论量 × 100%",
  },
  {
    term: "competitorDensity",
    label: "竞品密度",
    explanation: "在监测的竞品品牌中，有多少个品牌正在该趋势方向上有所动作。「低」=1个或无品牌涉及（蓝海），「中」=2个品牌涉及（竞争升温），「高」=3个及以上品牌涉及（红海竞争）。",
    calc: "以监测品牌池（当前4个）为分母，在趋势相关数据中出现的品牌数为分子。低≤1，中=2，高≥3。",
  },
  {
    term: "weeklyVolumes",
    label: "周趋势图",
    explanation: "过去4周的讨论量变化趋势。每个柱子代表一周的估算讨论量。柱子上涨表示话题热度增加，柱子平稳或下降表示热度趋于稳定或消退。",
    calc: "每周讨论量独立估算，4周数据用于展示短期趋势方向。",
  },
  {
    term: "trendCategory",
    label: "趋势维度",
    explanation: "行业趋势的四大分析维度。原料/口味：饮品相关的原材料和风味趋势；品类赛道：不同产品品类的市场趋势；区域市场：不同地理区域的市场动态；竞品策略：竞争对手的策略方向变化。",
  },
  {
    term: "trendSubCategory",
    label: "趋势子类",
    explanation: "每个维度下的细分方向。例如原料/口味维度分为咖啡/茶底、水果风味、乳制品/替代乳等子类，便于精准定位关心方向。",
  },
  {
    term: "actionSuggestion",
    label: "行动建议",
    explanation: "基于趋势分析为该趋势针对的B2B决策角色（如产品研发、供应链采购、市场拓展等）提供的可行性建议。每条建议指向具体角色和可执行的动作。",
  },
];

// ═══ 通用指标 ═══
export const commonGlossary: GlossaryEntry[] = [
  {
    term: "brandPreset",
    label: "品牌策略预设",
    explanation: "在侧边栏配置的目标市场、人群和内容策略组合。选中预设后，页面数据会根据预设的地区、语言、人群画像自动筛选相关度最高的内容。",
  },
  {
    term: "crossSource",
    label: "跨源信号连接",
    explanation: "AI引擎的核心能力——从不同平台、不同品牌的数据中识别出指向同一趋势或事件的信号，并将它们连接成完整的洞察链条。例如从喜茶的INS新品帖+蜜雪的TikTok原料内容+瑞幸的产品升级帖中识别出'云南咖啡'趋势。",
  },
];
