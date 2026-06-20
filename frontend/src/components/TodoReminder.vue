<template>
  <div class="todo-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        待处理事项
        <span v-if="summary.totalCount > 0" class="badge">{{ summary.totalCount }}</span>
        <span v-if="summary.urgentCount > 0" class="badge urgent">紧急 {{ summary.urgentCount }}</span>
      </h2>
      <div class="view-all" @click="handleViewAll">
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
            <span v-if="item.urgent || item.type === 'urgent'" class="pulse-dot"></span>
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
            <span class="todo-action-btn">处理</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { getDashboardTodos } from '../api';

const emit = defineEmits(['navigate']);

const props = defineProps({
  filterParams: {
    type: Object,
    default: () => ({})
  }
});

const items = reactive([]);
const summary = reactive({ totalCount: 0, urgentCount: 0 });

const toast = reactive({
  show: false,
  message: '',
  type: 'info'
});

const showToast = (message, type = 'info') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => { toast.show = false; }, 2500);
};

const actionRouteMap = {
  goProductAudit: { name: '商品审核管理', path: '/product/audit' },
  goFranchiseeAudit: { name: '加盟商审核管理', path: '/franchisee/audit' },
  goWithdrawAudit: { name: '提现审核管理', path: '/finance/withdraw' },
  goAftersale: { name: '售后工单管理', path: '/aftersale/list' },
  goOrderAudit: { name: '异常订单管理', path: '/order/abnormal' },
  goFeedback: { name: '用户反馈管理', path: '/feedback/list' }
};

const handleClick = (item) => {
  const route = actionRouteMap[item.action];
  if (route) {
    emit('navigate', { ...route, category: item.category, item });
    showToast(`正在跳转到【${route.name}】...`, 'info');
  } else {
    showToast(`打开【${item.title}】处理页面`, 'info');
  }
};

const handleViewAll = () => {
  showToast('跳转到待处理事项列表页面', 'info');
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

.todo-item:hover .todo-action-btn {
  color: #fff;
  background: var(--item-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--item-color) 35%, transparent);
  transform: scale(1.05);
}

.todo-action-btn {
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--item-color);
  background: color-mix(in srgb, var(--item-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--item-color) 25%, transparent);
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
}

.todo-section {
  position: relative;
}

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: rgba(15, 25, 45, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  backdrop-filter: blur(12px);
  animation: toast-in 0.3s ease;
}

.toast.info {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
}

.toast.success {
  border-color: rgba(50, 213, 131, 0.4);
  box-shadow: 0 8px 32px rgba(50, 213, 131, 0.2);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 900px) {
  .todo-item { grid-template-columns: 44px 1fr auto; }
}
</style>
