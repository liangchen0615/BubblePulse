# Future Decisions — BubblePulse

待实现的技术方案，按优先级排列。

## P0 — 演示前应该做的

### 热度显示
- [x] ~~卡片显示 heatScore（0-100），不是 views~~
- [x] ~~排序按 heatScore~~

### 标题链接
- [x] ~~卡片标题可点击跳转到源 URL~~

### 跨平台标记
- [x] ~~移除——当前判断逻辑不可靠，表述令人困惑~~
- 未来方案：同时在 ≥2 个平台的 trending 中出现才标 `crossPlatform: true`。需要接多个平台 API

## P1 — 短期可实现

### 情绪分析升级
- 当前：标题关键词匹配，准确率约 40%
- 方案 A：YouTube `categoryId`（29 个分类）+ 标题 NLP → 准确率 70%
- 方案 B：采样评论 100 条 + NLP 情感分析 → 准确率 85%，数据量大
- 方案 C：Vision API 分析视频封面 → 付费 API

### 竞品密度
- 当前：Mock 手写 / 随机
- 方案：YouTube Search API 搜热点关键词 → 返回结果数 ÷ 时间窗口 = 密度
- 方案：Google Trends 关联话题中检测品牌名

### growthRate 时间范围
- 当前：从发布到现在的平均每小时增速，没有明确时间窗口
- 方案：两次 API 采样对比。采样间隔 2h → `(views2 - views1) / views1` = 2h 增速
- 需要：打破 24h 缓存，改为短周期采样

### 受众画像
- 当前：Mock 手写 / API 中性值
- 唯一可用的真数据源：Google Trends "interest by region" — 哪个城市搜这个关键词的人最多
- KOL 受众：第三方付费（HypeAuditor / Social Blade）

## P2 — 需要更多数据源

### 周榜/月榜真数据
- 当前：日榜数据 × 比例缩放模拟
- 方案：每 2 小时采样一次日榜 → 缓存到 JSON 文件 → 7/30 天累积 → 真趋势曲线
- 需要：文件持久化缓存（非进程内存）

### IP 热度曲线
- 当前：Mock 生成 + 合作事件标注
- 方案：Wikipedia 历史浏览量数据（免费 API），接 30 天数据 → 真曲线
- 方案：Google Trends 话题历史数据

### KOL 粉丝增长
- 当前：无法获取（只有频道主能看）
- 方案：Social Blade API（$99/月起）
- 方案：定期采样 YouTube Channel API → 自建历史数据库

## P3 — 远期

### 自动 IP 检测
- 从 Trends 数据流中自动识别 IP 名称 → 持续追踪 → 自动生成热度曲线
- 需要：IP 名称知识库 + 实时检测管道

### 跨平台验证
- 同一条内容在多个平台的 trending 中同时出现 → 真跨平台趋势
- 需要：TikTok API（当前不可用）、Instagram API（需要商业验证）

### 视频嵌入播放
- YouTube iframe 嵌入 → 模态框内播放
- 风险：演示时网络延迟，自动播放被浏览器拦截
- 决策：不做。只保留链接跳转

### 品牌安全审核
- KOL 历史内容审查 → 自动标记争议言论
- 需要：AI 内容审核 API

### AI 简报真 LLM 生成
- 当前：Mock 数据 + typing 动画
- 方案：接 Claude/OpenAI API → 传入真实数据 → 流式生成真简报
- 成本：每次生成约 $0.01-0.05
