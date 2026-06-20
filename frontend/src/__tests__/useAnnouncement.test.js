import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnnouncement, createEmptyForm, ANNOUNCEMENT_STATUS, ANNOUNCEMENT_SCOPE_OPTIONS } from '../composables/useAnnouncement';

vi.mock('../api', () => ({
  getAnnouncements: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        items: [
          {
          id: 1,
          type: 'rule_update',
          level: 'normal',
          status: 'published',
          title: '测试公告',
          content: '测试内容',
          scope: '全部门店',
          publisher: '管理员',
          publishTime: new Date().toISOString(),
          readCount: 100
        }
        ],
        total: 1,
        stats: {
          total: 10,
          published: 8,
          draft: 2,
          urgent: 1
        }
      }
    })
  ),
  createAnnouncement: vi.fn(() =>
    Promise.resolve({ code: 0, message: '创建成功' })
  ),
  updateAnnouncement: vi.fn(() =>
    Promise.resolve({ code: 0, message: '更新成功' })
  ),
  deleteAnnouncement: vi.fn(() =>
    Promise.resolve({ code: 0, message: '删除成功' })
  ),
  getAnnouncementTypes: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        types: {
          rule_update: { label: '规则更新', icon: '📋', color: '#00d4ff' }
        },
        levels: {
          normal: { label: '普通', color: '#32d583' },
          urgent: { label: '紧急', color: '#ff6b6b' }
        }
      }
    })
  ),
  getAnnouncementVersion: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: { version: 1 }
    })
  )
}));

