# BubblePulse — 技术全景文档

> 面向出海餐饮品牌的海外社媒内容策略平台。Demo 品牌：CHAGEE（霸王茶姬）。
> 面试准备用文档，涵盖技术栈、模块设计、数据字段与计算逻辑。

---

## 一、技术栈

| 层 | 选型 | 用途 |
|---|------|------|
| 框架 | Next.js 16.2 (App Router) | SSR + API Routes |
| 打包 | Turbopack | 开发热更新 |
| 语言 | TypeScript (strict) | 全栈类型安全 |
| 样式 | Tailwind CSS 4 + shadcn/ui v4 | 组件与样式 |
| 图表 | Recharts 3.8 | KOL 互动柱状图、IP 面积图、KOL 增长曲线 |
| 图标 | Lucide React | 全局图标 |
| 数据源 | YouTube Data API v3, Google Trends RSS, Wikipedia REST API | 真数据管道 |
| 缓存 | 进程内 Map（24h TTL） | API 调用去重 |
| 部署 | Vercel / 本地 localhost:3000 | |

---

## 二、项目结构

```
src/
  app/
    trends/         — 实时热点引擎（核心模块）
    kol/            — KOL 发现与匹配
    ip-tracker/     — IP 联动追踪
    brief/          — AI 策略简报生成
    calendar/       — 营销日历
    brand/settings/ — 品牌画像设置
    api/
      trends/all/       — 统一趋势数据接口
      youtube/trending/ — YouTube 真数据（单源）
      youtube/channels/ — YouTube 真频道数据（KOL）
      google/trending/  — Google Trends RSS
      wikipedia/trending/ — Wikipedia 热门页面浏览量
      kols/all/         — KOL 数据聚合
      ips/all/          — IP 数据聚合
  components/
    layout/
      sidebar.tsx      — 侧边栏（策略切换器）
      filter-panel.tsx  — 右侧筛选面板 + 激活标签
    ui/                 — shadcn 组件库
  lib/
    mock-data.ts        — 30条热点 + 10个KOL + 8个IP + 15个日历事件
    heat-score.ts       — 热度计算引擎
    brand-context.tsx   — 品牌策略全局状态
    utils.ts            — Tailwind 类名合并
  types/index.ts        — 全局类型定义
```

---

## 三、热度计算引擎 (`src/lib/heat-score.ts`)

### 核心理念

不同平台的播放量/点赞量不可直接比较（YouTube 100K views ≠ TikTok 100K views）。
解决方案：**对数基线归一化** + **平台权重加权** → 统一 0-100 热度分。

### 算法

```
1. log10 变换 → 将幂律分布拉平为近似正态
2. Min-Max 归一化 → (logValue - logMin) / (logMax - logMin) × 100
3. 平台权重加权求和 → 最终 heatScore
```

### 平台基线（[logMin, logMax]）

| 平台 | views | likes | comments | shares |
|------|-------|-------|----------|--------|
| YouTube | [2, 9] | [0, 8] | [0, 7] | [0, 7] |
| Google Trends | [2, 7] | — | — | — |
| TikTok | [2, 9] | [0, 8] | [0, 7] | [0, 7] |
| Instagram | [2, 8] | [0, 7] | [0, 6] | [0, 6] |

### 平台权重

| 平台 | views | likes | comments | shares |
|------|-------|-------|----------|--------|
| YouTube | 0.3 | 0.3 | 0.3 | 0.1 |
| Google | 1.0 | — | — | — |
| TikTok | 0.2 | 0.3 | 0.15 | 0.35 |

### 示例

```
YouTube 视频：100M views, 5M likes, 1M comments
  views: log10(100M)=8.0 → (8-2)/(9-2)×100=85.7 → 85.7×0.3=25.7
  likes: log10(5M)=6.7  → (6.7-0)/(8-0)×100=83.8 → 83.8×0.3=25.1
  comments: log10(1M)=6.0 → (6-0)/(7-0)×100=85.7 → 85.7×0.3=25.7
  shares: log10(500K)=5.7 → (5.7-0)/(7-0)×100=81.4 → 81.4×0.1=8.1
  heatScore = (25.7+25.1+25.7+8.1) / 1.0 = 84.6 → 85
```

