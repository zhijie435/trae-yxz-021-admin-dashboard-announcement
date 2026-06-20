<template>
  <div class="city-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        城市数据排行
      </h2>
      <div class="sort-tabs">
        <div
          v-for="s in sortTypes"
          :key="s.value"
          class="sort-tab"
          :class="{ active: sortBy === s.value }"
          @click="sortBy = s.value"
        >
          {{ s.label }}
        </div>
      </div>
    </div>
    <div class="city-card">
      <div class="city-list-header">
        <div class="col-rank">排名</div>
        <div class="col-city">城市</div>
        <div class="col-metric">
          {{ getSortLabel() }}
        </div>
        <div class="col-growth">同比</div>
        <div class="col-bar">占比</div>
      </div>
      <div class="city-list">
        <div
          v-for="(city, idx) in sortedCities"
          :key="city.code"
          class="city-item"
          :class="'rank-' + (idx + 1)"
        >
          <div class="col-rank">
            <span class="rank-badge" :class="'top-' + (idx + 1)">{{ idx + 1 }}</span>
          </div>
          <div class="col-city">
            <div class="city-flag">{{ city.code }}</div>
            <div class="city-name">{{ city.name }}</div>
          </div>
          <div class="col-metric">
            <span class="metric-num">{{ formatMetric(city) }}</span>
            <span class="metric-sub">{{ formatSub(city) }}</span>
          </div>
          <div class="col-growth">
            <span class="growth-tag" :class="city.growth >= 0 ? 'up' : 'down'">
              {{ city.growth >= 0 ? '+' : '' }}{{ city.growth }}%
            </span>
          </div>
          <div class="col-bar">
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: getBarWidth(city) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { getDashboardCities } from '../api';

const props = defineProps({
  filterParams: {
    type: Object,
    default: () => ({})
  }
});

const cities = reactive([]);
const sortBy = ref('revenue');
const sortTypes = [
  { label: '营收', value: 'revenue' },
  { label: '订单', value: 'orders' },
  { label: '用户', value: 'users' }
];

const sortedCities = computed(() =>
  [...cities].sort((a, b) => b[sortBy.value] - a[sortBy.value]).slice(0, 10)
);

const maxValue = computed(() =>
  sortedCities.value.reduce((m, c) => Math.max(m, c[sortBy.value]), 0)
);

const getSortLabel = () => {
  const map = { revenue: '营收', orders: '订单数', users: '用户数' };
  return map[sortBy.value];
};

const formatMetric = (city) => {
  if (sortBy.value === 'revenue') {
    return '¥' + (city.revenue / 10000).toFixed(1) + '万';
  }
  if (sortBy.value === 'orders') {
    return city.orders.toLocaleString('zh-CN') + ' 单';
  }
  return city.users.toLocaleString('zh-CN') + ' 人';
};

const formatSub = (city) => {
  if (sortBy.value === 'revenue') {
    return city.orders.toLocaleString() + '单';
  }
  if (sortBy.value === 'orders') {
    return '¥' + (city.revenue / 10000).toFixed(0) + '万';
  }
  return city.orders.toLocaleString() + '单';
};

const getBarWidth = (city) => {
  if (!maxValue.value) return 0;
  return Math.max((city[sortBy.value] / maxValue.value) * 100, 3);
};

const fetchData = async () => {
  try {
    const res = await getDashboardCities(props.filterParams);
    if (res.code === 0) cities.splice(0, cities.length, ...res.data.ranking);
  } catch (e) { console.error(e); }
};

watch(() => props.filterParams, () => {
  fetchData();
}, { deep: true });

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.city-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
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

.sort-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.sort-tab {
  padding: 7px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.sort-tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.sort-tab.active {
  background: linear-gradient(135deg, rgba(124, 92, 255, 0.25), rgba(255, 107, 157, 0.25));
  color: #fff;
  box-shadow: 0 2px 8px rgba(124, 92, 255, 0.2);
}

.city-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 20px 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.city-list-header,
.city-item {
  display: grid;
  grid-template-columns: 80px 120px 1fr 100px 160px;
  align-items: center;
  gap: 16px;
}

.city-list-header {
  padding: 8px 16px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 6px;
}

.city-item {
  padding: 14px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.city-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}

.rank-badge.top-1 {
  background: linear-gradient(135deg, #ffd700, #ff9f1a);
  color: #0a0f1e;
  box-shadow: 0 4px 12px rgba(255, 180, 0, 0.3);
}

.rank-badge.top-2 {
  background: linear-gradient(135deg, #c0c0c0, #8a8a8a);
  color: #0a0f1e;
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
}

.rank-badge.top-3 {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
  color: #fff;
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

.col-city {
  display: flex;
  align-items: center;
  gap: 12px;
}

.city-flag {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,92,255,0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.city-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.col-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-num {
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  font-variant-numeric: tabular-nums;
}

.metric-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.growth-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.growth-tag.up {
  background: rgba(50, 213, 131, 0.1);
  color: #32d583;
  border: 1px solid rgba(50, 213, 131, 0.2);
}

.growth-tag.down {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #7c5cff, #ff6b9d);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

@media (max-width: 900px) {
  .city-list-header,
  .city-item {
    grid-template-columns: 60px 90px 1fr 80px 100px;
    gap: 10px;
  }
  .city-list-header .col-bar, .city-item .col-bar { display: none; }
}
</style>
