// AI-generated cross-source insights — mock data demonstrating the signal connection engine

export interface InsightEvidence {
  source: string;      // brand or account name
  platform: string;    // TikTok/Instagram/Facebook/LinkedIn
  date: string;
  content: string;     // the actual post/content that triggered the signal
}

export interface AIInsight {
  id: string;
  title: string;             // one-line summary
  signals: string;           // what signals were detected and connected
  valueTags: string[];       // 💰降低成本 / ⚠️预警风险 / 👁️信息优势
  confidence: number;        // 0-1
  evidence: InsightEvidence[];  // the raw posts that support this insight
  action: string;            // suggested action
  actionFor: string;         // who should take this action
}

export const mockInsights: AIInsight[] = [
  {
    id: "ins-1",
    title: "云南咖啡正在成为茶饮赛道下一个核心风味",
    signals: "3个品牌同时在推云南咖啡内容，上游供应商确认增产30%",
    valueTags: ["👁️信息优势", "💰降低成本"],
    confidence: 0.87,
    evidence: [
      { source: "喜茶 HEYTEA", platform: "Instagram", date: "2026-06-11", content: "世界杯联名系列中首次推出「云南小粒咖啡」特调" },
      { source: "蜜雪冰城 MIXUE", platform: "TikTok", date: "2026-06-08", content: "「云南寻豆之旅」幕后花絮视频，展示普洱咖啡庄园" },
      { source: "瑞幸 Luckin", platform: "TikTok", date: "2026-06-13", content: "生椰拿铁3.0升级版强调「云南高山阿拉比卡豆」作为卖点" },
      { source: "云南普洱咖啡合作社", platform: "Facebook", date: "2026-05-30", content: "2026产季预计增产30%，欢迎新客户来厂考察" },
    ],
    action: "建议饮品客户评估云南咖啡供应链，提前联系普洱产区锁量，避免3-6个月后因需求激增导致原料价格上涨",
    actionFor: "供应链采购负责人",
  },
  {
    id: "ins-2",
    title: "纽约Soho商圈茶饮竞争将在本季度内激化",
    signals: "2个品牌同期在Soho开新店，商业地产招商号暗示签约",
    valueTags: ["⚠️预警风险", "👁️信息优势"],
    confidence: 0.82,
    evidence: [
      { source: "喜茶 HEYTEA", platform: "Instagram", date: "2026-06-05", content: "纽约新店预热活动连续发布，定位标签显示Soho区" },
      { source: "CHAGEE 霸王茶姬", platform: "LinkedIn", date: "2026-05-25", content: "招聘「美国市场拓展经理」，职位描述中提及纽约门店运营" },
      { source: "Brookfield Properties", platform: "Facebook", date: "2026-06-02", content: "「Soho旗舰铺位已签约某亚洲高端茶饮品牌」，评论区猜测为霸王茶姬" },
    ],
    action: "建议市场团队评估Soho商圈容量——如果两个品牌同期进入，是否需要调整我方进入策略（加速/差异化定位/暂时观望）",
    actionFor: "海外市场拓展负责人",
  },
  {
    id: "ins-3",
    title: "蜜雪冰城正在规模化建设越南供应链",
    signals: "连续发布越南岗位、负责人长期驻场、本地供应商频繁互动",
    valueTags: ["👁️信息优势", "⚠️预警风险"],
    confidence: 0.75,
    evidence: [
      { source: "蜜雪冰城 MIXUE", platform: "TikTok", date: "2026-06-14", content: "胡志明市首店开业，探店视频中展示了本地供应链配送中心" },
      { source: "蜜雪冰城东南亚业务负责人", platform: "Instagram", date: "2026-06-10", content: "连续两周定位胡志明市，分享本地食材市场考察照片" },
      { source: "蜜雪冰城 MIXUE", platform: "LinkedIn", date: "2026-06-01", content: "同时发布3个越南岗位：供应链经理、品控主管、冷链物流专员" },
    ],
    action: "如果贵司也在越南市场有布局，建议加速本地供应链建设——蜜雪正在抢建基础设施，先发优势窗口正在收窄",
    actionFor: "海外市场拓展负责人",
  },
  {
    id: "ins-4",
    title: "CHAGEE和喜茶在海外市场的内容策略正在分化",
    signals: "CHAGEE转向品牌文化深度内容，喜茶保持高频产品推新",
    valueTags: ["👁️信息优势"],
    confidence: 0.80,
    evidence: [
      { source: "CHAGEE 霸王茶姬", platform: "TikTok", date: "2026-06-15", content: "品牌历史故事系列：「从云南茶山到全球化的心路」纪录片风格" },
      { source: "CHAGEE 霸王茶姬", platform: "TikTok", date: "2026-06-08", content: "创始人故事，强调「东方美学」品牌叙事" },
      { source: "喜茶 HEYTEA", platform: "Instagram", date: "2026-06-11", content: "世界杯联名系列，撞色限定杯身，短平快产品推新节奏" },
      { source: "喜茶 HEYTEA", platform: "Instagram", date: "2026-04-15", content: "夏季水果系列6-7款新品，维持高频上新节奏（月均3-4款）" },
    ],
    action: "两个品牌正在走截然不同的海外路径——CHAGEE赌品牌溢价，喜茶赌产品迭代速度。贵司的海外策略应该对标哪一个？或者找两者的空白地带？",
    actionFor: "品牌战略负责人",
  },
];
