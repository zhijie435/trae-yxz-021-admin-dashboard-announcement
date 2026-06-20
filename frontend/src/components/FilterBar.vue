<template>
  <div class="filter-bar">
    <div class="filter-row">
      <div class="filter-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        数据筛选
      </div>

      <div class="filter-item">
        <span class="item-label">城市</span>
        <div class="select-wrapper">
          <select
            :value="city"
            @change="handleCityChange"
            class="filter-select"
          >
            <option value="">全部城市</option>
            <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name }}</option>
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </div>

      <div class="filter-item">
        <span class="item-label">门店</span>
        <div class="select-wrapper">
          <select
            :value="store"
            @change="handleStoreChange"
            class="filter-select"
            :disabled="!city && stores.length === 0"
          >
            <option value="">全部门店</option>
            <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </div>

      <div class="filter-item time-range">
        <span class="item-label">时间范围</span>
        <div class="time-quick-tabs">
          <div
            v-for="opt in timeOptions"
            :key="opt.value"
            class="time-tab"
            :class="{ active: timeRange === opt.value }"
            @click="handleTimeChange(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>

      <div v-if="timeRange === 'custom'" class="filter-item date-range">
        <div class="date-input-group">
          <input
            type="date"
            :value="startDate"
            @change="handleStartDateChange"
            class="date-input"
          />
          <span class="date-sep">至</span>
          <input
            type="date"
            :value="endDate"
            @change="handleEndDateChange"
            class="date-input"
          />
        </div>
      </div>

      <div class="filter-actions">
        <div class="reset-btn" @click="handleReset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          重置
        </div>
      </div>
    </div>

    <div v-if="hasActiveFilter" class="active-filter-bar">
      <span class="active-label">当前筛选：</span>
      <span v-if="city" class="filter-tag">
        {{ cityName }}
        <span class="tag-close" @click="clearCity">×</span>
      </span>
      <span v-if="store" class="filter-tag">
        {{ storeName }}
        <span class="tag-close" @click="clearStore">×</span>
      </span>
      <span v-if="timeRange !== '14d'" class="filter-tag">
        {{ timeRangeLabel }}
        <span class="tag-close" @click="clearTimeRange">×</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { getCityList, getStoreList } from '../api';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ city: '', store: '', timeRange: '14d', startDate: '', endDate: '' })
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const cities = reactive([]);
const stores = reactive([]);
const loading = ref(false);

const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '近7天', value: '7d' },
  { label: '近14天', value: '14d' },
  { label: '近30天', value: '30d' },
  { label: '自定义', value: 'custom' }
];

const city = computed({
  get: () => props.modelValue.city || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, city: val })
});

const store = computed({
  get: () => props.modelValue.store || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, store: val })
});

const timeRange = computed({
  get: () => props.modelValue.timeRange || '14d',
  set: (val) => emit('update:modelValue', { ...props.modelValue, timeRange: val })
});

const startDate = computed({
  get: () => props.modelValue.startDate || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, startDate: val })
});

const endDate = computed({
  get: () => props.modelValue.endDate || '',
  set: (val) => emit('update:modelValue', { ...props.modelValue, endDate: val })
});

const cityName = computed(() => {
  const c = cities.find(x => x.code === city.value);
  return c ? c.name : '';
});

const storeName = computed(() => {
  const s = stores.find(x => x.id === store.value);
  return s ? s.name : '';
});

const timeRangeLabel = computed(() => {
  const opt = timeOptions.find(o => o.value === timeRange.value);
  if (opt && timeRange.value !== 'custom') return opt.label;
  if (timeRange.value === 'custom' && startDate.value && endDate.value) {
    return `${startDate.value} 至 ${endDate.value}`;
  }
  return '自定义';
});

const hasActiveFilter = computed(() => {
  return city.value || store.value || timeRange.value !== '14d';
});

const loadCities = async () => {
  try {
    const res = await getCityList();
    if (res.code === 0) {
      cities.splice(0, cities.length, ...res.data);
    }
  } catch (e) { console.error(e); }
};

const loadStores = async (cityCode) => {
  if (!cityCode) {
    stores.splice(0, stores.length);
    return;
  }
  try {
    const res = await getStoreList(cityCode);
    if (res.code === 0) {
      stores.splice(0, stores.length, ...res.data);
    }
  } catch (e) { console.error(e); }
};

