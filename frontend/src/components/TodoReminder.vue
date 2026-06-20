<template>
  <div class="todo-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        待处理事项
        <span v-if="summary.totalCount > 0" class="badge">{{ summary.totalCount }}</span>
        <span v-if="summary.urgentCount > 0" class="badge urgent">紧急 {{ summary.urgentCount }}</span>
      </h2>
      <div class="view-all">
        查看全部 →
      </div>
    </div>
    <div class="todo-card">
      <div class="todo-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="todo-item"
          :class="'type-' + item.type"
          :style="{ '--item-color': item.color }"
          @click="handleClick(item)"
        >
          <div class="todo-icon-wrap">
            <span class="todo-icon">{{ item.icon }}</span>
            <span v-if="item.type === 'urgent'" class="pulse-dot"></span>
          </div>
          <div class="todo-content">
            <div class="todo-title-row">
              <span class="todo-title">{{ item.title }}</span>
              <span class="todo-count">{{ item.count }}</span>
            </div>
            <div class="todo-desc">{{ item.desc }}</div>
          </div>
          <div class="todo-right">
            <span class="todo-time">{{ item.time }}</span>
            <span class="todo-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { getDashboardTodos } from '../api';

const props = defineProps({
  filterParams: {
    type: Object,
    default: () => ({})
  }
});

const items = reactive([]);
const summary = reactive({ totalCount: 0, urgentCount: 0 });

const handleClick = (item) => {
  console.log('处理事项:', item.title);
};

const fetchData = async () => {
  try {
    const res = await getDashboardTodos(props.filterParams);
    if (res.code === 0) {
      items.splice(0, items.length, ...res.data.items);
      summary.totalCount = res.data.totalCount;
      summary.urgentCount = res.data.urgentCount;
    }
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
.todo-section {
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

.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.25);
  letter-spacing: 0;
}

.badge.urgent {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.25);
  animation: urgent-pulse 2s ease-in-out infinite;
}

@keyframes urgent-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(255, 107, 107, 0); }
}

.view-all {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: color 0.2s;
  letter-spacing: 0.3px;
}

.view-all:hover {
  color: rgba(0, 212, 255, 0.9);
}

.todo-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.todo-list {
  display: flex;
  flex-direction: column;
}

.todo-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid var(--item-color);
}

.todo-item + .todo-item {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.todo-item:hover {
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(2px);
}

.todo-icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--item-color) 25%, transparent), color-mix(in srgb, var(--item-color) 8%, transparent));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--item-color) 25%, transparent);
}

.todo-icon {
  font-size: 22px;
}

.pulse-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: #ff6b6b;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(10, 15, 30, 0.95);
  animation: pulse-ring 1.5s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 3px rgba(10,15,30,0.95), 0 0 0 0 rgba(255,107,107,0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 3px rgba(10,15,30,0.95), 0 0 0 8px rgba(255,107,107,0); }
}

.todo-content {
  min-width: 0;
}

.todo-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.todo-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
}

.todo-count {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: color-mix(in srgb, var(--item-color) 15%, transparent);
  color: var(--item-color);
  font-variant-numeric: tabular-nums;
}

.todo-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.todo-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.todo-arrow {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.2s;
}

.todo-item:hover .todo-arrow {
  color: var(--item-color);
  transform: translateX(2px);
}
</style>
