import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterBar from '../components/FilterBar.vue';

vi.mock('../api', () => ({
  getCityList: vi.fn(() =>
    Promise.resolve({
      code: 0,
      data: [
        { code: 'BJ', name: '北京' },
        { code: 'SH', name: '上海' },
        { code: 'GZ', name: '广州' }
      ]
    })
  ),
  getStoreList: vi.fn((cityCode) =>
    Promise.resolve({
      code: 0,
      data: cityCode === 'BJ'
        ? [
            { id: 'store1', name: '北京朝阳店' },
            { id: 'store2', name: '北京海淀店' }
          ]
        : []
    })
  )
}));

describe('FilterBar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultModelValue = {
    city: '',
    store: '',
    timeRange: '14d',
    startDate: '',
    endDate: ''
  };

  it('should render filter label', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    expect(wrapper.find('.filter-label').text()).toContain('数据筛选');
  });

  it('should render city selector', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('should render time tabs', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    const tabs = wrapper.findAll('.time-tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('should have 14d as default time range', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    const activeTab = wrapper.find('.time-tab.active');
    expect(activeTab.text()).toContain('近14天');
  });

  it('should emit update:modelValue when time tab is clicked', async () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    const tabs = wrapper.findAll('.time-tab');
    
    await tabs[2].trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('should render reset button', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    expect(wrapper.find('.reset-btn').exists()).toBe(true);
  });

  it('should reset filters when reset button is clicked', async () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: { ...defaultModelValue, city: 'BJ' } }
    });
    
    await wrapper.find('.reset-btn').trigger('click');
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted[emitted.length - 1][0].city).toBe('');
  });

  it('should not show active filter bar when no active filters', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    expect(wrapper.find('.active-filter-bar').exists()).toBe(false);
  });

  it('should show active filter bar when city is selected', async () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: { ...defaultModelValue, city: 'BJ' } }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.active-filter-bar').exists()).toBe(true);
  });

  it('should emit change event when filter changes', async () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    const tabs = wrapper.findAll('.time-tab');
    
    await tabs[1].trigger('click');
    
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('should have default modelValue', () => {
    const wrapper = mount(FilterBar);
    expect(wrapper.props('modelValue')).toEqual({
      city: '',
      store: '',
      timeRange: '14d',
      startDate: '',
      endDate: ''
    });
  });

  it('should show date inputs when timeRange is custom', async () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: { ...defaultModelValue, timeRange: 'custom' } }
    });
    expect(wrapper.find('.date-range').exists()).toBe(true);
  });

  it('should not show date inputs when timeRange is not custom', () => {
    const wrapper = mount(FilterBar, {
      props: { modelValue: defaultModelValue }
    });
    expect(wrapper.find('.date-range').exists()).toBe(false);
  });
});