describe('useAnnouncement composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('createEmptyForm', () => {
    it('should create empty form with default values', () => {
      const form = createEmptyForm();
      expect(form.id).toBeNull();
      expect(form.type).toBe('rule_update');
      expect(form.level).toBe('normal');
      expect(form.title).toBe('');
      expect(form.content).toBe('');
      expect(form.scope).toBe('全部门店');
      expect(form.publisher).toBe('');
      expect(form.status).toBe('published');
    });
  });

  describe('ANNOUNCEMENT_STATUS', () => {
    it('should have correct status constants', () => {
      expect(ANNOUNCEMENT_STATUS.ALL).toBe('all');
      expect(ANNOUNCEMENT_STATUS.PUBLISHED).toBe('published');
      expect(ANNOUNCEMENT_STATUS.DRAFT).toBe('draft');
    });
  });

  describe('ANNOUNCEMENT_SCOPE_OPTIONS', () => {
    it('should have scope options', () => {
      expect(ANNOUNCEMENT_SCOPE_OPTIONS.length).toBeGreaterThan(0);
      expect(ANNOUNCEMENT_SCOPE_OPTIONS[0].label).toBe('全部门店');
    });
  });

  describe('useAnnouncement', () => {
    it('should return reactive state', () => {
      const { types, levels, items, pagination, stats, filters, toast } = useAnnouncement();
      
      expect(types).toBeDefined();
      expect(levels).toBeDefined();
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(5);
      expect(stats.total).toBe(0);
      expect(filters.status).toBe('all');
      expect(filters.type).toBe('all');
      expect(filters.level).toBe('all');
      expect(toast.show).toBe(false);
    });

    it('should have showModal ref', () => {
      const { showModal } = useAnnouncement();
      expect(showModal.value).toBe(false);
    });

    it('should have formData reactive', () => {
      const { formData } = useAnnouncement();
      expect(formData.type).toBe('rule_update');
      expect(formData.title).toBe('');
    });

    it('should have statusTabs computed', () => {
      const { statusTabs } = useAnnouncement();
      expect(statusTabs.value.length).toBe(3);
      expect(statusTabs.value[0].key).toBe('all');
      expect(statusTabs.value[1].key).toBe('published');
      expect(statusTabs.value[2].key).toBe('draft');
    });

    it('should have totalPages computed', () => {
      const { totalPages, pagination } = useAnnouncement();
      pagination.total = 15;
      pagination.pageSize = 5;
      expect(totalPages.value).toBe(3);
    });

    it('should have pageNumbers computed', () => {
      const { pageNumbers, pagination } = useAnnouncement();
      pagination.total = 50;
      pagination.pageSize = 5;
      pagination.page = 3;
      expect(pageNumbers.value.length).toBeGreaterThan(0);
    });

    it('should open publish modal', () => {
      const { openPublishModal, showModal, formData } = useAnnouncement();
      
      openPublishModal();
      expect(showModal.value).toBe(true);
      expect(formData.id).toBeNull();
    });

    it('should open edit modal with item data', () => {
      const { openPublishModal, showModal, formData } = useAnnouncement();
      const item = {
        id: 123,
        type: 'system',
        level: 'urgent',
        title: '测试标题',
        content: '测试内容',
        scope: '华东区域',
        publisher: '测试员',
        status: 'published'
      };
      
      openPublishModal(item);
      expect(showModal.value).toBe(true);
      expect(formData.id).toBe(123);
      expect(formData.title).toBe('测试标题');
      expect(formData.type).toBe('system');
    });

    it('should close modal and reset form', () => {
      const { closeModal, showModal, formData, openPublishModal } = useAnnouncement();
      
      openPublishModal({ id: 1, title: '测试' });
      expect(showModal.value).toBe(true);
      
      closeModal();
      expect(showModal.value).toBe(false);
      expect(formData.id).toBeNull();
    });

    it('should go to page', () => {
      const { goPage, pagination } = useAnnouncement();
      pagination.total = 50;
      
      goPage(3);
      expect(pagination.page).toBe(3);
    });

    it('should not go to page less than 1', () => {
      const { goPage, pagination } = useAnnouncement();
      pagination.page = 1;
      pagination.total = 50;
      
      goPage(0);
      expect(pagination.page).toBe(1);
    });

    it('should not go to page beyond total pages', () => {
      const { goPage, pagination, totalPages } = useAnnouncement();
      pagination.page = 3;
      pagination.total = 10;
      pagination.pageSize = 5;
      
      goPage(100);
      expect(pagination.page).toBe(3);
    });

    it('should show toast', () => {
      const { showToast, toast } = useAnnouncement();
      
      showToast('测试消息', 'success');
      expect(toast.show).toBe(true);
      expect(toast.message).toBe('测试消息');
      expect(toast.type).toBe('success');
    });

    it('should start and stop polling', () => {
      const { startPolling, stopPolling } = useAnnouncement();
      
      expect(() => startPolling()).not.toThrow();
      expect(() => stopPolling()).not.toThrow();
    });

    it('should show error toast when saving with empty title', async () => {
      const { handleSave, formData, toast } = useAnnouncement();
      
      formData.title = '';
      formData.content = '测试内容';
      formData.type = 'rule_update';
      
      await handleSave('published');
      expect(toast.show).toBe(true);
      expect(toast.type).toBe('error');
    });

    it('should show error toast when saving with empty content', async () => {
      const { handleSave, formData, toast } = useAnnouncement();
      
      formData.title = '测试标题';
      formData.content = '';
      formData.type = 'rule_update';
      
      await handleSave('published');
      expect(toast.show).toBe(true);
      expect(toast.type).toBe('error');
    });

    it('should show error toast when saving with empty type', async () => {
      const { handleSave, formData, toast } = useAnnouncement();
      
      formData.title = '测试标题';
      formData.content = '测试内容';
      formData.type = '';
      
      await handleSave('published');
      expect(toast.show).toBe(true);
      expect(toast.type).toBe('error');
    });

    it('should save successfully with valid form', async () => {
      const { handleSave, formData, toast, showModal } = useAnnouncement();
      
      formData.title = '测试标题';
      formData.content = '测试内容';
      formData.type = 'rule_update';
      
      await handleSave('published');
      expect(toast.show).toBe(true);
      expect(toast.type).toBe('success');
    });
  });
});
