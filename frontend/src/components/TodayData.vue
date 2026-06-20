<template>
  <div class="today-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        今日实时数据
      </h2>
      <div class="current-date">{{ todayDate }}</div>
    </div>
    <div class="today-cards">
      <div class="today-card" :style="{ '--accent': '#00d4ff' }">
        <div class="today-card-header">
          <div class="today-icon-wrap">
            <span class="today-icon">📦</span>
          </div>
          <div class="trend-tag" :class="orderTrend > 0 ? 'up' : 'down'">
            {{ orderTrend > 0 ? '↑' : '↓' }} {{ Math.abs(orderTrend) }}%
          </div>
        </div>
        <div class="today-metric">
          <span class="metric-label">今日订单</span>
          <span class="metric-value">{{ formatNumber(data.orders.total) }}</span>
          <span class="metric-unit">单</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: data.orders.rate + '%' }"></div>
          </div>
          <div class="progress-meta">
            <span>目标 {{ formatNumber(data.orders.goal) }}</span>
            <span>{{ data.orders.rate }}%</span>
          </div>
        </div>
        <div class="hourly-chart">
          <div class="hourly-label">每小时分布</div>
          <div class="hourly-bars">
            <div
              v-for="(v, i) in data.orders.hourly"
              :key="'o'+i"
              class="hourly-bar"
              :style="{ height: getBarHeight(v, data.orders.hourly) + '%' }"
              :title="(data.orders.hourly[i] && data.orders.hourly[i] + '单')"
            ></div>
          </div>
        </div>
      </div>

      <div class="today-card" :style="{ '--accent': '#ff6b9d' }">
        <div class="today-card-header">
          <div class="today-icon-wrap">
            <span class="today-icon">💰</span>
          </div>
          <div class="trend-tag" :class="revenueTrend > 0 ? 'up' : 'down'">
            {{ revenueTrend > 0 ? '↑' : '↓' }} {{ Math.abs(revenueTrend) }}%
          </div>
        </div>
        <div class="today-metric">
          <span class="metric-label">今日收入</span>
          <span class="metric-prefix">¥</span>
          <span class="metric-value">{{ formatRevenue(data.revenue.total) }}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: data.revenue.rate + '%' }"></div>
          </div>
          <div class="progress-meta">
            <span>目标 ¥{{ formatRevenue(data.revenue.goal) }}</span>
            <span>{{ data.revenue.rate }}%</span>
          </div>
        </div>
        <div class="hourly-chart">
          <div class="hourly-label">每小时分布</div>
          <div class="hourly-bars">
            <div
              v-for="(v, i) in data.revenue.hourly"
              :key="'r'+i"
              class="hourly-bar"
              :style="{ height: getBarHeight(v, data.revenue.hourly) + '%' }"
              :title="'¥' + (data.revenue.hourly[i] || 0)"
            ></div>
          </div>
        </div>
      </div>

      <div class="today-card" :style="{ '--accent': '#32d583' }">
        <div class="today-card-header">
          <div class="today-icon-wrap">
            <span class="today-icon">👥</span>
          </div>
          <div class="trend-tag" :class="userTrend > 0 ? 'up' : 'down'">
            {{ userTrend > 0 ? '↑' : '↓' }} {{ Math.abs(userTrend) }}%
          </div>
        </div>
        <div class="today-metric">
          <span class="metric-label">新增用户</span>
          <span class="metric-value">{{ formatNumber(data.newUsers.total) }}</span>
          <span class="metric-unit">人</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: data.newUsers.rate + '%' }"></div>
          </div>
          <div class="progress-meta">
            <span>目标 {{ formatNumber(data.newUsers.goal) }}</span>
            <span>{{ data.newUsers.rate }}%</span>
          </div>
        </div>
        <div class="hourly-chart">
          <div class="hourly-label">每小时分布</div>
          <div class="hourly-bars">
            <div
              v-for="(v, i) in data.newUsers.hourly"
              :key="'u'+i"
              class="hourly-bar"
              :style="{ height: getBarHeight(v, data.newUsers.hourly) + '%' }"
              :title="(data.newUsers.hourly[i] || 0) + '人'"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue';
import { getDashboardToday } from '../api';

const data = reactive({
  orders: { total: 0, goal: 500, rate: 0, hourly: [] },
  revenue: { total: 0, goal: 150000, rate: 0, hourly: [] },
  newUsers: { total: 0, goal: 600, rate: 0, hourly: [] }
});

const todayDate = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
});

const orderTrend = computed(() => +(Math.random() * 30 - 5).toFixed(1));
const revenueTrend = computed(() => +(Math.random() * 35 - 5).toFixed(1));
const userTrend = computed(() => +(Math.random() * 25 - 5).toFixed(1));

const formatNumber = (n) => Number(n).toLocaleString('zh-CN');
const formatRevenue = (n) => {
  const num = Number(n);
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString('zh-CN');
};
const getBarHeight = (v, arr) => {
  const max = Math.max(...arr, 1);
  return Math.max((v / max) * 100, 4);
};

onMounted(async () => {
  try {
    const res = await getDashboardToday();
    if (res.code === 0) Object.assign(data, res.data);
  } catch (e) { console.error(e); }
});
</script>

<style scoped>
.today-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.5px;
}

.title-bar {
  width: 4px;
  height: 22px;
  background: linear-gradient(180deg, #00d4ff, #7c5cff);
  border-radius: 4px;
}

.current-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
}

.today-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.today-card {
  position: relative;
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 24px 28px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.today-card::before {
  content: '';
  position: absolute;
  top: -60%;
  right: -20%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  opacity: 0.07;
  pointer-events: none;
}

.today-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.45), 0 0 30px color-mix(in srgb, var(--accent) 10%, transparent);
}

.today-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.today-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 45%, transparent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 25%, transparent);
}

.trend-tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.trend-tag.up {
  background: rgba(50, 213, 131, 0.12);
  color: #32d583;
  border: 1px solid rgba(50, 213, 131, 0.25);
}

.trend-tag.down {
  background: rgba(255, 107, 107, 0.12);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.25);
}

.today-metric {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 18px;
}

.metric-label {
  position: absolute;
  top: -9999px;
  opacity: 0;
}

.metric-value {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.metric-prefix {
  font-size: 18px;
  color: var(--accent);
  font-weight: 600;
  margin-right: 2px;
}

.metric-unit {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.progress-wrap {
  margin-bottom: 20px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #fff));
  border-radius: 10px;
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: width 0.8s ease;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3px;
}

.hourly-chart {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.hourly-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.hourly-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 50px;
}

.hourly-bar {
  flex: 1;
  min-width: 3px;
  background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 30%, transparent));
  border-radius: 3px 3px 0 0;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.hourly-bar:hover {
  opacity: 1;
}

@media (max-width: 900px) {
  .today-cards { grid-template-columns: 1fr; }
}
</style>
