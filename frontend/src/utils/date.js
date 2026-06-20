import { padZero } from './format';

export const TIME_RANGES = {
  TODAY: 'today',
  WEEK_7: '7d',
  WEEK_14: '14d',
  MONTH_30: '30d',
  CUSTOM: 'custom'
};

export const TIME_RANGE_OPTIONS = [
  { label: '今日', value: TIME_RANGES.TODAY },
  { label: '近7天', value: TIME_RANGES.WEEK_7 },
  { label: '近14天', value: TIME_RANGES.WEEK_14 },
  { label: '近30天', value: TIME_RANGES.MONTH_30 },
  { label: '自定义', value: TIME_RANGES.CUSTOM }
];

export const formatDateStr = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  return `${y}-${m}-${day}`;
};

export const formatShortDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const formatTime = (isoString) => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatRelativeTime = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}天前`;
  return `${d.getMonth() + 1}/${d.getDate()} ${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
};

export const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const getDateRangeFromTimeRange = (timeRange, startDate, endDate) => {
  const now = new Date();

  switch (timeRange) {
    case TIME_RANGES.TODAY: {
      const today = formatDateStr(now);
      return { startDate: today, endDate: today };
    }
    case TIME_RANGES.WEEK_7: {
      const end = formatDateStr(now);
      const start = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
      return { startDate: formatDateStr(start), endDate: end };
    }
    case TIME_RANGES.WEEK_14: {
      const end = formatDateStr(now);
      const start = new Date(now.getTime() - 13 * 24 * 3600 * 1000);
      return { startDate: formatDateStr(start), endDate: end };
    }
    case TIME_RANGES.MONTH_30: {
      const end = formatDateStr(now);
      const start = new Date(now.getTime() - 29 * 24 * 3600 * 1000);
      return { startDate: formatDateStr(start), endDate: end };
    }
    case TIME_RANGES.CUSTOM: {
      if (startDate && endDate) return { startDate, endDate };
      return {};
    }
    default:
      return {};
  }
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.ceil((end - start) / (24 * 3600 * 1000)));
};

export const getTimeRangeFactor = (startDate, endDate) => {
  if (!startDate && !endDate) return 1;
  const days = getDaysBetween(startDate, endDate);
  return Math.min(2, Math.max(0.3, days / 14));
};

export const generateDateArray = (days, format = 'short') => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.push(format === 'short' ? formatShortDate(d) : formatDateStr(d));
  }
  return result;
};
