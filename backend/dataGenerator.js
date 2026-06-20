const {
  getDaySeed,
  seededRandom,
  getTimeRangeFactor,
  formatShortDate
} = require('./utils');

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
    result.dates.push(formatShortDate(d));
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
      icon: '📋',
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
      icon: '💰',
      title: '提现审核',
      desc: '{n} 笔商户提现申请待审核',
      color: '#00d4ff',
      action: 'goWithdrawAudit'
    },
    {
      type: 'urgent',
      category: 'aftersale',
      icon: '🔧',
      title: '售后工单',
      desc: '{n} 条售后工单待处理',
      color: '#7c5cff',
      action: 'goAftersale'
    },
    {
      type: 'info',
      category: 'order',
      icon: '📦',
      title: '异常订单',
      desc: '{n} 笔异常支付订单待处理',
      color: '#32d583',
      action: 'goOrderAudit'
    },
    {
      type: 'info',
      category: 'feedback',
      icon: '💬',
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

function generateStats(city, store, startDate, endDate) {
  const weight = getFilterWeight(city, store);
  const timeFactor = getTimeRangeFactor(startDate, endDate);
  const factor = weight * timeFactor;

  const baseUsers = city ? 28000 : 128650;
  const baseOrders = city ? 22000 : 98720;
  const baseRevenue = city ? 3200000 : 12865432.5;
  const baseStores = store ? 1 : (city ? 30 : 256);

  const todayData = generateTodayData(city, store, weight);

  return {
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
}

module.exports = {
  cityList,
  storeList,
  getFilterWeight,
  generateTodayData,
  generateTrendData,
  generateCityRanking,
  generateTodos,
  generateStats
};
