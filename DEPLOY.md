# 总后台数据大盘 - 部署文档

## 1. 项目概述

总后台数据大盘是一个面向管理员的数据可视化系统，提供核心经营数据看板、趋势分析、城市排行、待办事项和平台公告管理等功能。

- **技术栈**：Vue 3 + Vite + ECharts（前端），Express.js（后端）
- **前端端口**：5173
- **后端端口**：3002
- **数据模式**：种子随机生成（Mock 数据）

---

## 2. PC 后台环境

### 2.1 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 16.0.0 | 推荐 LTS 版本（18.x / 20.x） |
| npm | >= 8.0.0 | 随 Node.js 自带 |
| 浏览器 | Chrome >= 90 / Edge >= 90 / Firefox >= 88 | 推荐使用 Chrome 最新版 |

### 2.2 目录结构

```
021-总后台数据大盘公告/
├── frontend/              # 前端项目（Vue 3 + Vite）
│   ├── src/
│   │   ├── components/    # 业务组件
│   │   ├── composables/   # 组合式函数
│   │   ├── api/           # API 接口封装
│   │   ├── utils/         # 工具函数
│   │   ├── __tests__/     # 单元测试
│   │   └── test/          # 测试配置
│   ├── package.json
│   └── vite.config.js
└── backend/               # 后端项目（Express.js）
    ├── index.js           # 服务入口
    ├── dataGenerator.js   # 统计数据生成器（种子）
    ├── announcement.js    # 公告管理模块
    ├── utils.js           # 工具函数
    └── package.json
```

### 2.3 环境变量配置

前端通过 Vite 代理转发 API 请求，无需额外环境变量。如需修改后端地址，编辑 [vite.config.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/021-总后台数据大盘公告/frontend/vite.config.js) 中的 `server.proxy`：

```js
proxy: {
  '/api': {
    target: 'http://localhost:3002',  // 后端服务地址
    changeOrigin: true
  }
}
```

