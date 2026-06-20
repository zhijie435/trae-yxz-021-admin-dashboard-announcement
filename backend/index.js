const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

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

const cityList = [
  { name: '上海', code: 'SH', weight: 1.35 },
  { name: '北京', code: 'BJ', weight: 1.28 },
  { name: '广州', code: 'GZ', weight: 1.12 },
  { name: '深圳', code: 'SZ', weight: 1.18 },
  { name: '杭州', code: 'HZ', weight: 0.98 },
  { name: '成都', code: 'CD', weight: 0.88 },
  { name: '武汉', code: 'WH', weight: 0.82 },
  { name: '南京', code: 'NJ', weight: 0.78 },
  { name: '西安', code: 'XA', weight: 0.72 },
  { name: '重庆', code: 'CQ', weight: 0.75 }
];

function generateStores() {
  const stores = [];
  const storeNames = [
    '旗舰店', '中心店', '万达店', '银泰店', '万象城店',
    '龙湖店', '大悦城店', '恒隆店', '环球店', '德基店',
    '印象城店', '凯德店', '来福士店', '华润店', '百联店',
    '新天地店', '南京路店', '王府井店', '三里屯店', '国贸店'
  ];
  let id = 1;
  cityList.forEach(city => {
    const count = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count && i < storeNames.length; i++) {
      stores.push({
        id: `S${String(id).padStart(4, '0')}`,
        name: `${city.name}${storeNames[i]}`,
        cityCode: city.code,
        cityName: city.name,
        status: Math.random() > 0.15 ? 'active' : 'paused'
      });
      id++;
    }
  });
  return stores;
}

const storeList = generateStores();

function getFilterWeight(city, store) {
  let weight = 1;
  if (city) {
    const c = cityList.find(x => x.code === city);
    if (c) weight *= c.weight;
  }
  if (store) {
    const s = storeList.find(x => x.id === store);
    if (s) weight *= 0.85 + Math.random() * 0.3;
  }
  return weight;
}

function getTimeRangeFactor(startDate, endDate) {
  if (!startDate && !endDate) return 1;
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const end = endDate ? new Date(endDate) : now;
  const days = Math.max(1, Math.ceil((end - start) / (24 * 3600 * 1000)));
  return Math.min(2, Math.max(0.3, days / 14));
}

function randomFluctuate(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range;
}