const handleCityChange = (e) => {
  const val = e.target.value;
  const newValue = { ...props.modelValue, city: val, store: '' };
  emit('update:modelValue', newValue);
  loadStores(val);
  emitChangeWithValue(newValue);
};

const handleStoreChange = (e) => {
  store.value = e.target.value;
  emitChange();
};

const handleTimeChange = (val) => {
  timeRange.value = val;
  if (val !== 'custom') {
    emitChange();
  }
};

const handleStartDateChange = (e) => {
  startDate.value = e.target.value;
  if (startDate.value && endDate.value) {
    emitChange();
  }
};

const handleEndDateChange = (e) => {
  endDate.value = e.target.value;
  if (startDate.value && endDate.value) {
    emitChange();
  }
};

const emitChange = () => {
  const params = {};
  if (city.value) params.city = city.value;
  if (store.value) params.store = store.value;
  if (timeRange.value === 'custom' && startDate.value && endDate.value) {
    params.startDate = startDate.value;
    params.endDate = endDate.value;
  }
  emit('change', params);
};

const emitChangeWithValue = (val) => {
  const params = {};
  if (val.city) params.city = val.city;
  if (val.store) params.store = val.store;
  if (val.timeRange === 'custom' && val.startDate && val.endDate) {
    params.startDate = val.startDate;
    params.endDate = val.endDate;
  }
  emit('change', params);
};

const handleReset = () => {
  const newValue = { city: '', store: '', timeRange: '14d', startDate: '', endDate: '' };
  emit('update:modelValue', newValue);
  stores.splice(0, stores.length);
  emitChangeWithValue(newValue);
};

const clearCity = () => {
  const newValue = { ...props.modelValue, city: '', store: '' };
  emit('update:modelValue', newValue);
  stores.splice(0, stores.length);
  emitChangeWithValue(newValue);
};

const clearStore = () => {
  const newValue = { ...props.modelValue, store: '' };
  emit('update:modelValue', newValue);
  emitChangeWithValue(newValue);
};

const clearTimeRange = () => {
  const newValue = { ...props.modelValue, timeRange: '14d', startDate: '', endDate: '' };
  emit('update:modelValue', newValue);
  emitChangeWithValue(newValue);
};

onMounted(async () => {
  await loadCities();
  if (props.modelValue.city) {
    await loadStores(props.modelValue.city);
  }
});

watch(() => props.modelValue.city, (newVal) => {
  if (newVal && cities.length > 0 && !stores.length) {
    loadStores(newVal);
  }
});
</script>

<style scoped>
.filter-bar {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.9), rgba(10, 18, 32, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 18px 24px;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  font-weight: 500;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  padding: 9px 36px 9px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  appearance: none;
  min-width: 120px;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-select:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
}

.filter-select:focus {
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-select option {
  background: #141e32;
  color: #fff;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
}

.time-range {
  flex: 1;
  min-width: 0;
}

.time-quick-tabs {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}

.time-tab {
  padding: 7px 14px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
}

.time-tab:hover {
  color: rgba(255, 255, 255, 0.8);
}

.time-tab.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 92, 255, 0.2));
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.15);
}

.date-range {
  flex: none;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12.5px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  color-scheme: dark;
}

.date-input:hover {
  border-color: rgba(0, 212, 255, 0.3);
}

.date-input:focus {
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.date-sep {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.4);
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.reset-btn:hover {
  color: #ff6b9d;
  border-color: rgba(255, 107, 157, 0.3);
  background: rgba(255, 107, 157, 0.08);
}

.active-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.active-label {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.45);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.tag-close {
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
  line-height: 1;
  transition: opacity 0.2s;
}

.tag-close:hover {
  opacity: 1;
}

@media (max-width: 900px) {
  .filter-row { gap: 14px; }
  .time-range { width: 100%; flex: none; }
  .time-quick-tabs { flex: 1; justify-content: space-between; }
  .time-tab { flex: 1; text-align: center; padding: 7px 8px; font-size: 12px; }
  .filter-actions { margin-left: 0; width: 100%; }
  .reset-btn { flex: 1; justify-content: center; }
}
</style>
