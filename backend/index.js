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

app.listen(PORT, () => {
  console.log(`数据大盘后端服务已启动: http://localhost:${PORT}`);
  console.log(`统计数据接口: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`今日数据接口: http://localhost:${PORT}/api/dashboard/today`);
  console.log(`趋势数据接口: http://localhost:${PORT}/api/dashboard/trend`);
  console.log(`城市排行接口: http://localhost:${PORT}/api/dashboard/cities`);
  console.log(`待办事项接口: http://localhost:${PORT}/api/dashboard/todos`);
});
