import type { CompetitorBrand, CompetitorActivity } from "@/types";

export const competitorBrands: CompetitorBrand[] = [
  { id: "br1", name: "喜茶 HEYTEA", platforms: ["instagram", "tiktok"], recentPostCount: 18, postChange: 12, engagementRate: 3.2 },
  { id: "br2", name: "蜜雪冰城 MIXUE", platforms: ["instagram", "tiktok", "facebook"], recentPostCount: 25, postChange: 8, engagementRate: 4.1 },
  { id: "br3", name: "瑞幸 Luckin", platforms: ["instagram", "tiktok"], recentPostCount: 14, postChange: -3, engagementRate: 2.8 },
  { id: "br4", name: "CHAGEE 霸王茶姬", platforms: ["tiktok", "instagram"], recentPostCount: 22, postChange: 15, engagementRate: 3.5 },
];

export const competitorActivities: CompetitorActivity[] = [
  // 喜茶 Heytea Instagram — 用户手工采集的美国INS账号内容
  // 数据口径说明：每条活动 = 一个事件（一家店/一款新品），括号内为该事件在社媒上的发帖量
  { id: "a1", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-06-11", type: "联名", title: "世界杯/NBA总决赛联名系列，撞色限定杯身+周边（约8条帖）", platform: "instagram", heat: "高" },
  { id: "a2", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-06-05", type: "开店", title: "纽约新店预热：门店围挡揭幕/产品预告/倒计时系列（约6条帖）", platform: "instagram", heat: "中" },
  { id: "a3", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-05-20", type: "开店", title: "纽约首店正式开业：门店环境/开业盛况/顾客打卡/幕后花絮（约20条帖）", platform: "instagram", heat: "高" },
  { id: "a4", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-04-15", type: "新品", title: "夏季水果系列一款新品上线：产品特写/原料产地/限时预告（约5条帖）", platform: "instagram", heat: "高" },
  { id: "a5", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-04-07", type: "品牌", title: "新品热销感谢帖+未公开研发花絮/杯身设计迭代故事（约3条帖）", platform: "instagram", heat: "中" },
  { id: "a6", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-03-25", type: "新品", title: "椰子咖啡一款新品：口味剧透/椰林产地溯源/调饮教程（约5条帖）", platform: "instagram", heat: "中" },
  { id: "a7", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-03-12", type: "新品", title: "草莓系列一款新品：果肉特写/粉色调视觉/限时供应预告（约4条帖）", platform: "instagram", heat: "中" },
  { id: "a8", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-02-24", type: "新品", title: "芝士奶茶一款新品：奶盖分层展示/拉花教程/口感测评（约5条帖）", platform: "instagram", heat: "中" },
  { id: "a9", brandId: "br1", brandName: "喜茶 HEYTEA", date: "2026-01-21", type: "新品", title: "芒果奶茶一款新品：鲜果原材料展示/调配过程/粉丝试饮（约4条帖）", platform: "instagram", heat: "中" },

  // 蜜雪冰城
  { id: "a10", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-14", type: "开店", title: "越南胡志明市首店开业，TikTok探店视频爆发", platform: "tiktok", heat: "高" },
  { id: "a11", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-06-08", type: "促销", title: "夏季限定\"第二杯半价\"活动", platform: "instagram", heat: "高" },
  { id: "a12", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-05-25", type: "新品", title: "椰椰系列新品上市，热带水果风味", platform: "tiktok", heat: "中" },
  { id: "a13", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-05-10", type: "品牌", title: "品牌故事系列：从河南小城到全球连锁", platform: "facebook", heat: "中" },
  { id: "a14", brandId: "br2", brandName: "蜜雪冰城 MIXUE", date: "2026-04-20", type: "联名", title: "Hello Kitty联名杯+周边套装", platform: "instagram", heat: "高" },

  // 瑞幸
  { id: "a15", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-06-13", type: "新品", title: "生椰拿铁3.0升级版上市", platform: "tiktok", heat: "高" },
  { id: "a16", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-05-28", type: "促销", title: "9.9元咖啡节，全国门店参与", platform: "instagram", heat: "高" },
  { id: "a17", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-05-05", type: "开店", title: "新加坡第20店开业，东南亚扩张加速", platform: "tiktok", heat: "中" },
  { id: "a18", brandId: "br3", brandName: "瑞幸 Luckin", date: "2026-04-12", type: "联名", title: "茅台联名第二弹：酱香拿铁限定返场", platform: "instagram", heat: "高" },

  // CHAGEE — from user's Excel
  { id: "a19", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-15", type: "品牌", title: "品牌历史故事系列，茶叶产地溯源纪录片风格", platform: "tiktok", heat: "中" },
  { id: "a20", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-06-08", type: "品牌", title: "创始人故事：从云南茶山到全球化的心路", platform: "tiktok", heat: "中" },
  { id: "a21", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-05-25", type: "联名", title: "与传统文化IP联名，东方美学限定杯身", platform: "instagram", heat: "高" },
  { id: "a22", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-05-12", type: "促销", title: "菲律宾市场：优惠券+买一送一活动", platform: "tiktok", heat: "中" },
  { id: "a23", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-04-28", type: "新品", title: "西瓜系列新品上市，东南亚市场首发", platform: "instagram", heat: "中" },
  { id: "a24", brandId: "br4", brandName: "CHAGEE 霸王茶姬", date: "2026-04-05", type: "文化", title: "菲律宾文化节日联名活动，当地IP合作", platform: "tiktok", heat: "低" },
];