### 其他函数

| 函数 | 公式 | 用途 |
|------|------|------|
| `calcVelocity` | views ÷ hours_since_publish | 播放速度 |
| `calcGrowthRate` | (velocity ÷ views) × 100 | 增长率(%) |
| `detectLanguage` | 正则匹配 CJK/Hangul/Thai 等 | 语言识别 |

---

## 四、数据管道

### 日榜（默认）

```
YouTube API (US+JP, 2 region × 15 = ~20 items)
  → 实时 trending videos (views/likes/comments 真数据)
  → detectLanguage 识别语言
  → calcHeatScore 算热度
Google RSS (US+JP, ~10 items)
  → 实时搜索趋势话题 (标题/搜索量 真数据)
  → calcHeatScore 算热度
Mock 数据 (30 items)
  → 手写热点（覆盖国家/语言/情绪全维度）
  → heatScore 缩放到真实数据区间内混合
合并 → 去重 (按title前40字符) → 排序 → 返回 top 50
```

### 周榜/月榜

```
取日榜 top N → 每条复制 7/30 天快照
→ 所有指标 × 同一随机比例 (0.7~1.3x / 0.5~1.5x)
→ 重新 calcHeatScore
→ 去重 → 返回
```

### 数据源真实度

| 字段 | YouTube | Google | Mock |
|------|---------|--------|------|
| title | ✅ 真 | ✅ 真 | 手写 |
| views | ✅ 真 | 搜索量×10(估算) | 手写 |
| likes | ✅ 真 | 估算 | 手写 |
| comments | ✅ 真 | 估算 | 手写 |
| heatScore | 计算(真) | 计算(半真) | 计算(模拟) |
| growthRate | 计算(真) | 计算(半真) | 手写 |
| language | 识别(真) | 识别(真) | 手写 |
| emotion | 猜测 | 猜测 | 手写 |
| demographic | 中性值 | 中性值 | 手写 |
| lifecycle | 计算 | 硬编码 | 手写 |

---

## 五、模块详解

### 5.1 实时热点 (`/trends`)

**页面结构**：标题 + 工具栏(周期切换/数据源切换/策略名/结果数) + 筛选标签 + 卡片列表 + 右侧筛选面板

**工具栏元素**：

| 元素 | 数据 | 说明 |
|------|------|------|
| 周期切换 | `日/周/月` | 控制 API period 参数 |
| 数据源切换 | `全网/YT/Google` | merged = YouTube+Google+Mock |
| 品牌策略名 | `activeStrategy.name` | 如"北美年轻女性" |
| 结果计数 | `filtered.length` | 当前筛选后的结果数 |

**卡片展示字段**：

| # | 字段 | 来源 | 计算/说明 |
|---|------|------|-----------|
| 排名 | `filtered.indexOf() + 1` | 按 heatScore 降序排列。前3琥珀色，其余灰色 |
| 标题 | `trend.title` | 可点击跳转原文链接。YT→youtube.com，Google→trends.google.com |
| 来源标签 | `id` 前缀判断 | `yt-`=红色YT，`goog-`=蓝色Google，其余=平台标签 |
| 平台 | `trend.platform` | YouTube/TikTok/Instagram/YouTube Shorts |
| 国家 | `trend.country` | YT:从API regionCode，Google:从RSS geo，Mock:手写 |
| 语言 | `trend.language` | 内容文字检测（CJK→zh/ja/ko，Hangul→ko，Thai→th 等） |
| 情绪 | `trend.emotion` | 标题关键词匹配(calm/awe/excitement/curiosity/humor/nostalgia/empathy/joy) |
| 缩略图 | `trend.thumbnailUrl` | YT:真封面，Google:RSS图片，Mock:空 |
| 描述 | `trend.description` | YT:真描述截200字，Google:RSS描述，Mock:手写 |
| 生命周期 | `trend.lifecycle.stage` | Rising(绿)/Peak(黄)/Declining(红)。YT:根据 velocity 计算 |
| 窗口 | `trend.lifecycle.estimatedWindow` | "3-7天"/"1-2周"/"不建议进入" |
| 竞品密度 | `trend.lifecycle.competitorDensity` | 低/中/高。Mock手写，API 随机 |
| 热度分 | `trend.metrics.heatScore` | **核心指标**。0-100跨平台统一分。log归一化+平台权重 |
| 播放量 | `trend.metrics.views` | 真数据（YouTube API），辅助参考 |
| 涨跌 | `trend.metrics.growthRate` | calcGrowthRate()。velocity/views×100。正=绿，负=红 |
| 受众 | `trend.demographicAffinity` | %女性·%18-24。Mock手写，API中性值(50/33) |
| 优先关注 | 条件标签 | audienceOverlap≥80且rising时显示 |
| 风险标记 | `trend.riskFlags` | 可选。类型(文化敏感/宗教/品牌安全)×等级(低/中/高)+说明 |

