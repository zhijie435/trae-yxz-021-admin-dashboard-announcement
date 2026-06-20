const padZero = (n) => String(n).padStart(2, '0');

const formatDateStr = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  return `${y}-${m}-${day}`;
};

const formatShortDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getTimeRangeFactor = (startDate, endDate) => {
  if (!startDate && !endDate) return 1;
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const end = endDate ? new Date(endDate) : now;
  const days = Math.max(1, Math.ceil((end - start) / (24 * 3600 * 1000)));
  return Math.min(2, Math.max(0.3, days / 14));
};

const randomFluctuate = (base, range) => {
  return base + Math.floor(Math.random() * range * 2) - range;
};

const getDaySeed = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const s = `${y}${m}${d}`;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.ceil((end - start) / (24 * 3600 * 1000)));
};

const generateDateArray = (days, format = 'short') => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.push(format === 'short' ? formatShortDate(d) : formatDateStr(d));
  }
  return result;
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

module.exports = {
  padZero,
  formatDateStr,
  formatShortDate,
  getTimeRangeFactor,
  randomFluctuate,
  getDaySeed,
  seededRandom,
  getDaysBetween,
  generateDateArray,
  deepClone
};
