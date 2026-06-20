<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <div class="modal-close" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <label class="form-label">公告类型 <span class="required">*</span></label>
          <div class="type-picker">
            <div
              v-for="(v, k) in types"
              :key="k"
              class="type-option"
              :class="{ active: formData.type === k }"
              :style="{ '--type-color': v.color }"
              @click="formData.type = k"
            >
              <span class="type-icon">{{ v.icon }}</span>
              <span class="type-label">{{ v.label }}</span>
            </div>
          </div>
        </div>

        <div class="form-row two-col">
          <div class="form-col">
            <label class="form-label">公告级别</label>
            <select v-model="formData.level" class="form-select">
              <option v-for="(v, k) in levels" :key="k" :value="k">{{ v.label }}</option>
            </select>
          </div>
          <div class="form-col">
            <label class="form-label">发布范围</label>
            <select v-model="formData.scope" class="form-select">
              <option v-for="opt in scopeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">公告标题 <span class="required">*</span></label>
          <input
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="请输入公告标题，不超过50字"
            maxlength="50"
          />
          <div class="char-count">{{ titleLength }}/50</div>
        </div>

        <div class="form-row">
          <label class="form-label">公告内容 <span class="required">*</span></label>
          <textarea
            v-model="formData.content"
            class="form-textarea"
            placeholder="请输入公告详细内容..."
            rows="6"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ contentLength }}/500</div>
        </div>

        <div class="form-row">
          <label class="form-label">发布人</label>
          <input
            v-model="formData.publisher"
            type="text"
            class="form-input"
            placeholder="系统管理员"
          />
        </div>
      </div>

      <div class="modal-footer">
        <div class="btn btn-ghost" @click="$emit('close')">取消</div>
        <div
          v-if="showSaveDraft"
          class="btn btn-secondary"
          :class="{ disabled: submitting }"
          @click="handleSaveDraft"
        >
          保存草稿
        </div>
        <div
          class="btn btn-primary"
          :class="{ disabled: submitting }"
          @click="handlePublish"
        >
          {{ publishButtonText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ANNOUNCEMENT_SCOPE_OPTIONS } from '../composables/useAnnouncement';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  types: {
    type: Object,
    required: true
  },
  levels: {
    type: Object,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const scopeOptions = ANNOUNCEMENT_SCOPE_OPTIONS;

const modalTitle = computed(() => {
  return props.formData.id ? '编辑公告' : '发布新公告';
});

const titleLength = computed(() => (props.formData.title || '').length);
const contentLength = computed(() => (props.formData.content || '').length);

const showSaveDraft = computed(() => {
  return !props.formData.id || props.formData.status === 'draft';
});

const publishButtonText = computed(() => {
  return props.formData.id && props.formData.status === 'published' ? '更新公告' : '立即发布';
});

const handleSaveDraft = () => {
  if (props.submitting) return;
  emit('save', 'draft');
};

const handlePublish = () => {
  if (props.submitting) return;
  emit('save', 'published');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(5, 8, 18, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: linear-gradient(145deg, #141e32 0%, #0a1220 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  margin-bottom: 20px;
  position: relative;
}

.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-col {
  min-width: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.required {
  color: #ff6b6b;
  margin-left: 2px;
}

.type-picker {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.type-option:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: color-mix(in srgb, var(--type-color) 35%, rgba(255,255,255,0.06));
}

.type-option.active {
  background: color-mix(in srgb, var(--type-color) 12%, transparent);
  border-color: var(--type-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--type-color) 15%, transparent);
}

.type-icon {
  font-size: 26px;
}

.type-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1.5;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: rgba(255, 107, 157, 0.5);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
  cursor: pointer;
}

.form-select option {
  background: #141e32;
  color: #fff;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  max-height: 240px;
}

.char-count {
  position: absolute;
  right: 2px;
  bottom: -18px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn {
  padding: 11px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-ghost:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa94d 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 107, 157, 0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255, 107, 157, 0.5);
}
</style>
