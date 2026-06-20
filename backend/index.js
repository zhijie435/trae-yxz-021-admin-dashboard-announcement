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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`数据大盘后端服务已启动: http://localhost:${PORT}`);
  console.log(`统计数据接口: http://localhost:${PORT}/api/dashboard/stats`);
});
