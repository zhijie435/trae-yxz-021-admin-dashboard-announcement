import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementTypes,
  getAnnouncementVersion
} from '../api';

export const ANNOUNCEMENT_STATUS = {
  ALL: 'all',
  PUBLISHED: 'published',
  DRAFT: 'draft'
};

export const ANNOUNCEMENT_SCOPE_OPTIONS = [
  { label: '全部门店', value: '全部门店' },
  { label: '华东区域', value: '华东区域' },
  { label: '华北区域', value: '华北区域' },
  { label: '华南区域', value: '华南区域' },
  { label: '华中区域', value: '华中区域' },
  { label: '西南区域', value: '西南区域' },
  { label: '西北区域', value: '西北区域' },
  { label: '东北区域', value: '东北区域' }
];

export const createEmptyForm = () => ({
  id: null,
  type: 'rule_update',
  level: 'normal',
  title: '',
  content: '',
  scope: '全部门店',
  publisher: '',
  status: 'published'
});

export const useAnnouncement = () => {
  const types = reactive({});
  const levels = reactive({});
  const items = reactive([]);
  const pagination = reactive({ page: 1, pageSize: 5, total: 0 });
  const stats = reactive({ total: 0, published: 0, draft: 0, urgent: 0 });
  const showModal = ref(false);
  const submitting = ref(false);
  const currentVersion = ref(-1);
  const formData = reactive(createEmptyForm());

  let pollTimer = null;
  const POLL_INTERVAL = 5000;

  const filters = reactive({
    type: 'all',
    level: 'all',
    status: 'all'
  });

  const toast = reactive({ show: false, message: '', type: 'success' });

  const statusTabs = computed(() => [
    { key: ANNOUNCEMENT_STATUS.ALL, label: '全部', count: stats.total },
    { key: ANNOUNCEMENT_STATUS.PUBLISHED, label: '已发布', count: stats.published },
    { key: ANNOUNCEMENT_STATUS.DRAFT, label: '草稿', count: stats.draft }
  ]);

  const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize));

  const pageNumbers = computed(() => {
    const arr = [];
    const total = totalPages.value;
    const current = pagination.page;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  });

  const showToast = (message, type = 'success') => {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => { toast.show = false; }, 2500);
  };

  const checkVersion = async () => {
    try {
      const res = await getAnnouncementVersion();
      if (res.code === 0) {
        const newVersion = res.data.version;
        if (currentVersion.value !== -1 && newVersion !== currentVersion.value) {
          fetchData();
        }
        currentVersion.value = newVersion;
      }
    } catch (e) {
      console.error('检查公告版本失败', e);
    }
  };

  const startPolling = () => {
    if (pollTimer) return;
    pollTimer = setInterval(checkVersion, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const fetchData = async () => {
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize
      };
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.level !== 'all') params.level = filters.level;
      if (filters.status !== 'all') params.status = filters.status;

      const res = await getAnnouncements(params);
      if (res.code === 0) {
        items.splice(0, items.length, ...res.data.items);
        pagination.total = res.data.total;
        Object.assign(stats, res.data.stats);
      }

      const verRes = await getAnnouncementVersion();
      if (verRes.code === 0) {
        currentVersion.value = verRes.data.version;
      }
    } catch (e) {
      console.error('加载公告数据失败:', e);
    }
  };

  const goPage = (p) => {
    if (p < 1 || p > totalPages.value) return;
    pagination.page = p;
    fetchData();
  };

  const openPublishModal = (item = null) => {
    if (item) {
      Object.assign(formData, {
        id: item.id,
        type: item.type,
        level: item.level,
        title: item.title,
        content: item.content,
        scope: item.scope,
        publisher: item.publisher,
        status: item.status
      });
    } else {
      Object.assign(formData, createEmptyForm());
    }
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    Object.assign(formData, createEmptyForm());
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showToast('请填写公告标题', 'error');
      return false;
    }
    if (!formData.content.trim()) {
      showToast('请填写公告内容', 'error');
      return false;
    }
    if (!formData.type) {
      showToast('请选择公告类型', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (status) => {
    if (!validateForm()) return;
    if (submitting.value) return;
    submitting.value = true;

    try {
      const payload = {
        type: formData.type,
        level: formData.level,
        title: formData.title,
        content: formData.content,
        scope: formData.scope,
        publisher: formData.publisher || '系统管理员',
        status
      };

      let res;
      if (formData.id) {
        res = await updateAnnouncement(formData.id, payload);
      } else {
        res = await createAnnouncement(payload);
      }

      if (res.code === 0) {
        showToast(res.message || '操作成功', 'success');
        closeModal();
        pagination.page = 1;
        fetchData();
      } else {
        showToast(res.message || '操作失败', 'error');
      }
    } catch (e) {
      showToast('网络错误，请稍后重试', 'error');
      console.error(e);
    } finally {
      submitting.value = false;
    }
  };

  const handlePublish = async (item) => {
    try {
      const res = await updateAnnouncement(item.id, { status: 'published' });
      if (res.code === 0) {
        showToast('发布成功', 'success');
        fetchData();
      } else {
        showToast(res.message || '发布失败', 'error');
      }
    } catch (e) {
      showToast('网络错误', 'error');
      console.error(e);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`确定要删除公告"${item.title}"吗？此操作不可恢复。`)) return;
    try {
      const res = await deleteAnnouncement(item.id);
      if (res.code === 0) {
        showToast('删除成功', 'success');
        fetchData();
      } else {
        showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      showToast('网络错误', 'error');
      console.error(e);
    }
  };

  const loadTypes = async () => {
    try {
      const typeRes = await getAnnouncementTypes();
      if (typeRes.code === 0) {
        Object.assign(types, typeRes.data.types);
        Object.assign(levels, typeRes.data.levels);
      }
    } catch (e) {
      console.error('加载公告类型失败:', e);
    }
  };

  const init = async () => {
    await loadTypes();
    fetchData();
    startPolling();
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    stopPolling();
  });

  return {
    types,
    levels,
    items,
    pagination,
    stats,
    showModal,
    submitting,
    currentVersion,
    formData,
    filters,
    toast,
    statusTabs,
    totalPages,
    pageNumbers,
    showToast,
    fetchData,
    goPage,
    openPublishModal,
    closeModal,
    handleSave,
    handlePublish,
    handleDelete,
    startPolling,
    stopPolling
  };
};
