const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const mockData = {
  totalUsers: 128650,
  todayUsers: 432,
  totalOrders: 98720,
  todayOrders: 256,
  totalRevenue: 12865432.5,
  todayRevenue: 86520.0,
  totalStores: 256,
  todayStores: 3
};

function randomFluctuate(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range;
}

function generateTrendData(days = 14) {
  const result = { dates: [], orders: [], revenue: [], newUsers: [] };
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
    const baseFactor = 0.8 + Math.random() * 0.5;
    result.orders.push(Math.floor((200 + Math.random() * 150) * baseFactor));
    result.revenue.push(+(50000 + Math.random() * 80000 * baseFactor).toFixed(2));
    result.newUsers.push(Math.floor((350 + Math.random() * 200) * baseFactor));
  }
  return result;
}

function generateCityRanking() {
  const cities = [
    { name: '上海', code: 'SH' },
    { name: '北京', code: 'BJ' },
    { name: '广州', code: 'GZ' },
    { name: '深圳', code: 'SZ' },
    { name: '杭州', code: 'HZ' },
    { name: '成都', code: 'CD' },
    { name: '武汉', code: 'WH' },
    { name: '南京', code: 'NJ' },
    { name: '西安', code: 'XA' },
    { name: '重庆', code: 'CQ' }
  ];
  return cities.map(c => ({
    ...c,
    orders: Math.floor(500 + Math.random() * 8000),
    revenue: +(100000 + Math.random() * 2500000).toFixed(2),
    users: Math.floor(2000 + Math.random() * 30000),
    growth: +(Math.random() * 40 - 5).toFixed(1)
  })).sort((a, b) => b.revenue - a.revenue).map((c, i) => ({ ...c, rank: i + 1 }));
}

