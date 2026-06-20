import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CityRanking from '../components/CityRanking.vue';

vi.mock('../api', () => ({
  getDashboardCities: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        ranking: [
          { code: 'BJ', name: '北京', revenue: 500000, orders: 5000, users: 10000, growth: 12.5 },
          { code: 'SH', name: '上海', revenue: 450000, orders: 4500, users: 9000, growth: 8.3 },
          { code: 'GZ', name: '广州', revenue: 380000, orders: 3800, users: 7600, growth: -2.1 },
          { code: 'SZ', name: '深圳', revenue: 350000, orders: 3500, users: 7000, growth: 15.7 },
          { code: 'HZ', name: '杭州', revenue: 280000, orders: 2800, users: 5600, growth: 20.1 }
        ]
      }
    })
  )
}));

describe('CityRanking.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    return mount(CityRanking, {
      props: { filterParams: {} }
    });
  };

  it('should render section title', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.section-title').text()).toContain('城市数据排行');
  });

  it('should render sort tabs', () => {
    const wrapper = mountComponent();
    const tabs = wrapper.findAll('.sort-tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0].text()).toBe('营收');
    expect(tabs[1].text()).toBe('订单');
    expect(tabs[2].text()).toBe('用户');
  });

  it('should have revenue as default sort', () => {
    const wrapper = mountComponent();
    const activeTab = wrapper.find('.sort-tab.active');
    expect(activeTab.text()).toBe('营收');
  });

  it('should switch sort when tab is clicked', async () => {
    const wrapper = mountComponent();
    const tabs = wrapper.findAll('.sort-tab');
    
    await tabs[1].trigger('click');
    
    const activeTab = wrapper.find('.sort-tab.active');
    expect(activeTab.text()).toBe('订单');
  });

  it('should render city list header', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.city-list-header').exists()).toBe(true);
    expect(wrapper.find('.col-rank').text()).toContain('排名');
    expect(wrapper.find('.col-city').text()).toContain('城市');
    expect(wrapper.find('.col-growth').text()).toContain('同比');
  });

  it('should render city items after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.city-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should emit select event when city is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.city-item');
    if (items.length > 0) {
      await items[0].trigger('click');
      expect(wrapper.emitted('select')).toBeTruthy();
    }
  });

  it('should have default empty filterParams', () => {
    const wrapper = mount(CityRanking);
    expect(wrapper.props('filterParams')).toEqual({});
  });

  it('should show growth tag with up class for positive growth', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const growthTags = wrapper.findAll('.growth-tag.up');
    expect(growthTags.length).toBeGreaterThan(0);
  });

  it('should show growth tag with down class for negative growth', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const growthTags = wrapper.findAll('.growth-tag.down');
    expect(growthTags.length).toBeGreaterThan(0);
  });

  it('should have top-1, top-2, top-3 rank badges', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('.rank-badge.top-1').exists()).toBe(true);
    expect(wrapper.find('.rank-badge.top-2').exists()).toBe(true);
    expect(wrapper.find('.rank-badge.top-3').exists()).toBe(true);
  });

  it('should sort cities by revenue by default', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const items = wrapper.findAll('.city-item');
    expect(items.length).toBeGreaterThanOrEqual(2);
    const firstCity = items[0].find('.city-name').text();
    expect(firstCity).toBe('北京');
  });
});
