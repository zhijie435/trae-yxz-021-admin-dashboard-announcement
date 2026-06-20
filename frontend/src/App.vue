<template>
  <div class="dashboard">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-grid"></div>

    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">
          <span class="title-icon">📊</span>
          数据大盘
        </h1>
        <p class="dashboard-subtitle">实时监控 · 业务全景</p>
      </div>
      <div class="header-right">
        <div class="refresh-btn" :class="{ spinning: loading }" @click="fetchData">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>刷新数据</span>
        </div>
        <div class="status-indicator" :class="{ online: !error }">
          <span class="dot"></span>
          <span class="status-text">{{ error ? '连接异常' : '实时在线' }}</span>
        </div>
        <div class="update-time" v-if="stats.updatedAt">
          更新于 {{ formatTime(stats.updatedAt) }}
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="content-wrap">
        <FilterBar v-model="filterState" @change="handleFilterChange" />

        <section class="stats-section">
          <div class="stats-grid">
            <StatCard
              label="累计用户"
              :value="stats.totalUsers"
              :today-value="stats.todayUsers"
              icon="👥"
              color="#00d4ff"
            />
            <StatCard
              label="累计订单"
              :value="stats.totalOrders"
              :today-value="stats.todayOrders"
              icon="📦"
              color="#7c5cff"
            />
            <StatCard
              label="累计营收"
              :value="stats.totalRevenue"
              :today-value="stats.todayRevenue"
              icon="💰"
              color="#ff6b9d"
              prefix="¥"
            />
            <StatCard
              label="门店数"
              :value="stats.totalStores"
              :today-value="stats.todayStores"
              icon="🏪"
              color="#32d583"
            />
          </div>
        </section>

        <TodayData :filter-params="filterParams" />

        <div class="two-col-row">
          <div class="col-left">
            <TrendChart :filter-params="filterParams" />
            <CityRanking :filter-params="filterParams" />
          </div>
          <div class="col-right">
            <TodoReminder :filter-params="filterParams" />
          </div>
        </div>

        <AnnouncementPanel />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import StatCard from './components/StatCard.vue';
import TodayData from './components/TodayData.vue';
import TrendChart from './components/TrendChart.vue';
import CityRanking from './components/CityRanking.vue';
import TodoReminder from './components/TodoReminder.vue';
import AnnouncementPanel from './components/AnnouncementPanel.vue';
import FilterBar from './components/FilterBar.vue';
import { getDashboardStats } from './api';

const loading = ref(false);
const error = ref(false);
const stats = reactive({
  totalUsers: 0,
  todayUsers: 0,
  totalOrders: 0,
  todayOrders: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  totalStores: 0,
  todayStores: 0,
  updatedAt: null
});

const filterState = ref({
  city: '',
  store: '',
  timeRange: '14d',
  startDate: '',
  endDate: ''
});

const filterParams = computed(() => {
  const params = {};
  const state = filterState.value;
  if (state.city) params.city = state.city;
  if (state.store) params.store = state.store;
  if (state.timeRange === 'custom' && state.startDate && state.endDate) {
    params.startDate = state.startDate;
    params.endDate = state.endDate;
  }
  return params;
});

let timer = null;

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getDashboardStats(filterParams.value);
    if (res.code === 0) {
      Object.assign(stats, res.data);
      error.value = false;
    }
  } catch (e) {
    console.error('获取数据失败:', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  fetchData();
};

const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

onMounted(() => {
  fetchData();
  timer = setInterval(fetchData, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.dashboard {
  position: relative;
  min-height: 100vh;
  background: #0a0f1e;
  color: #ffffff;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #00d4ff;
  top: -200px;
  left: -150px;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #7c5cff;
  bottom: -150px;
  right: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.1); }
}

.dashboard-header {
  position: relative;
  z-index: 10;
  padding: 36px 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: linear-gradient(180deg, rgba(10, 15, 30, 0.6) 0%, transparent 100%);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 28px;
  -webkit-text-fill-color: initial;
}

.dashboard-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 3px;
  margin-left: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.15);
}

.refresh-btn svg {
  transition: transform 0.4s ease;
}

.refresh-btn.spinning svg {
  animation: spin 0.8s linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255, 107, 107, 0.85);
}

.status-indicator.online {
  background: rgba(50, 213, 131, 0.08);
  border-color: rgba(50, 213, 131, 0.2);
  color: rgba(50, 213, 131, 0.85);
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.update-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}

.dashboard-main {
  position: relative;
  z-index: 5;
  padding: 48px 56px;
}

.content-wrap {
  max-width: 1600px;
  margin: 0 auto;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.two-col-row {
  display: grid;
  grid-template-columns: 1.65fr 1fr;
  gap: 24px;
}

.col-left,
.col-right {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .two-col-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-header {
    padding: 24px;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
  .dashboard-main {
    padding: 24px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