function generateTodos() {
  const templates = [
    { type: 'urgent', icon: '🔥', title: '异常订单处理', desc: '发现 {n} 笔异常支付订单待审核', color: '#ff6b6b' },
    { type: 'warning', icon: '⚠️', title: '库存预警', desc: '{n} 个门店商品库存不足', color: '#ffa94d' },
    { type: 'info', icon: '📋', title: '新商户入驻审核', desc: '{n} 家新门店提交入驻申请', color: '#00d4ff' },
    { type: 'warning', icon: '💬', title: '用户投诉反馈', desc: '{n} 条用户投诉待处理', color: '#7c5cff' },
    { type: 'info', icon: '📝', title: '财务对账提醒', desc: '本月 {n} 笔对账单待确认', color: '#32d583' },
    { type: 'urgent', icon: '🚨', title: '系统告警', desc: '{n} 个门店数据上报异常', color: '#ff6b9d' }
  ];
  return templates
    .map(t => ({
      ...t,
      id: Math.random().toString(36).slice(2, 10),
      count: Math.floor(2 + Math.random() * 48),
      desc: t.desc.replace('{n}', Math.floor(2 + Math.random() * 48)),
      time: `${Math.floor(Math.random() * 24)}小时前`
    }))
    .sort((a, b) => {
      const order = { urgent: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    });
}

app.get('/api/dashboard/stats', (req, res) => {
  const data = {
    totalUsers: randomFluctuate(mockData.totalUsers, 50),
    todayUsers: randomFluctuate(mockData.todayUsers, 30),
    totalOrders: randomFluctuate(mockData.totalOrders, 30),
    todayOrders: randomFluctuate(mockData.todayOrders, 20),
    totalRevenue: +(mockData.totalRevenue + Math.random() * 2000).toFixed(2),
    todayRevenue: +(mockData.todayRevenue + Math.random() * 1000).toFixed(2),
    totalStores: mockData.totalStores,
    todayStores: randomFluctuate(mockData.todayStores, 2),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/today', (req, res) => {
  const hours = [];
  for (let i = 0; i <= new Date().getHours(); i++) {
    hours.push(`${String(i).padStart(2, '0')}:00`);
  }
  const data = {
    orders: {
      total: randomFluctuate(mockData.todayOrders, 20),
      goal: 500,
      rate: 0,
      hourly: hours.map(() => Math.floor(5 + Math.random() * 35))
    },
    revenue: {
      total: +(mockData.todayRevenue + Math.random() * 3000).toFixed(2),
      goal: 150000,
      rate: 0,
      hourly: hours.map(() => +(2000 + Math.random() * 12000).toFixed(2))
    },
    newUsers: {
      total: randomFluctuate(mockData.todayUsers, 30),
      goal: 600,
      rate: 0,
      hourly: hours.map(() => Math.floor(10 + Math.random() * 50))
    },
    updatedAt: new Date().toISOString()
  };
  data.orders.rate = +((data.orders.total / data.orders.goal) * 100).toFixed(1);
  data.revenue.rate = +((data.revenue.total / data.revenue.goal) * 100).toFixed(1);
  data.newUsers.rate = +((data.newUsers.total / data.newUsers.goal) * 100).toFixed(1);
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/trend', (req, res) => {
  const data = {
    period: req.query.period || '14d',
    ...generateTrendData(req.query.period === '30d' ? 30 : 14),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/cities', (req, res) => {
  const data = {
    ranking: generateCityRanking(),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/todos', (req, res) => {
  const data = {
    items: generateTodos(),
    totalCount: 0,
    urgentCount: 0,
    updatedAt: new Date().toISOString()
  };
  data.totalCount = data.items.reduce((s, i) => s + i.count, 0);
  data.urgentCount = data.items.filter(i => i.type === 'urgent').reduce((s, i) => s + i.count, 0);
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const ANNOUNCEMENT_TYPES = {
  rule_update: { label: '规则更新', icon: '📋', color: '#00d4ff' },
  activity_notice: { label: '活动通知', icon: '🎉', color: '#ff6b9d' },
  store_reminder: { label: '门店提醒', icon: '🏪', color: '#32d583' }
};

const ANNOUNCEMENT_LEVELS = {
  normal: { label: '普通', color: '#8c8c8c' },
  important: { label: '重要', color: '#ffa94d' },
  urgent: { label: '紧急', color: '#ff6b6b' }
};

let announcements = [
  {
    id: 'A20250001',
    type: 'rule_update',
    level: 'important',
    title: '关于平台佣金结算规则调整的通知',
    content: '为进一步优化平台生态，自2025年7月1日起，平台佣金结算周期将由T+7调整为T+3。请各门店及时更新财务管理流程，如有疑问请联系平台客服。',
    scope: '全部门店',
    publisher: '平台运营部',
    status: 'published',
    publishTime: '2025-06-18T10:00:00.000Z',
    readCount: 186,
    createdAt: '2025-06-18T09:30:00.000Z'
  },
  {
    id: 'A20250002',
    type: 'activity_notice',
    level: 'urgent',
    title: '【618大促】全场满减活动开启报名',
    content: '618年中大促即将来临！平台将推出全场满300减50、满500减100的钜惠活动，报名截止时间为6月25日。参与门店将获得首页推荐位资源，速速报名！',
    scope: '全部门店',
    publisher: '市场营销部',
    status: 'published',
    publishTime: '2025-06-15T14:20:00.000Z',
    readCount: 234,
    createdAt: '2025-06-15T13:00:00.000Z'
  },
  {
    id: 'A20250003',
    type: 'store_reminder',
    level: 'normal',
    title: '华东区域门店消防安全检查提醒',
    content: '华东区域各门店请注意：本周五（6月27日）将进行季度消防安全检查，请各门店提前整理消防通道、检查灭火器有效期，确保检查顺利通过。',
    scope: '华东区域',
    publisher: '区域管理部',
    status: 'published',
    publishTime: '2025-06-16T08:30:00.000Z',
    readCount: 78,
    createdAt: '2025-06-16T08:00:00.000Z'
  },
  {
    id: 'A20250004',
    type: 'rule_update',
    level: 'normal',
    title: '新版商家APP操作手册上线',
    content: '新版商家APP 2.0操作手册已更新至帮助中心，包含订单管理、商品上架、数据查看等全新功能介绍。欢迎各门店下载查阅。',
    scope: '全部门店',
    publisher: '产品技术部',
    status: 'published',
    publishTime: '2025-06-12T16:00:00.000Z',
    readCount: 142,
    createdAt: '2025-06-12T15:00:00.000Z'
  },
  {
    id: 'A20250005',
    type: 'activity_notice',
    level: 'normal',
    title: '7月夏季主题营销活动招商中',
    content: '"清凉一夏"7月主题营销活动正在招商，参与门店可获得专属优惠券补贴及流量扶持。活动主题：消暑美食季、冰饮狂欢节。报名截止7月1日。',
    scope: '全部门店',
    publisher: '市场营销部',
    status: 'draft',
    publishTime: null,
    readCount: 0,
    createdAt: '2025-06-19T11:00:00.000Z'
  }
];

let announcementSeq = 6;

function generateAnnouncementId() {
  const year = new Date().getFullYear();
  const num = String(announcementSeq++).padStart(4, '0');
  return `A${year}${num}`;
}

app.get('/api/announcements', (req, res) => {
  const { type, level, status, keyword, page = 1, pageSize = 10 } = req.query;
  let result = [...announcements];

  if (type && type !== 'all') {
    result = result.filter(a => a.type === type);
  }
  if (level && level !== 'all') {
    result = result.filter(a => a.level === level);
  }
  if (status && status !== 'all') {
    result = result.filter(a => a.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.content.toLowerCase().includes(kw)
    );
  }

  result.sort((a, b) => {
    const timeA = a.publishTime || a.createdAt;
    const timeB = b.publishTime || b.createdAt;
    return new Date(timeB) - new Date(timeA);
  });

  const total = result.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const paged = result.slice(start, start + Number(pageSize));

  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    draft: announcements.filter(a => a.status === 'draft').length,
    urgent: announcements.filter(a => a.level === 'urgent' && a.status === 'published').length
  };

  res.json({
    code: 0,
    data: {
      items: paged,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      stats
    },
    message: 'success'
  });
});

app.post('/api/announcements', (req, res) => {
  const { type, level, title, content, scope, publisher, status } = req.body;

  if (!type || !title || !content) {
    return res.json({ code: 400, message: '公告类型、标题和内容不能为空' });
  }
  if (!ANNOUNCEMENT_TYPES[type]) {
    return res.json({ code: 400, message: '无效的公告类型' });
  }
  if (!ANNOUNCEMENT_LEVELS[level || 'normal']) {
    return res.json({ code: 400, message: '无效的公告级别' });
  }

  const now = new Date().toISOString();
  const newAnnouncement = {
    id: generateAnnouncementId(),
    type,
    level: level || 'normal',
    title: title.trim(),
    content: content.trim(),
    scope: scope || '全部门店',
    publisher: publisher || '系统管理员',
    status: status || 'published',
    publishTime: status === 'draft' ? null : now,
    readCount: 0,
    createdAt: now
  };

  announcements.unshift(newAnnouncement);

  res.json({
    code: 0,
    data: newAnnouncement,
    message: '公告创建成功'
  });
});

app.put('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const { type, level, title, content, scope, publisher, status } = req.body;

  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.json({ code: 404, message: '公告不存在' });
  }

  const current = announcements[idx];
  const now = new Date().toISOString();

  if (current.status === 'draft' && status === 'published' && !current.publishTime) {
    current.publishTime = now;
  }

  if (type) current.type = type;
  if (level) current.level = level;
  if (title) current.title = title.trim();
  if (content) current.content = content.trim();
  if (scope !== undefined) current.scope = scope;
  if (publisher) current.publisher = publisher;
  if (status) current.status = status;

  announcements[idx] = current;

  res.json({
    code: 0,
    data: current,
    message: '公告更新成功'
  });
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.json({ code: 404, message: '公告不存在' });
  }

  announcements.splice(idx, 1);

  res.json({
    code: 0,
    message: '公告删除成功'
  });
});

app.get('/api/announcements/types', (req, res) => {
  res.json({
    code: 0,
    data: {
      types: ANNOUNCEMENT_TYPES,
      levels: ANNOUNCEMENT_LEVELS
    },
    message: 'success'
  });
});

app.listen(PORT, () => {
  console.log(`数据大盘后端服务已启动: http://localhost:${PORT}`);
  console.log(`统计数据接口: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`今日数据接口: http://localhost:${PORT}/api/dashboard/today`);
  console.log(`趋势数据接口: http://localhost:${PORT}/api/dashboard/trend`);
  console.log(`城市排行接口: http://localhost:${PORT}/api/dashboard/cities`);
  console.log(`待办事项接口: http://localhost:${PORT}/api/dashboard/todos`);
  console.log(`公告管理接口: http://localhost:${PORT}/api/announcements`);
});
