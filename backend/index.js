const express = require('express');
const cors = require('cors');
const { getTimeRangeFactor, getDaysBetween } = require('./utils');
const {
  cityList,
  storeList,
  getFilterWeight,
  generateTodayData,
  generateTrendData,
  generateCityRanking,
  generateTodos,
  generateStats
} = require('./dataGenerator');
const {
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_LEVELS,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementVersion
} = require('./announcement');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
  const data = generateStats(city, store, startDate, endDate);
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
    days = Math.min(90, getDaysBetween(startDate, endDate));
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

app.get('/api/announcements', (req, res) => {
  const result = getAnnouncements(req.query);
  res.json({ code: 0, data: result, message: 'success' });
});

app.post('/api/announcements', (req, res) => {
  const result = createAnnouncement(req.body);
  if (result.error) {
    return res.json({ code: result.code, message: result.error });
  }
  res.json({ code: 0, data: result.data, message: '公告创建成功' });
});

app.put('/api/announcements/:id', (req, res) => {
  const result = updateAnnouncement(req.params.id, req.body);
  if (result.error) {
    return res.json({ code: result.code, message: result.error });
  }
  res.json({ code: 0, data: result.data, message: '公告更新成功' });
});

app.delete('/api/announcements/:id', (req, res) => {
  const result = deleteAnnouncement(req.params.id);
  if (result.error) {
    return res.json({ code: result.code, message: result.error });
  }
  res.json({ code: 0, message: '公告删除成功' });
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

app.get('/api/announcements/version', (req, res) => {
  res.json({
    code: 0,
    data: getAnnouncementVersion(),
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
