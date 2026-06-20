import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TodoReminder from '../components/TodoReminder.vue';

vi.mock('../api', () => ({
  getDashboardTodos: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        items: [
          {
            id: 1,
            type: 'urgent',
            icon: '⚠️',
            title: '商品审核',
            count: 15,
            desc: '有15个商品等待审核',
            time: '10分钟前',
            color: '#ff6b6b',
            urgent: true,
            action: 'goProductAudit',
            category: 'product'
          },
          {
            id: 2,
            type: 'normal',
            icon: '📋',
            title: '订单处理',
            count: 8,
            desc: '有8个订单需要处理',
            time: '30分钟前',
            color: '#00d4ff',
            urgent: false,
            action: 'goOrderAudit',
            category: 'order'
          }
        ],
        totalCount: 23,
        urgentCount: 15
      }
    })
  )
}));

describe('TodoReminder.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should render section title', () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.section-title').text()).toContain('待处理事项');
  });

  it('should render total count badge', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    const badge = wrapper.find('.badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toContain('23');
  });

  it('should render urgent badge', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    const urgentBadge = wrapper.find('.badge.urgent');
    expect(urgentBadge.exists()).toBe(true);
    expect(urgentBadge.text()).toContain('紧急');
  });

  it('should render view all link', () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.view-all').exists()).toBe(true);
    expect(wrapper.find('.view-all').text()).toContain('查看全部');
  });

  it('should render todo items', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.todo-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should emit navigate event when todo item is clicked', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.todo-item');
    if (items.length > 0) {
      await items[0].trigger('click');
      expect(wrapper.emitted('navigate')).toBeTruthy();
    }
  });

  it('should show pulse dot for urgent items', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.pulse-dot').exists()).toBe(true);
  });

  it('should have default empty filterParams', () => {
    const wrapper = mount(TodoReminder);
    expect(wrapper.props('filterParams')).toEqual({});
  });

  it('should render todo card', () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.todo-card').exists()).toBe(true);
  });

  it('should render action button on todo items', async () => {
    const wrapper = mount(TodoReminder, {
      props: { filterParams: {} }
    });
    await wrapper.vm.$nextTick();
    await vi.runAllTimersAsync();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.todo-action-btn').exists()).toBe(true);
    expect(wrapper.find('.todo-action-btn').text()).toBe('处理');
  });
});