**右侧筛选面板**（7组checkbox + 滑杆）：

| 筛选组 | 选项 | 品牌预设行为 |
|--------|------|-------------|
| 平台 | TikTok/Instagram/YT Shorts/YouTube | 自由选择 |
| 国家 | 15个国家 | 品牌策略自动预填 + amber发光 |
| 语言 | 12种语言 | 同上 |
| 情绪 | 8种情绪 | 同上 |
| 性别 | 女性为主/男性为主 | 同上 |
| 生命周期 | Rising/Peak/Declining | 自由选择 |
| 内容格式 | Hashtag/Audio/Challenge/短视频/长视频 | 自由选择 |
| 重合度阈 | 0-100滑杆 | 自由选择 |

### 5.2 KOL 发现 (`/kol`)

**数据源**：YouTube Data API → 4个分类(Entertainment/People/Howto/Gaming) → 热门频道

**KOL 卡片字段**：

| 字段 | 来源 | 真假 |
|------|------|------|
| 头像 | YouTube API `snippet.thumbnails.high.url` | ✅ 真 |
| Handle | YouTube API `snippet.customUrl` | ✅ 真。可点击跳转 youtube.com/@handle |
| 平台 | 固定 youtube | ✅ |
| 粉丝 | YouTube API `statistics.subscriberCount` | ✅ 真 |
| 互动率 | 最近5条视频 avg((likes+comments)/views)×100 | ✅ 真 |
| 品牌匹配度 | audienceOverlap(60%)+contentFit(40%) | ⚠️ 综合计算 |
| 内容风格 | 频道描述关键词匹配 | ⚠️ 推断 |
| 合作费用 | subs×15%观看率×内容类型费率×互动率因子 | ⚠️ CPM公式估算 |

**KOL 详情 Sheet 字段**：

| 区块 | 字段 | 说明 |
|------|------|------|
| 频道数据 | 匹配度/互动率/订阅数 | 顶部三格 |
| 内容风格 | ASMR/Aesthetic/Comedic... | 从描述推断 |
| 受众画像 | 年龄/性别/地区/兴趣 | 目前为估算 |
| 品牌合作 | 合作品牌·年份·类型 | YouTube API 无法获取此数据，目前为空 |
| 品牌适配 | 品牌安全评分(75-94)/内容质量/近期爆款数/合作品牌汇总 | 综合评估 |
| 近期互动 | 互动量柱状图（BarChart） | 6条最近内容 |
| ROI 预估 | CPM/互动ROI/匹配溢价 | 公式计算 |
| 合作费用 | $X - $Y/条 | CPM公式，附计算说明 |

**ROI 公式**：
- CPM = 费用中位数 ÷ (订阅×15% ÷ 1000)
- 互动ROI = 预估互动量 ÷ 费用中位数
- 匹配溢价 = 受众重合度 × 互动率 ÷ CPM

### 5.3 IP 联动追踪 (`/ip-tracker`)

**数据源**：Wikipedia REST API → `/page/summary/{name}` → 缩略图。目前主要用 Mock 数据。

**IP 卡片字段**：

