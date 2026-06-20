import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TrendChart from '../components/TrendChart.vue';

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn()
  })),
  graphic: {
    LinearGradient: vi.fn(() => ({}))
  }
}));

vi.mock('../api', () => ({
  getDashboardTrend: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: {
        dates: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7'],
        orders: [100, 150, 200, 180, 220, 250, 300],
        revenue: [10000, 15000, 20000, 18000, 22000, 25000, 30000],
        newUsers: [50, 70, 90, 80, 100, 120, 140]
      }
    })
  )
}));

describe('TrendChart.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render section title', () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.section-title').text()).toContain('运营数据趋势');
  });

  it('should render period tabs', () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    const tabs = wrapper.findAll('.period-tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].text()).toBe('近14天');
    expect(tabs[1].text()).toBe('近30天');
  });

  it('should have 14d as default period', () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    const activeTab = wrapper.find('.period-tab.active');
    expect(activeTab.text()).toBe('近14天');
  });

  it('should render chart container', () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.trend-chart').exists()).toBe(true);
  });

  it('should switch period when tab is clicked', async () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    const tabs = wrapper.findAll('.period-tab');
    
    await tabs[1].trigger('click');
    
    const activeTab = wrapper.find('.period-tab.active');
    expect(activeTab.text()).toBe('近30天');
  });

  it('should not switch period if same tab is clicked', async () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    const tabs = wrapper.findAll('.period-tab');
    
    await tabs[0].trigger('click');
    
    const activeTabs = wrapper.findAll('.period-tab.active');
    expect(activeTabs).toHaveLength(1);
  });

  it('should have default empty filterParams', () => {
    const wrapper = mount(TrendChart);
    expect(wrapper.props('filterParams')).toEqual({});
  });

  it('should have trend-chart-wrap class', () => {
    const wrapper = mount(TrendChart, {
      props: { filterParams: {} }
    });
    expect(wrapper.find('.trend-chart-wrap').exists()).toBe(true);
  });
});
