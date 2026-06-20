const ANNOUNCEMENT_TYPES = {
  rule_update: { label: '规则更新', icon: '📋', color: '#00d4ff' },
  activity_notice: { label: '活动通知', icon: '🎉', color: '#ff6b9d' },
  store_reminder: { label: '门店提醒', icon: '🏪', color: '#32d583' }
};

const ANNOUNCEMENT_LEVELS = {
  normal: { label: '普通', color: '#8c8c8c' },
  important: { label: '重要', color: '#ffa94d' },
  urgent: { label: '紧急', color: '#ff6b6b' }
};

const ANNOUNCEMENT_SCOPE_OPTIONS = [
  { label: '全部门店', value: 'all' },
  { label: '华东区域', value: 'east' },
  { label: '华南区域', value: 'south' },
  { label: '华北区域', value: 'north' },
  { label: '西南区域', value: 'southwest' },
  { label: '西北区域', value: 'northwest' }
];

let announcements = [
  {
    id: 'A20250001',
    type: 'rule_update',
    level: 'important',
    title: '关于平台佣金结算规则调整的通知',
    content: '为进一步优化平台生态，自2025年7月1日起，平台佣金结算周期将由T+7调整为T+3。请各门店及时更新财务管理流程，如有疑问请联系平台客服。',
    scope: '全部门店',
    publisher: '平台运营部',
    status: 'published',
    publishTime: '2025-06-18T10:00:00.000Z',
    readCount: 186,
    createdAt: '2025-06-18T09:30:00.000Z'
  },
  {
    id: 'A20250002',
    type: 'activity_notice',
    level: 'urgent',
    title: '【618大促】全场满减活动开启报名',
    content: '618年中大促即将来临！平台将推出全场满300减50、满500减100的钜惠活动，报名截止时间为6月25日。参与门店将获得首页推荐位资源，速速报名！',
    scope: '全部门店',
    publisher: '市场营销部',
    status: 'published',
    publishTime: '2025-06-15T14:20:00.000Z',
    readCount: 234,
    createdAt: '2025-06-15T13:00:00.000Z'
  },
  {
    id: 'A20250003',
    type: 'store_reminder',
    level: 'normal',
    title: '华东区域门店消防安全检查提醒',
    content: '华东区域各门店请注意：本周五（6月27日）将进行季度消防安全检查，请各门店提前整理消防通道、检查灭火器有效期，确保检查顺利通过。',
    scope: '华东区域',
    publisher: '区域管理部',
    status: 'published',
    publishTime: '2025-06-16T08:30:00.000Z',
    readCount: 78,
    createdAt: '2025-06-16T08:00:00.000Z'
  },
  {
    id: 'A20250004',
    type: 'rule_update',
    level: 'normal',
    title: '新版商家APP操作手册上线',
    content: '新版商家APP 2.0操作手册已更新至帮助中心，包含订单管理、商品上架、数据查看等全新功能介绍。欢迎各门店下载查阅。',
    scope: '全部门店',
    publisher: '产品技术部',
    status: 'published',
    publishTime: '2025-06-12T16:00:00.000Z',
    readCount: 142,
    createdAt: '2025-06-12T15:00:00.000Z'
  },
  {
    id: 'A20250005',
    type: 'activity_notice',
    level: 'normal',
    title: '7月夏季主题营销活动招商中',
    content: '"清凉一夏"7月主题营销活动正在招商，参与门店可获得专属优惠券补贴及流量扶持。活动主题：消暑美食季、冰饮狂欢节。报名截止7月1日。',
    scope: '全部门店',
    publisher: '市场营销部',
    status: 'draft',
    publishTime: null,
    readCount: 0,
    createdAt: '2025-06-19T11:00:00.000Z'
  }
];

let announcementSeq = 6;
let announcementVersion = 0;
let announcementLastUpdated = new Date().toISOString();

function bumpAnnouncementVersion() {
  announcementVersion++;
  announcementLastUpdated = new Date().toISOString();
}

function generateAnnouncementId() {
  const year = new Date().getFullYear();
  const num = String(announcementSeq++).padStart(4, '0');
  return `A${year}${num}`;
}

function getAnnouncements({ type, level, status, keyword, page = 1, pageSize = 10 }) {
  let result = [...announcements];

  if (type && type !== 'all') {
    result = result.filter(a => a.type === type);
  }
  if (level && level !== 'all') {
    result = result.filter(a => a.level === level);
  }
  if (status && status !== 'all') {
    result = result.filter(a => a.status === status);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.content.toLowerCase().includes(kw)
    );
  }

  result.sort((a, b) => {
    const timeA = a.publishTime || a.createdAt;
    const timeB = b.publishTime || b.createdAt;
    return new Date(timeB) - new Date(timeA);
  });

  const total = result.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const paged = result.slice(start, start + Number(pageSize));

  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    draft: announcements.filter(a => a.status === 'draft').length,
    urgent: announcements.filter(a => a.level === 'urgent' && a.status === 'published').length
  };

  return {
    items: paged,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    stats
  };
}

function createAnnouncement(data) {
  const { type, level, title, content, scope, publisher, status } = data;

  if (!type || !title || !content) {
    return { error: '公告类型、标题和内容不能为空', code: 400 };
  }
  if (!ANNOUNCEMENT_TYPES[type]) {
    return { error: '无效的公告类型', code: 400 };
  }
  if (!ANNOUNCEMENT_LEVELS[level || 'normal']) {
    return { error: '无效的公告级别', code: 400 };
  }

  const now = new Date().toISOString();
  const newAnnouncement = {
    id: generateAnnouncementId(),
    type,
    level: level || 'normal',
    title: title.trim(),
    content: content.trim(),
    scope: scope || '全部门店',
    publisher: publisher || '系统管理员',
    status: status || 'published',
    publishTime: status === 'draft' ? null : now,
    readCount: 0,
    createdAt: now
  };

  announcements.unshift(newAnnouncement);
  bumpAnnouncementVersion();

  return { data: newAnnouncement };
}

function updateAnnouncement(id, data) {
  const { type, level, title, content, scope, publisher, status } = data;

  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return { error: '公告不存在', code: 404 };
  }

  const current = announcements[idx];
  const now = new Date().toISOString();

  if (current.status === 'draft' && status === 'published' && !current.publishTime) {
    current.publishTime = now;
  }

  if (type) current.type = type;
  if (level) current.level = level;
  if (title) current.title = title.trim();
  if (content) current.content = content.trim();
  if (scope !== undefined) current.scope = scope;
  if (publisher) current.publisher = publisher;
  if (status) current.status = status;

  announcements[idx] = current;
  bumpAnnouncementVersion();

  return { data: current };
}

function deleteAnnouncement(id) {
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return { error: '公告不存在', code: 404 };
  }

  announcements.splice(idx, 1);
  bumpAnnouncementVersion();

  return { success: true };
}

function getAnnouncementVersion() {
  return {
    version: announcementVersion,
    lastUpdated: announcementLastUpdated
  };
}

module.exports = {
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_LEVELS,
  ANNOUNCEMENT_SCOPE_OPTIONS,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementVersion
};
