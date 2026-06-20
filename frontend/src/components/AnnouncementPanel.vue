<template>
  <div class="announcement-section">
    <div class="section-header">
      <h2 class="section-title">
        <span class="title-bar"></span>
        平台公告
        <span v-if="stats.total > 0" class="badge">{{ stats.total }}</span>
        <span v-if="stats.urgent > 0" class="badge urgent">紧急 {{ stats.urgent }}</span>
      </h2>
      <div class="header-actions">
        <div class="view-all" @click="fetchData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新
        </div>
        <div class="publish-btn" @click="openPublishModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          发布公告
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="tab in statusTabs"
          :key="tab.key"
          class="filter-tab"
          :class="{ active: filters.status === tab.key }"
          @click="handleStatusTabClick(tab.key)"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </div>
      </div>
      <div class="filter-right">
        <select v-model="filters.type" @change="fetchData" class="filter-select">
          <option value="all">全部类型</option>
          <option v-for="(v, k) in types" :key="k" :value="k">{{ v.icon }} {{ v.label }}</option>
        </select>
        <select v-model="filters.level" @change="fetchData" class="filter-select">
          <option value="all">全部级别</option>
          <option v-for="(v, k) in levels" :key="k" :value="k">{{ v.label }}</option>
        </select>
      </div>
    </div>

    <div class="announcement-card">
      <div v-if="items.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <span class="empty-text">暂无公告</span>
      </div>
      <div v-else class="announcement-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="announcement-item"
          :class="[
            'type-' + item.type,
            'status-' + item.status,
            'level-' + item.level
          ]"
          :style="{ '--item-color': types[item.type]?.color || '#00d4ff' }"
        >
          <div class="item-header">
            <div class="item-left">
              <div class="item-icon-wrap">
                <span class="item-icon">{{ types[item.type]?.icon || '📢' }}</span>
                <span v-if="item.level === 'urgent'" class="pulse-dot"></span>
              </div>
              <div class="item-main">
                <div class="item-title-row">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <span
                    v-if="item.level !== 'normal'"
                    class="level-tag"
                    :style="{ color: levels[item.level]?.color, borderColor: levels[item.level]?.color }"
                  >{{ levels[item.level]?.label }}</span>
                  <span v-if="item.status === 'draft'" class="draft-tag">草稿</span>
                </div>
                <div class="item-meta">
                  <span class="meta-item">{{ types[item.type]?.label }}</span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">{{ item.scope }}</span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">{{ item.publisher }}</span>
                  <span class="meta-dot">·</span>
                  <span class="meta-item">{{ formatRelativeTime(item.publishTime || item.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="item-actions">
              <div v-if="item.status === 'draft'" class="action-btn publish" @click.stop="handlePublish(item)">
                发布
              </div>
              <div class="action-btn edit" @click.stop="openPublishModal(item)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div class="action-btn delete" @click.stop="handleDelete(item)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="item-content">{{ item.content }}</div>
          <div class="item-footer">
            <div class="read-count">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ item.readCount }} 已读
            </div>
            <div class="item-id">{{ item.id }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagination.total > filters.pageSize" class="pagination">
      <div
        class="page-btn"
        :class="{ disabled: pagination.page <= 1 }"
        @click="goPage(pagination.page - 1)"
      >‹</div>
      <div
        v-for="p in pageNumbers"
        :key="p"
        class="page-btn"
        :class="{ active: p === pagination.page }"
        @click="goPage(p)"
      >{{ p }}</div>
      <div
        class="page-btn"
        :class="{ disabled: pagination.page >= totalPages }"
        @click="goPage(pagination.page + 1)"
      >›</div>
    </div>

    <AnnouncementModal
      v-if="showModal"
      :form-data="formData"
      :types="types"
      :levels="levels"
      :submitting="submitting"
      @close="closeModal"
      @save="handleSave"
    />

    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { formatRelativeTime } from '../utils';
import { useAnnouncement, ANNOUNCEMENT_SCOPE_OPTIONS } from '../composables/useAnnouncement';
import AnnouncementModal from './AnnouncementModal.vue';

const {
  types,
  levels,
  items,
  pagination,
  stats,
  showModal,
  submitting,
  formData,
  filters,
  toast,
  statusTabs,
  totalPages,
  pageNumbers,
  fetchData,
  goPage,
  openPublishModal,
  closeModal,
  handleSave,
  handlePublish,
  handleDelete
} = useAnnouncement();

const handleStatusTabClick = (key) => {
  filters.status = key;
  pagination.page = 1;
  fetchData();
};

defineExpose({
  scopeOptions: ANNOUNCEMENT_SCOPE_OPTIONS
});
</script>

<style scoped>
.announcement-section {
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
  background: linear-gradient(180deg, #ff6b9d, #ffa94d);
  border-radius: 4px;
}

.badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 107, 157, 0.15);
  color: #ff6b9d;
  border: 1px solid rgba(255, 107, 157, 0.25);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: color 0.2s;
  letter-spacing: 0.3px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.view-all:hover {
  color: rgba(0, 212, 255, 0.9);
  border-color: rgba(0, 212, 255, 0.2);
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa94d 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.35);
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255, 107, 157, 0.5);
}