function getDaySeed(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const s = `${y}${m}${d}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTodayData(city, store, weight) {
  const daySeed = getDaySeed();
  const filterSeed = daySeed + (city ? city.charCodeAt(0) * 131 : 0) + (store ? store.charCodeAt(1) * 977 : 0);
  const rand = seededRandom(filterSeed);

  const hours = [];
  const currentHour = new Date().getHours();
  for (let i = 0; i <= currentHour; i++) {
    hours.push(`${String(i).padStart(2, '0')}:00`);
  }

  const baseOrder = city ? (store ? 3 : 18) : (store ? 5 : 30);
  const baseRevenue = city ? (store ? 1200 : 6500) : (store ? 2000 : 10000);
  const baseUser = city ? (store ? 4 : 22) : (store ? 6 : 35);

  const orderHourly = hours.map(() => Math.floor((5 + rand() * 35) * weight));
  const revenueHourly = hours.map(() => +((2000 + rand() * 12000) * weight).toFixed(2));
  const userHourly = hours.map(() => Math.floor((10 + rand() * 50) * weight));

  const orderFluct = 0.8 + rand() * 0.4;
  const revenueFluct = 0.8 + rand() * 0.4;
  const userFluct = 0.8 + rand() * 0.4;

  const data = {
    orders: {
      total: Math.floor(baseOrder * hours.length * weight * orderFluct),
      goal: Math.floor(500 * weight),
      rate: 0,
      hourly: orderHourly
    },
    revenue: {
      total: +(baseRevenue * hours.length * weight * revenueFluct).toFixed(2),
      goal: Math.floor(150000 * weight),
      rate: 0,
      hourly: revenueHourly
    },
    newUsers: {
      total: Math.floor(baseUser * hours.length * weight * userFluct),
      goal: Math.floor(600 * weight),
      rate: 0,
      hourly: userHourly
    }
  };
  data.orders.rate = +((data.orders.total / data.orders.goal) * 100).toFixed(1);
  data.revenue.rate = +((data.revenue.total / data.revenue.goal) * 100).toFixed(1);
  data.newUsers.rate = +((data.newUsers.total / data.newUsers.goal) * 100).toFixed(1);
  return data;
}

function generateTrendData(days = 14, weight = 1) {
  const result = { dates: [], orders: [], revenue: [], newUsers: [] };
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
    const baseFactor = (0.8 + Math.random() * 0.5) * weight;
    result.orders.push(Math.floor((200 + Math.random() * 150) * baseFactor));
    result.revenue.push(+((50000 + Math.random() * 80000) * baseFactor).toFixed(2));
    result.newUsers.push(Math.floor((350 + Math.random() * 200) * baseFactor));
  }
  return result;
}

function generateCityRanking(weight = 1) {
  return cityList.map(c => {
    const w = c.weight * weight;
    return {
      name: c.name,
      code: c.code,
      orders: Math.floor((500 + Math.random() * 8000) * w),
      revenue: +((100000 + Math.random() * 2500000) * w).toFixed(2),
      users: Math.floor((2000 + Math.random() * 30000) * w),
      growth: +(Math.random() * 40 - 5).toFixed(1)
    };
  }).sort((a, b) => b.revenue - a.revenue).map((c, i) => ({ ...c, rank: i + 1 }));
}

function generateTodos(city, store) {
  const templates = [
    {
      type: 'urgent',
      category: 'product',
      icon: '�',
      title: '商品审核',
      desc: '{n} 件新上架商品待审核',
      color: '#ff6b6b',
      action: 'goProductAudit'
    },
    {
      type: 'warning',
      category: 'franchisee',
      icon: '📝',
      title: '加盟商审核',
      desc: '{n} 家新加盟商入驻申请待审核',
      color: '#ffa94d',
      action: 'goFranchiseeAudit'
    },
    {
      type: 'warning',
      category: 'withdraw',
      icon: '�',
      title: '提现审核',
      desc: '{n} 笔商户提现申请待审核',
      color: '#00d4ff',
      action: 'goWithdrawAudit'
    },
    {
      type: 'urgent',
      category: 'aftersale',
      icon: '�',
      title: '售后工单',
      desc: '{n} 条售后工单待处理',
      color: '#7c5cff',
      action: 'goAftersale'
    },
    {
      type: 'info',
      category: 'order',
      icon: '�',
      title: '异常订单',
      desc: '{n} 笔异常支付订单待处理',
      color: '#32d583',
      action: 'goOrderAudit'
    },
    {
      type: 'info',
      category: 'feedback',
      icon: '�',
      title: '用户反馈',
      desc: '{n} 条用户投诉反馈待处理',
      color: '#ff6b9d',
      action: 'goFeedback'
    }
  ];
  const factor = store ? 0.3 : (city ? 0.6 : 1);
  return templates
    .map(t => {
      const count = Math.floor((2 + Math.random() * 48) * factor);
      const isUrgent = t.type === 'urgent';
      return {
        ...t,
        id: t.category + '-' + Math.random().toString(36).slice(2, 10),
        count,
        desc: t.desc.replace('{n}', count),
        time: `${isUrgent ? Math.floor(Math.random() * 6) : Math.floor(Math.random() * 24)}小时前`,
        urgent: isUrgent
      };
    })
    .sort((a, b) => {
      const order = { urgent: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    });
}

app.get('/api/dashboard/cities/list', (req, res) => {
  res.json({
    code: 0,
    data: cityList.map(c => ({ name: c.name, code: c.code })),
    message: 'success'
  });
});

app.get('/api/dashboard/stores', (req, res) => {
  const { cityCode } = req.query;
  let result = storeList.filter(s => s.status === 'active');
  if (cityCode) {
    result = result.filter(s => s.cityCode === cityCode);
  }
  res.json({ code: 0, data: result, message: 'success' });
});

app.get('/api/dashboard/stats', (req, res) => {
  const { city, store, startDate, endDate } = req.query;
  const weight = getFilterWeight(city, store);
  const timeFactor = getTimeRangeFactor(startDate, endDate);
  const factor = weight * timeFactor;

  const baseUsers = city ? 28000 : 128650;
  const baseOrders = city ? 22000 : 98720;
  const baseRevenue = city ? 3200000 : 12865432.5;
  const baseStores = store ? 1 : (city ? 30 : 256);

  const todayData = generateTodayData(city, store, weight);

  const data = {
    totalUsers: Math.floor(baseUsers * factor),
    todayUsers: todayData.newUsers.total,
    totalOrders: Math.floor(baseOrders * factor),
    todayOrders: todayData.orders.total,
    totalRevenue: +(baseRevenue * factor).toFixed(2),
    todayRevenue: todayData.revenue.total,
    totalStores: baseStores,
    todayStores: store ? (Math.random() > 0.5 ? 1 : 0) : Math.floor(3 * weight),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/today', (req, res) => {
  const { city, store } = req.query;
  const weight = getFilterWeight(city, store);

  const data = {
    ...generateTodayData(city, store, weight),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/trend', (req, res) => {
  const { period, city, store, startDate, endDate } = req.query;
  const weight = getFilterWeight(city, store);
  let days = period === '30d' ? 30 : 14;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    days = Math.min(90, Math.max(2, Math.ceil((end - start) / (24 * 3600 * 1000))));
  }

  const data = {
    period: period || (startDate && endDate ? 'custom' : '14d'),
    ...generateTrendData(days, weight),
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/cities', (req, res) => {
  const { store, startDate, endDate } = req.query;
  const weight = getFilterWeight(null, store);
  const timeFactor = getTimeRangeFactor(startDate, endDate);

  let ranking = generateCityRanking(weight * timeFactor);
  if (store) {
    const s = storeList.find(x => x.id === store);
    if (s) {
      ranking = ranking.filter(c => c.code === s.cityCode).map(c => ({
        ...c,
        name: s.name,
        code: s.id,
        orders: Math.floor(c.orders * 0.15),
        revenue: +(c.revenue * 0.15).toFixed(2),
        users: Math.floor(c.users * 0.15),
        isStore: true
      }));
    }
  }

  const data = {
    ranking,
    updatedAt: new Date().toISOString()
  };
  res.json({ code: 0, data, message: 'success' });
});

app.get('/api/dashboard/todos', (req, res) => {
  const { city, store } = req.query;
  const data = {
    items: generateTodos(city, store),
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
  console.log(`城市列表接口: http://localhost:${PORT}/api/dashboard/cities/list`);
  console.log(`门店列表接口: http://localhost:${PORT}/api/dashboard/stores`);
  console.log(`公告管理接口: http://localhost:${PORT}/api/announcements`);
});
