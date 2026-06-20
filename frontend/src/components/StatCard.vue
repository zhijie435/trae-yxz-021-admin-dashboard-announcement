<template>
  <div class="stat-card" :style="{ '--card-color': color }">
    <div class="card-glow"></div>
    <div class="card-icon">
      <span>{{ icon }}</span>
    </div>
    <div class="card-content">
      <div class="card-label">{{ label }}</div>
      <div class="card-value">
        <span class="prefix" v-if="prefix">{{ prefix }}</span>
        <span class="number">{{ formattedValue }}</span>
        <span class="unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="card-today">
        <span class="today-label">今日新增</span>
        <span class="today-value">
          <span class="prefix" v-if="prefix">{{ prefix }}</span>
          +{{ formattedToday }}
          <span class="unit" v-if="unit">{{ unit }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  todayValue: { type: [Number, String], default: 0 },
  icon: { type: String, default: '📊' },
  color: { type: String, default: '#00d4ff' },
  prefix: { type: String, default: '' },
  unit: { type: String, default: '' }
});

const formatNumber = (num) => {
  const n = Number(num);
  if (isNaN(n)) return num;
  if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString('zh-CN');
};

const formattedValue = computed(() => formatNumber(props.value));
const formattedToday = computed(() => formatNumber(props.todayValue));
</script>

<style scoped>
.stat-card {
  position: relative;
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 28px 32px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 212, 255, 0.08);
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--card-color) 0%, transparent 70%);
  opacity: 0.08;
  pointer-events: none;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--card-color), color-mix(in srgb, var(--card-color) 50%, transparent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--card-color) 30%, transparent);
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 16px;
}

.card-value .prefix,
.card-value .unit {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.card-value .number {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.75));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.card-today {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.today-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.today-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--card-color);
  letter-spacing: 0.3px;
}
</style>
