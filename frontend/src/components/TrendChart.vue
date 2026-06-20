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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getDashboardTrend } from '../api';

const chartRef = ref(null);
const period = ref('14d');
const periods = [
  { label: '近14天', value: '14d' },
  { label: '近30天', value: '30d' }
];
let chartInstance = null;

const buildOption = (data) => {
  const gridColor = 'rgba(255, 255, 255, 0.05)';
  const textColor = 'rgba(255, 255, 255, 0.55)';
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 25, 45, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#fff', fontSize: 13 },
      axisPointer: { type: 'cross', lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    legend: {
      data: ['订单数', '营收（万元）', '新增用户'],
      top: 0,
      right: 0,
      itemGap: 28,
      textStyle: { color: textColor, fontSize: 13 },
      itemWidth: 14,
      itemHeight: 8,
      icon: 'roundRect'
    },
    grid: {
      left: 40,
      right: 40,
      top: 60,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: gridColor } },
      axisTick: { show: false },
      axisLabel: {
        color: textColor,
        fontSize: 12,
        margin: 16
      },
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        nameTextStyle: { color: textColor, padding: [0, 0, 0, 20] },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontSize: 12 },
        splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
      },
      {
        type: 'value',
        name: '营收',
        nameTextStyle: { color: textColor },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: textColor, fontSize: 12, formatter: '{value}万' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        data: data.orders,
        yAxisIndex: 0,
        lineStyle: { width: 3, color: '#00d4ff', shadowColor: 'rgba(0,212,255,0.35)', shadowBlur: 10 },
        itemStyle: { color: '#00d4ff', borderColor: '#0a0f1e', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,212,255,0.35)' },
            { offset: 1, color: 'rgba(0,212,255,0.01)' }
          ])
        },
        emphasis: { focus: 'series', scale: 1.3 }
      },
      {
        name: '营收（万元）',
        type: 'bar',
        yAxisIndex: 1,
        data: data.revenue.map(v => +(v / 10000).toFixed(2)),
        barWidth: 10,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff6b9d' },
            { offset: 1, color: 'rgba(255,107,157,0.2)' }
          ])
        }
      },
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        data: data.newUsers,
        yAxisIndex: 0,
        lineStyle: { width: 3, color: '#32d583', shadowColor: 'rgba(50,213,131,0.35)', shadowBlur: 10 },
        itemStyle: { color: '#32d583', borderColor: '#0a0f1e', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(50,213,131,0.25)' },
            { offset: 1, color: 'rgba(50,213,131,0.01)' }
          ])
        },
        emphasis: { focus: 'series', scale: 1.3 }
      }
    ]
  };
};

const initChart = async () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  await loadData();
  window.addEventListener('resize', handleResize);
};

const loadData = async () => {
  try {
    const res = await getDashboardTrend(period.value);
    if (res.code === 0 && chartInstance) {
      chartInstance.setOption(buildOption(res.data), true);
    }
  } catch (e) { console.error(e); }
};

const handleResize = () => {
  chartInstance && chartInstance.resize();
};

const switchPeriod = (p) => {
  if (period.value === p) return;
  period.value = p;
  loadData();
};

onMounted(async () => {
  await nextTick();
  initChart();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance && chartInstance.dispose();
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
  background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(124,92,255,0.25));
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
