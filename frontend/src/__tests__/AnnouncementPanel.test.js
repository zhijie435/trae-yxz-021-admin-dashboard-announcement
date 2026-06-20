import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AnnouncementPanel from '../components/AnnouncementPanel.vue';

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
            title: '平台规则更新通知',
            content: '为了提供更好的服务体验，平台对部分规则进行了更新...',
            scope: '全部门店',
            publisher: '系统管理员',
            publishTime: new Date().toISOString(),
            readCount: 1234
          },
          {
            id: 2,
            type: 'system',
            level: 'urgent',
            status: 'published',
            title: '系统维护通知',
            content: '系统将于本周六凌晨进行例行维护...',
            scope: '华东区域',
            publisher: '技术部',
            publishTime: new Date().toISOString(),
            readCount: 567
          }
        ],
        total: 2,
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
          rule_update: { label: '规则更新', icon: '📋', color: '#00d4ff' },
          system: { label: '系统通知', icon: '🔔', color: '#7c5cff' },
          activity: { label: '活动公告', icon: '🎉', color: '#ff6b9d' }
        },
        levels: {
          normal: { label: '普通', color: '#32d583' },
          important: { label: '重要', color: '#ffa94d' },
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

describe('AnnouncementPanel.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  const mountComponent = () => {
    wrapper = mount(AnnouncementPanel);
    return wrapper;
  };

  it('should render section title', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.section-title').text()).toContain('平台公告');
  });

  it('should render refresh button', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.view-all').exists()).toBe(true);
  });

  it('should render publish button', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.publish-btn').exists()).toBe(true);
    expect(wrapper.find('.publish-btn').text()).toContain('发布公告');
  });

  it('should render filter selects', () => {
    const wrapper = mountComponent();
    const selects = wrapper.findAll('.filter-select');
    expect(selects.length).toBe(2);
  });

  it('should render status tabs after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const tabs = wrapper.findAll('.filter-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(3);
  });

  it('should render announcement items after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.announcement-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render total count badge after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const badge = wrapper.find('.badge');
    expect(badge.exists()).toBe(true);
  });

  it('should render urgent badge after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const urgentBadge = wrapper.find('.badge.urgent');
    expect(urgentBadge.exists()).toBe(true);
  });

  it('should show pulse dot for urgent items', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.pulse-dot').exists()).toBe(true);
  });

  it('should render item actions (edit, delete)', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.action-btn.edit').exists()).toBe(true);
    expect(wrapper.find('.action-btn.delete').exists()).toBe(true);
  });

  it('should render read count', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.read-count').exists()).toBe(true);
  });

  it('should render item id', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.item-id').exists()).toBe(true);
  });

  it('should render level tags for non-normal levels', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.level-tag').exists()).toBe(true);
  });

  it('should switch status tab when clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const tabs = wrapper.findAll('.filter-tab');
    if (tabs.length >= 2) {
      await tabs[1].trigger('click');
      const activeTabs = wrapper.findAll('.filter-tab.active');
      expect(activeTabs.length).toBe(1);
    }
  });

  it('should render announcement card container', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.announcement-card').exists()).toBe(true);
  });

  it('should render filter bar', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.filter-bar').exists()).toBe(true);
  });

  it('should have all tab active by default', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const activeTab = wrapper.find('.filter-tab.active');
    expect(activeTab.text()).toContain('全部');
  });

  it('should show announcement title', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const titles = wrapper.findAll('.item-title');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('should show announcement content', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.item-content').exists()).toBe(true);
  });
});