| 字段 | 来源 | 说明 |
|------|------|------|
| 头像 | Wikipedia 动态获取 / Mock | REST API 抓 page summary thumbnail |
| 名称 | Mock/Wikipedia | |
| 类别 | anime/game/movie/character/meme | |
| 可行性 | 高/中/低 | 颜色编码。高=绿，中=黄，低=红 |
| 热度 | heatScore (0-100) | |
| 趋势方向 | up/stable/down | 箭头图标 |
| 竞品占用 | 是/否 | 绿色闪电=首发机会，黄色警告=已占用 |
| 联动先例 | 品牌·年份·描述·曝光量 | 可点击跳 Wikipedia |
| 左边框颜色 | 绿=机会窗口，黄=拥挤 | 一目了然 |

**IP 详情 Sheet**：

| 区块 | 内容 |
|------|------|
| 统计 | 当前热度 / 30天均值 / 脉冲频率（高频≥8/中频≥4/低频） |
| 面积图 | 30天热度趋势（Recharts AreaChart）。amber渐变填充，均值参考线 |
| 脉冲事件 | 来自 collabPrecedents 的真实事件标注。日期+描述+热度增量 |
| 联动建议 | 高频=随时可投，中频=等窗口，低频=观望 |

### 5.4 AI 策略简报 (`/brief`)

- 生成范围选择：热点/KOL/IP 三个 checkbox
- 点击"生成简报"→ typing 动画逐段揭示（600ms/段）
- 简报结构：标题→TOP3机会→KOL推荐→IP关注→下周日历
- 导出：打印 PDF / 复制分享链接
- 数据：当前使用 `weeklyBrief` mock 数据。未来接真实趋势/KOL/IP top N

### 5.5 营销日历 (`/calendar`)

- 按地区+国家筛选
- 节点卡片：日期/地区/国家/类型(节日/音乐节/赛事/文化)/茶饮关联建议
- 15个国家全覆盖，每国≥1个节点
- 可新建/编辑/删除节点（local state）
- 当前 session 生效，刷新重置为 mock 数据

### 5.6 品牌设置 + 策略预设 (`/brand/settings`)

- 品牌画像：名称/品类/价格带/视觉风格/目标市场/目标人群
- 策略预设：3个默认策略（北美年轻女性/东南亚Z世代/欧洲wellness）
- 策略编辑：Sheet 表单 → 市场/国家/语言/情绪/年龄/性别
- 侧边栏切换策略 → 全局生效
- 品牌预设 ON → Trends/KOL/IP 筛选自动填值
- 手动修改筛选 → 检测是否匹配某策略 → 匹配→切换，不匹配→自由筛选

---

## 六、KOL ROI 估算公式详解

```
预估曝光 = 订阅数 × 15%（行业经验：约15%粉丝看到一条内容）
CPM = 合作费用 ÷ (预估曝光 ÷ 1000)
互动ROI = (订阅数 × 互动率 ÷ 100) ÷ 费用
匹配溢价 = 受众重合度 × 互动率 ÷ CPM
```

CPM 越低越划算。互动ROI 越大回报越高。匹配溢价越高效。

---

## 七、API 路由汇总

| 路由 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/trends/all` | GET | source, period, max | **主数据接口**。合并 YouTube+Google+Mock |
| `/api/youtube/trending` | GET | mode, region, max | YouTube 单源（trending/search） |
| `/api/youtube/channels` | GET | max | YouTube 频道数据（KOL 源） |
| `/api/google/trending` | GET | region | Google Trends RSS |
| `/api/wikipedia/trending` | GET | max | Wikipedia 热门浏览量（IP 源） |
| `/api/kols/all` | GET | source, max | KOL 数据聚合 |
| `/api/ips/all` | GET | source, max | IP 数据聚合 |

---

## 八、关键设计决策

1. **对数归一化而非百分位排名**：百分位需要全量数据且结果随批次变化。对数基线归一化稳定可复现。
2. **品牌预设 = 预填而非锁定**：策略值填入筛选面板但可手动修改，灵活性+引导性兼顾。
3. **Mock 数据作为真数据的补充层而非替代**：日榜 Mock 缩放到真数据热度区间，混合展示。
4. **语言 = 内容检测而非国家推测**：从标题/描述文字识别真实语言。
5. **24h 缓存**：YouTube API 配额有限（1万/天），所有 API 调用缓存 24 小时。