.publish-btn:active {
  transform: translateY(0);
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 9px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: rgba(255, 255, 255, 0.8);
}

.filter-tab.active {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.tab-count {
  padding: 1px 8px;
  border-radius: 12px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.08);
  font-weight: 600;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 9px 32px 9px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.filter-select option {
  background: #0a0f1e;
  color: #fff;
}

.announcement-card {
  background: linear-gradient(145deg, rgba(20, 30, 50, 0.95), rgba(10, 18, 32, 0.98));
  border-radius: 20px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.announcement-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
}

.announcement-item {
  padding: 20px 20px 16px;
  border-radius: 16px;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid var(--item-color);
}

.announcement-item + .announcement-item {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.announcement-item:hover {
  background: rgba(255, 255, 255, 0.025);
}

.announcement-item.status-draft {
  opacity: 0.75;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.item-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.item-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--item-color) 25%, transparent), color-mix(in srgb, var(--item-color) 8%, transparent));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--item-color) 25%, transparent);
}

.item-icon {
  font-size: 24px;
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

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.level-tag {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  background: color-mix(in srgb, currentColor 10%, transparent);
  flex-shrink: 0;
}

.level-urgent .item-title {
  color: #ff6b6b;
}

.draft-tag {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(140, 140, 140, 0.15);
  color: #8c8c8c;
  border: 1px solid rgba(140, 140, 140, 0.25);
  flex-shrink: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.meta-dot {
  color: rgba(255, 255, 255, 0.2);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.publish {
  width: auto;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #32d583;
  background: rgba(50, 213, 131, 0.1);
  border-color: rgba(50, 213, 131, 0.2);
}

.action-btn.publish:hover {
  background: rgba(50, 213, 131, 0.18);
  color: #32d583;
}

.action-btn.edit:hover {
  color: #00d4ff;
  border-color: rgba(0, 212, 255, 0.25);
  background: rgba(0, 212, 255, 0.08);
}

.action-btn.delete:hover {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.25);
  background: rgba(255, 107, 107, 0.08);
}

.item-content {
  font-size: 13.5px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.65);
  padding: 4px 0 4px 68px;
  word-break: break-word;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 0 0 68px;
}

.read-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.item-id {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.2);
  font-family: 'SF Mono', monospace;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(.disabled):not(.active) {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.15);
}

.page-btn.active {
  background: linear-gradient(135deg, #ff6b9d, #ffa94d);
  color: #fff;
  border-color: transparent;
  font-weight: 600;
}

.page-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: toastIn 0.25s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.toast.success {
  background: rgba(50, 213, 131, 0.15);
  border: 1px solid rgba(50, 213, 131, 0.3);
  color: #32d583;
}

.toast.error {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
}

@keyframes toastIn {
  from { transform: translate(-50%, -20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
</style>
