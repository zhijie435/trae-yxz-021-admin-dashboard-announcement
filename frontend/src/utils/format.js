export const formatNumber = (num) => {
  const n = Number(num);
  if (isNaN(n)) return num;
  if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString('zh-CN');
};

export const formatRevenue = (num) => {
  const n = Number(num);
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString('zh-CN');
};

export const formatPercent = (value, decimals = 1) => {
  return Number(value).toFixed(decimals) + '%';
};

export const formatCurrency = (value, decimals = 2) => {
  return '¥' + Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const getBarHeight = (value, array, minHeight = 4) => {
  const max = Math.max(...array, 1);
  return Math.max((value / max) * 100, minHeight);
};

export const padZero = (num, length = 2) => {
  return String(num).padStart(length, '0');
};
