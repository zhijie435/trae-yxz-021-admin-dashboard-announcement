import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TodayData from '../components/TodayData.vue';

vi.mock('../api', () => ({
  getDashboardToday: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        orders: { total: 350, goal: 500, rate: 70, hourly: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] },
        revenue: { total: 85000, goal: 150000, rate: 56.7, hourly: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000] },
        newUsers: { total: 420, goal: 600, rate: 70, hourly: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60] }
      }
    })
  )
}));

describe('TodayData.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = () => {
    return mount(TodayData, {
      props: { filterParams: {} }
    });
  };

  it('should render section title', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.section-title').text()).toContain('今日实时数据');
  });

  it('should render current date', () => {
    const wrapper = mountComponent();
    const dateEl = wrapper.find('.current-date');
    expect(dateEl.exists()).toBe(true);
    expect(dateEl.text()).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
  });

  it('should render three today cards', () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAll('.today-card');
    expect(cards).toHaveLength(3);
  });

  it('should render order card with correct label', () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAll('.today-card');
    expect(cards[0].text()).toContain('今日订单');
  });

  it('should render revenue card with correct label', () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAll('.today-card');
    expect(cards[1].text()).toContain('今日收入');
  });

  it('should render new users card with correct label', () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAll('.today-card');
    expect(cards[2].text()).toContain('新增用户');
  });

  it('should render hourly bars for orders after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const cards = wrapper.findAll('.today-card');
    const bars = cards[0].findAll('.hourly-bar');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('should render progress bars', () => {
    const wrapper = mountComponent();
    const progressBars = wrapper.findAll('.progress-fill');
    expect(progressBars).toHaveLength(3);
  });

  it('should render trend tags', () => {
    const wrapper = mountComponent();
    const trendTags = wrapper.findAll('.trend-tag');
    expect(trendTags).toHaveLength(3);
  });

  it('should have default empty filterParams', () => {
    const wrapper = mount(TodayData);
    expect(wrapper.props('filterParams')).toEqual({});
  });

  it('should display formatted order total after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const cards = wrapper.findAll('.today-card');
    expect(cards[0].find('.metric-value').text()).toContain('350');
  });

  it('should display formatted revenue total after data loads', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    const cards = wrapper.findAll('.today-card');
    expect(cards[1].find('.metric-value').text()).toContain('8.5');
  });
});
