import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AnnouncementModal from '../components/AnnouncementModal.vue';

describe('AnnouncementModal.vue', () => {
  const types = {
    rule_update: { label: '规则更新', icon: '📋', color: '#00d4ff' },
    system: { label: '系统通知', icon: '🔔', color: '#7c5cff' },
    activity: { label: '活动公告', icon: '🎉', color: '#ff6b9d' }
  };

  const levels = {
    normal: { label: '普通', color: '#32d583' },
    important: { label: '重要', color: '#ffa94d' },
    urgent: { label: '紧急', color: '#ff6b6b' }
  };

  const emptyForm = {
    id: null,
    type: 'rule_update',
    level: 'normal',
    title: '',
    content: '',
    scope: '全部门店',
    publisher: '',
    status: 'published'
  };

  it('should render modal title for new announcement', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.modal-header h3').text()).toBe('发布新公告');
  });

  it('should render modal title for edit announcement', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: { ...emptyForm, id: 1 },
        types,
        levels
      }
    });
    expect(wrapper.find('.modal-header h3').text()).toBe('编辑公告');
  });

  it('should render type picker with options', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    const typeOptions = wrapper.findAll('.type-option');
    expect(typeOptions).toHaveLength(3);
  });

  it('should have active type option for selected type', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    const activeType = wrapper.find('.type-option.active');
    expect(activeType.exists()).toBe(true);
    expect(activeType.text()).toContain('规则更新');
  });

  it('should render level select', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    const selects = wrapper.findAll('.form-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should render title input', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.form-input').exists()).toBe(true);
  });

  it('should render content textarea', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.form-textarea').exists()).toBe(true);
  });

  it('should render cancel button', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-ghost').text()).toBe('取消');
  });

  it('should render publish button', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-primary').text()).toBe('立即发布');
  });

  it('should show save draft button for new announcement', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-secondary').text()).toBe('保存草稿');
  });

  it('should show save draft button for draft status', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: { ...emptyForm, id: 1, status: 'draft' },
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-secondary').exists()).toBe(true);
  });

  it('should not show save draft button for published status', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: { ...emptyForm, id: 1, status: 'published' },
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-secondary').exists()).toBe(false);
  });

  it('should show update button text for published announcement', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: { ...emptyForm, id: 1, status: 'published' },
        types,
        levels
      }
    });
    expect(wrapper.find('.btn-primary').text()).toBe('更新公告');
  });

  it('should emit close event when cancel button is clicked', async () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    await wrapper.find('.btn-ghost').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should emit save event with published status when publish button is clicked', async () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    await wrapper.find('.btn-primary').trigger('click');
    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toBe('published');
  });

  it('should emit save event with draft status when save draft button is clicked', async () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    await wrapper.find('.btn-secondary').trigger('click');
    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0][0]).toBe('draft');
  });

  it('should show title character count', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: { ...emptyForm, title: '测试标题' },
        types,
        levels
      }
    });
    const charCounts = wrapper.findAll('.char-count');
    expect(charCounts.length).toBeGreaterThan(0);
  });

  it('should have required indicator on type label', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    const requiredMarks = wrapper.findAll('.required');
    expect(requiredMarks.length).toBeGreaterThan(0);
  });

  it('should disable buttons when submitting', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels,
        submitting: true
      }
    });
    expect(wrapper.find('.btn-primary').classes()).toContain('disabled');
    expect(wrapper.find('.btn-secondary').classes()).toContain('disabled');
  });

  it('should render close button', () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    expect(wrapper.find('.modal-close').exists()).toBe(true);
  });

  it('should emit close when modal close button is clicked', async () => {
    const wrapper = mount(AnnouncementModal, {
      props: {
        formData: emptyForm,
        types,
        levels
      }
    });
    await wrapper.find('.modal-close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
