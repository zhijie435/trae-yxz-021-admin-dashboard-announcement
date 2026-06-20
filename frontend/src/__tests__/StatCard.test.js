import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from '../components/StatCard.vue';

describe('StatCard.vue', () => {
  const defaultProps = {
    label: '总订单数',
    value: 12345,
    todayValue: 100,
    icon: '📦',
    color: '#00d4ff'
  };

  it('should render label correctly', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.card-label').text()).toBe('总订单数');
  });

  it('should render formatted value', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.card-value .number').text()).toBe('1.2万');
  });

  it('should render today value', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.today-value').text()).toContain('100');
  });

  it('should render icon', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.card-icon span').text()).toBe('📦');
  });

  it('should apply custom color via CSS variable', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.attributes('style')).toContain('--card-color: #00d4ff');
  });

  it('should show prefix when provided', () => {
    const wrapper = mount(StatCard, {
      props: { ...defaultProps, prefix: '¥' }
    });
    const prefixes = wrapper.findAll('.prefix');
    expect(prefixes.length).toBeGreaterThan(0);
    expect(prefixes[0].text()).toBe('¥');
  });

  it('should show unit when provided', () => {
    const wrapper = mount(StatCard, {
      props: { ...defaultProps, unit: '单' }
    });
    const units = wrapper.findAll('.unit');
    expect(units.length).toBeGreaterThan(0);
    expect(units[0].text()).toBe('单');
  });

  it('should not show prefix when not provided', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.prefix').exists()).toBe(false);
  });

  it('should not show unit when not provided', () => {
    const wrapper = mount(StatCard, { props: defaultProps });
    expect(wrapper.find('.unit').exists()).toBe(false);
  });

  it('should have correct default props', () => {
    const wrapper = mount(StatCard, {
      props: { label: 'Test', value: 100 }
    });
    expect(wrapper.props('todayValue')).toBe(0);
    expect(wrapper.props('icon')).toBe('📊');
    expect(wrapper.props('color')).toBe('#00d4ff');
    expect(wrapper.props('prefix')).toBe('');
    expect(wrapper.props('unit')).toBe('');
  });

  it('should format large numbers correctly', () => {
    const wrapper = mount(StatCard, {
      props: { ...defaultProps, value: 150000000 }
    });
    expect(wrapper.find('.card-value .number').text()).toBe('1.50亿');
  });
});
