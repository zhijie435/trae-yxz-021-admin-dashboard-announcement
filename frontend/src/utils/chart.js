import * as echarts from 'echarts';

export const CHART_COLORS = {
  primary: '#00d4ff',
  secondary: '#7c5cff',
  accent: '#ff6b9d',
  success: '#32d583',
  warning: '#ffa94d',
  danger: '#ff6b6b',
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.35)',
  grid: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)'
};

export const createGradient = (color, opacityStart = 0.35, opacityEnd = 0.01) => {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: color.replace(')', `, ${opacityStart})`).replace('rgb', 'rgba') },
    { offset: 1, color: color.replace(')', `, ${opacityEnd})`).replace('rgb', 'rgba') }
  ]);
};

export const createAreaGradient = (color, startOpacity = 0.35) => {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: color.replace(')', `, ${startOpacity})`).replace('rgb', 'rgba') },
    { offset: 1, color: color.replace(')', ', 0.01)').replace('rgb', 'rgba') }
  ]);
};

export const createBarGradient = (color, startOpacity = 1) => {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: color },
    { offset: 1, color: color.replace(')', ', 0.2)').replace('rgb', 'rgba') }
  ]);
};

export const defaultTooltip = {
  trigger: 'axis',
  backgroundColor: 'rgba(15, 25, 45, 0.95)',
  borderColor: CHART_COLORS.border,
  borderWidth: 1,
  padding: [12, 16],
  textStyle: { color: '#fff', fontSize: 13 },
  axisPointer: { type: 'cross', lineStyle: { color: 'rgba(255,255,255,0.1)' } }
};

export const defaultLegend = {
  top: 0,
  right: 0,
  itemGap: 28,
  textStyle: { color: CHART_COLORS.textSecondary, fontSize: 13 },
  itemWidth: 14,
  itemHeight: 8,
  icon: 'roundRect'
};

export const defaultGrid = {
  left: 40,
  right: 40,
  top: 60,
  bottom: 40,
  containLabel: true
};

export const defaultXAxis = {
  type: 'category',
  boundaryGap: false,
  axisLine: { lineStyle: { color: CHART_COLORS.grid } },
  axisTick: { show: false },
  axisLabel: {
    color: CHART_COLORS.textSecondary,
    fontSize: 12,
    margin: 16
  },
  splitLine: { show: false }
};

export const createYAxis = (options = {}) => ({
  type: 'value',
  nameTextStyle: { color: CHART_COLORS.textSecondary, padding: [0, 0, 0, 20] },
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: CHART_COLORS.textSecondary, fontSize: 12 },
  splitLine: { lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } },
  ...options
});

export const createLineSeries = (options = {}) => ({
  type: 'line',
  smooth: true,
  symbol: 'circle',
  symbolSize: 7,
  showSymbol: false,
  lineStyle: { width: 3 },
  itemStyle: { borderColor: '#0a0f1e', borderWidth: 2 },
  emphasis: { focus: 'series', scale: 1.3 },
  ...options
});

export const createBarSeries = (options = {}) => ({
  type: 'bar',
  barWidth: 10,
  itemStyle: { borderRadius: [6, 6, 0, 0] },
  ...options
});

export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : hex;
};