后端服务端口定义在 [backend/index.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/021-总后台数据大盘公告/backend/index.js#L25-L25)：

```js
const PORT = 3002;
```

---

## 3. 统计种子说明

### 3.1 种子机制

项目采用**种子化随机数**生成统计数据，确保同一日期下的数据具有可复现性。核心种子函数定义在 [backend/utils.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/021-总后台数据大盘公告/backend/utils.js#L29-L49)。

| 函数 | 作用 |
|------|------|
| `getDaySeed(date)` | 基于日期生成当日种子（当日数据稳定不变） |
| `seededRandom(seed)` | 基于种子的伪随机数生成器（Park-Miller LCG） |

### 3.2 种子数据清单

统计数据生成逻辑集中在 [backend/dataGenerator.js](file:///Users/wuzhijie/Documents/xiaohongshu/biaozhu/yxz-trae-projects/021-总后台数据大盘公告/backend/dataGenerator.js)，包含以下种子数据：

#### 3.2.1 城市种子

共 10 个城市，每个城市有独立权重系数：

| 城市 | 代码 | 权重 |
|------|------|------|
| 上海 | SH | 1.35 |
| 北京 | BJ | 1.28 |
| 深圳 | SZ | 1.18 |
| 广州 | GZ | 1.12 |
| 杭州 | HZ | 0.98 |
| 成都 | CD | 0.88 |
| 武汉 | WH | 0.82 |
| 南京 | NJ | 0.78 |
| 重庆 | CQ | 0.75 |
| 西安 | XA | 0.72 |

#### 3.2.2 门店种子

- 每个城市随机生成 4~8 家门店
- 门店名称取自 20 个预设名称库（旗舰店、中心店、万达店等）
- 约 15% 概率为暂停状态（`paused`）
- 门店 ID 格式：`S0001` ~ `S9999`

#### 3.2.3 经营数据基准值

| 维度 | 全国基准 | 单城市基准 | 单门店基准 |
|------|----------|------------|------------|
| 总用户数 | 128,650 | 28,000 | - |
| 总订单数 | 98,720 | 22,000 | - |
| 总营收（元） | 12,865,432.5 | 3,200,000 | - |
| 门店总数 | 256 | ~30 | 1 |

### 3.3 数据生成规则

1. **今日数据**：基于当日种子 + 城市/门店过滤因子生成，按小时分布
2. **趋势数据**：支持 14 天 / 30 天 / 自定义日期范围，每日数据带随机波动
3. **城市排行**：按营收降序排列，增长率在 -5% ~ +35% 区间波动
4. **待办事项**：6 类待办（商品审核、加盟商审核、提现审核、售后工单、异常订单、用户反馈），数量随过滤维度缩放

---

## 4. 部署步骤

### 4.1 安装依赖

```bash
# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 4.2 启动后端服务

```bash
cd backend
npm run start
```

启动成功后输出：
```
数据大盘后端服务已启动: http://localhost:3002
```

### 4.3 启动前端开发服务

```bash
cd frontend
npm run dev
```

启动成功后访问：`http://localhost:5173`

### 4.4 生产构建

```bash
# 前端构建
cd frontend && npm run build

# 构建产物在 dist/ 目录，可部署到 Nginx 等静态服务器
```

生产部署时，需将 `/api` 路径反向代理到后端 `3002` 端口。

---

## 5. 验收命令

### 5.1 后端健康检查

验证后端服务是否正常启动：

```bash
curl http://localhost:3002/api/health
```

预期返回：
```json
{ "status": "ok", "timestamp": "..." }
```

### 5.2 核心接口验收

```bash
# 统计数据接口
curl "http://localhost:3002/api/dashboard/stats"

# 今日数据接口
curl "http://localhost:3002/api/dashboard/today"

# 趋势数据接口（14天）
curl "http://localhost:3002/api/dashboard/trend?period=14d"

# 趋势数据接口（30天）
curl "http://localhost:3002/api/dashboard/trend?period=30d"

# 城市排行
curl "http://localhost:3002/api/dashboard/cities"

# 城市列表
curl "http://localhost:3002/api/dashboard/cities/list"

# 门店列表
curl "http://localhost:3002/api/dashboard/stores"

# 待办事项
curl "http://localhost:3002/api/dashboard/todos"
```

### 5.3 公告模块验收

```bash
# 获取公告列表
curl "http://localhost:3002/api/announcements"

# 获取公告类型和级别
curl "http://localhost:3002/api/announcements/types"

# 获取公告版本号
curl "http://localhost:3002/api/announcements/version"

# 创建公告
curl -X POST "http://localhost:3002/api/announcements" \
  -H "Content-Type: application/json" \
  -d '{"type":"rule_update","level":"normal","title":"测试公告","content":"这是一条测试公告","publisher":"测试人员"}'

# 更新公告（将 A20250001 替换为实际 ID）
curl -X PUT "http://localhost:3002/api/announcements/A20250001" \
  -H "Content-Type: application/json" \
  -d '{"title":"更新后的标题"}'

# 删除公告
curl -X DELETE "http://localhost:3002/api/announcements/A20250005"
```

### 5.4 过滤条件验收

```bash
# 按城市过滤统计数据
curl "http://localhost:3002/api/dashboard/stats?city=SH"

# 按城市+门店过滤
curl "http://localhost:3002/api/dashboard/stats?city=SH&store=S0001"

# 自定义日期范围
curl "http://localhost:3002/api/dashboard/trend?startDate=2025-06-01&endDate=2025-06-20"

# 按城市过滤门店列表
curl "http://localhost:3002/api/dashboard/stores?cityCode=SH"
```

### 5.5 前端单元测试

```bash
cd frontend
npm run test
```

测试覆盖模块：
- 公告面板（AnnouncementPanel）
- 公告弹窗（AnnouncementModal）
- 城市排行（CityRanking）
- 筛选栏（FilterBar）
- 统计卡片（StatCard）
- 今日数据（TodayData）
- 待办提醒（TodoReminder）
- 趋势图表（TrendChart）
- 工具函数（date / format / utils）
- 公告组合函数（useAnnouncement）

---

## 6. API 接口清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/dashboard/stats` | 汇总统计数据 |
| GET | `/api/dashboard/today` | 今日实时数据 |
| GET | `/api/dashboard/trend` | 趋势数据 |
| GET | `/api/dashboard/cities` | 城市排行 |
| GET | `/api/dashboard/cities/list` | 城市列表 |
| GET | `/api/dashboard/stores` | 门店列表 |
| GET | `/api/dashboard/todos` | 待办事项 |
| GET | `/api/announcements` | 公告列表 |
| POST | `/api/announcements` | 创建公告 |
| PUT | `/api/announcements/:id` | 更新公告 |
| DELETE | `/api/announcements/:id` | 删除公告 |
| GET | `/api/announcements/types` | 公告类型/级别枚举 |
| GET | `/api/announcements/version` | 公告版本号 |

---

## 7. 常见问题

### Q: 前端请求报 404 / 跨域错误？
A: 检查后端服务是否已启动（端口 3002），确认 `vite.config.js` 中的代理配置正确。

### Q: 数据每天都不一样？
A: 这是正常现象，统计数据基于当日种子生成，每天的数据会自动变化但当日内保持一致。

### Q: 公告数据会丢失吗？
A: 会。公告数据存储在内存中，后端重启后数据会重置为初始种子数据（5 条公告）。
