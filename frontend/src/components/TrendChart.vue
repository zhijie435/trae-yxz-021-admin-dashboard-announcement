<template>
  <div class="trend-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        运营数据趋势
      </h2>
      <div class="period-tabs">
        <div
          v-for="p in periods"
          :key="p.value"
          class="period-tab"
          :class="{ active: period === p.value }"
          @click="switchPeriod(p.value)"
        >
          {{ p.label }}
        </div>
      </div>
    </div>
    <div class="trend-chart-wrap">
      <div ref="chartRef" class="trend-chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getDashboardTrend } from '../api';
import {
  CHART_COLORS,
  createAreaGradient,
  createBarGradient,
  defaultTooltip,
  defaultLegend,
  defaultGrid,
  defaultXAxis,
  createYAxis,
  createLineSeries,
  createBarSeries,
  hexToRgba
} from '../utils';

const props = defineProps({
  filterParams: {
    type: Object,
    default: () => ({})
  }
});

const chartRef = ref(null);
const period = ref('14d');
const periods = [
  { label: '近14天', value: '14d' },
  { label: '近30天', value: '30d' }
];

let chartInstance = null;
let resizeObserver = null;

const buildChartOption = (data) => {
  const ordersColor = CHART_COLORS.primary;
  const revenueColor = CHART_COLORS.accent;
  const usersColor = CHART_COLORS.success;

  return {
    backgroundColor: 'transparent',
    tooltip: { ...defaultTooltip },
    legend: {
      ...defaultLegend,
      data: ['订单数', '营收（万元）', '新增用户']
    },
    grid: { ...defaultGrid },
    xAxis: {
      ...defaultXAxis,
      data: data.dates
    },
    yAxis: [
      createYAxis({ name: '数量' }),
      createYAxis({
        name: '营收',
        splitLine: { show: false },
        axisLabel: { formatter: '{value}万' }
      })
    ],
    series: [
      createLineSeries({
        name: '订单数',
        data: data.orders,
        yAxisIndex: 0,
        lineStyle: {
          width: 3,
          color: ordersColor,
          shadowColor: hexToRgba(ordersColor, 0.35),
          shadowBlur: 10
        },
        itemStyle: { color: ordersColor },
        areaStyle: {
          color: createAreaGradient(hexToRgba(ordersColor), 0.35)
        }
      }),
      createBarSeries({
        name: '营收（万元）',
        yAxisIndex: 1,
        data: data.revenue.map(v => +(v / 10000).toFixed(2)),
        itemStyle: {
          color: createBarGradient(revenueColor)
        }
      }),
      createLineSeries({
        name: '新增用户',
        data: data.newUsers,
        yAxisIndex: 0,
        lineStyle: {
          width: 3,
          color: usersColor,
          shadowColor: hexToRgba(usersColor, 0.35),
          shadowBlur: 10
        },
        itemStyle: { color: usersColor },
        areaStyle: {
          color: createAreaGradient(hexToRgba(usersColor), 0.25)
        }
      })
    ]
  };
};

const initChart = async () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);

  resizeObserver = new ResizeObserver(() => {
    chartInstance && chartInstance.resize();
  });
  resizeObserver.observe(chartRef.value);

  await loadData();
};

const loadData = async () => {
  try {
    const params = { period: period.value, ...props.filterParams };
    const res = await getDashboardTrend(params);
    if (res.code === 0 && chartInstance) {
      chartInstance.setOption(buildChartOption(res.data), true);
    }
  } catch (e) {
    console.error('加载趋势数据失败:', e);
  }
};

const handleResize = () => {
  chartInstance && chartInstance.resize();
};

const switchPeriod = (p) => {
  if (period.value === p) return;
  period.value = p;
  loadData();
};

watch(
  () => props.filterParams,
  () => {
    loadData();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.trend-section {
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

.period-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.period-tab {
  padding: 7px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.period-tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.period-tab.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(124, 92, 255, 0.25));
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
}

.trend-chart-wrap {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.trend-chart {
  width: 100%;
  height: 380px;
}
</style>
