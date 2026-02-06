<template>
  <div class="container">
    <t-layout class="requirement-container">
      <!-- 侧边栏区域 -->
      <t-aside>
        <div class="sidebar-section">
          <Sidebar :menu_items="default_menu"/>
        </div>
      </t-aside>
      <t-layout>
        <!-- 顶部导航栏 -->
        <t-header>
          <t-head-menu>
            <div class="header-menu">
              <h2> 需求项管理 </h2>
              <div class="header-menu-operations">
                <t-button
                    variant="text"
                    shape="square"
                >
                  <template #icon>
                    <t-icon name="user"/>
                  </template>
                </t-button>
              </div>
            </div>
          </t-head-menu>
        </t-header>
        <t-content>
          <div class="current_page_path">
            <span>需求文档管理 / 需求项管理</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <form class="filter-actions-container"
                  @submit.prevent="handle_click_search_button"
            >
              <t-select
                  class="search-select"
                  v-model="search_module"
                  :options="module_options"
                  placeholder="选择所属模块"
                  clearable
                  size="medium"
              />
              <t-input
                  class="search-input"
                  v-model="search_requirement_id"
                  placeholder="输入需求项id"
                  clearable
                  size="medium"
                  type="number"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-input
                  class="search-input"
                  v-model="search_requirement_title"
                  placeholder="输入需求标题"
                  clearable
                  size="medium"
                  type="search"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-input
                  class="search-input"
                  v-model="search_requirement_document_id"
                  placeholder="输入所属文档id"
                  clearable
                  size="medium"
                  type="number"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-select
                  class="search-select"
                  v-model="search_status"
                  :options="status_filter_options"
                  clearable
                  size="medium"
                  placeholder="全部状态"
              />

              <t-button
                  class="search-button"
                  type="submit"
                  variant="outline"
              >
                搜索
              </t-button>
              <t-button
                  class="reset-search-button"
                  variant="outline"
                  type="button"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <t-button
                  class="batch-audit-button"
                  theme="primary"
                  variant="outline"
                  :disabled="selected_row_keys.length === 0"
                  @click="handle_batch_audit"
              >
                批量审核
              </t-button>
              <t-button
                  class="batch-generate_test_case"
                  theme="primary"
                  variant="outline"
                  :disabled="selected_row_keys.length === 0"
                  @click="handle_batch_generate_test_case"
              >
                批量生成用例
              </t-button>
            </form>

            <div class="requirement-table-container">
              <t-table
                  class="requirement-table"
                  row-key="requirement_id"
                  :data="requirement_data"
                  :columns="columns"
                  :stripe="false"
                  :bordered="false"
                  :hover="hover"
                  :table-layout="tableLayout ? 'auto' : 'fixed'"
                  :size="size"
                  :pagination="pagination"
                  :show-header="showHeader"
                  :selected-row-keys="selected_row_keys"
                  cell-empty-content="-"
                  resizable
                  lazy-load
                  @select-change="handle_select_change"
              >
                <template #module="{ row }">
                  <t-tag v-if="row.module" :theme="'primary'" variant="light">
                    {{ row.module }}
                  </t-tag>
                </template>
                <template #requirement_content="{ row }">
                  <t-link theme="primary"
                          hover="color"
                          @click="handle_view_detail(row)"
                  >
                    {{ truncate_content(row.requirement_content) }}
                  </t-link>
                </template>
                <template #status="{ row }">
                  <t-tag :theme="get_status_theme(row.status)">
                    {{ get_status_text(row.status) }}
                  </t-tag>
                </template>
                <template #is_vectorized="{ row }">
                  <t-tag :theme="row.is_vectorized ? 'success' : 'default'">
                    {{ row.is_vectorized ? '是' : '否' }}
                  </t-tag>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="view_requirement_button"
                        theme="primary"
                        hover="color"
                        @click="handle_view_detail(row)"
                    >
                      详情
                    </t-link>
                    <t-link
                        v-if="row.status === 0"
                        class="edit_requirement_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_id)"
                        @click="handle_update_requirement(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        v-if="row.status === 0"
                        class="audit_requirement_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_id)"
                        @click="handle_audit_requirement(row)"
                    >
                      审核
                    </t-link>
                    <t-link
                        v-if="row.status === 2"
                        class="generate_test_case_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_id)"
                        @click="handle_generate_test_case(row)"
                    >
                      生成用例
                    </t-link>
                    <t-link
                        class="delete_requirement_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_id) || row.status === 1"
                        @click="handle_delete_requirement(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <requirement-detail-dialog
                v-model:visible="show_detail_dialog"
                :requirement_data="selected_requirement_data"
            ></requirement-detail-dialog>
            <update-requirement-dialog
                v-model:visible="show_update_dialog"
                :requirement_data="updated_requirement_data"
                @success="refresh_all_data"
            ></update-requirement-dialog>
          </div>

        </t-content>
        <t-footer>
          Heypon AI 测试
        </t-footer>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "@/components/Sidebar.vue";
import {default_menu} from "@/config/sidebar_menus";
import {API_URLS} from "@/api/urls.ts";
import {ref} from "vue";
import type {TableProps} from "tdesign-vue-next";
import { MessagePlugin,DialogPlugin} from 'tdesign-vue-next';
import {request} from "@/api/urls.ts";
import RequirementDetailDialog from "@/views/requirement/components/RequirementDetailDialog.vue";
import UpdateRequirementDialog from "@/views/requirement/components/UpdateRequirementDialog.vue";



interface requirement_data {
  requirement_id: number;
  project_id: number;
  requirement_document_id: number;
  requirement_title: string;
  requirement_content: string;
  module: string;
  status: number;
  is_vectorized: boolean;
  created_at: string;
  updated_at: string;
}

// 需求项状态map
const status_map: Record<number, string> = {
  0: '待审核',
  1: '处理中',
  2: '已审核',
  3: '用例生成中',
  4: '用例已覆盖',
  5: '已废弃'
}

// 状态主题映射
const get_status_theme = (status: number | null): string => {
  switch (status) {
    case 0: return "default";
    case 1: return "warning";
    case 2: return "success";
    case 3: return "primary";
    case 4: return "success";
    case 5: return "danger";
    default: return "default";
  }
}

const get_status_text = (status: number | null): string => {
  if (status === null || status === undefined) {
    return "未知"
  }
  return status_map[status] || "未知"
}

// 截断内容
const truncate_content = (content: string): string => {
  if (!content) return "-"
  return content.length > 50 ? content.substring(0, 50) + "..." : content
}

// 需求项列表初始化
const requirement_data = ref<requirement_data[]>([]);

// 搜索框-需求项id
const search_requirement_id = ref<number | undefined>();

// 搜索框-需求项标题
const search_requirement_title = ref<string>("")

// 搜索框-所属需求文档id
const search_requirement_document_id = ref<number | undefined>();

// 搜索框-需求项状态
const search_status = ref<number | undefined>();

// 搜索框-模块
const search_module = ref<string>("");
// 所属模块下拉选项
const module_options = ref<{label: string; value: string}[]>([])

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 选中的行
const selected_row_keys = ref<number[]>([]);

// 详情弹窗
const show_detail_dialog = ref<boolean>(false);
const selected_requirement_data = ref<requirement_data | null>(null)

// 编辑弹窗
const show_update_dialog = ref<boolean>(false)
const updated_requirement_data = ref<requirement_data | null>(null)

// 总页数
const total = ref(0)
const pagination = ref<TableProps['pagination']>({
  current: 1,
  pageSize: 20,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current;
    pagination.value!.pageSize = pageInfo.pageSize;
    handle_click_search_button()
  }
});

// 需求项状态选项
const status_filter_options = [
  { label: "待审核", value: 0 },
  { label: "处理中", value: 1 },
  { label: "已审核", value: 2 },
  { label: "用例生成中", value: 3 },
  { label: "用例已覆盖", value: 4 },
  { label: "已废弃", value: 5 }
]

const hover = ref(false);
const size = ref<TableProps['size']>('large');
const tableLayout = ref(false);
const showHeader = ref(true);

const columns = ref<TableProps['columns']>([
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'requirement_id', title: '需求项id', width: 100 },
  { colKey: 'requirement_title', title: '需求标题', ellipsis: true },
  { colKey: 'requirement_content', title: '需求内容', ellipsis: true },
  { colKey: 'requirement_document_id', title: '所属文档', width: 100 },
  { colKey: 'module', title: '模块', width: 100 },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'is_vectorized', title: '已向量化', width: 100 },
  { colKey: 'created_at', title: '创建时间', width: 160 },
  { colKey: 'operation', title: '操作', width: 200 }
]);

// 获取模块列表
const fetch_modules_list = async () => {
  request.get(API_URLS.requirement.modules)
      .then((res) => {
        console.log(res)
        if (res.status === 200 && res.data.code === "000000"){
          module_options.value = res.data.data.module.map((item: any) => ({
            label: `${item.module} (${item.count})`,
            value: item.module
          }))
          console.log(module_options.value)
        }
      })
}

// 刷新需求项列表
const refresh_requirement_list = async () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }
  request.get(API_URLS.requirement.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          requirement_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              requirement_id: item.id,
              project_id: item.project_id,
              requirement_document_id: item.requirement_document_id,
              requirement_title: item.requirement_title,
              requirement_content: item.requirement_content,
              module: item.module,
              status: item.status,
              is_vectorized: item.is_vectorized,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }
          });
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
}

const refresh_all_data = () => {
  // 获取模块列表
  fetch_modules_list()
  refresh_requirement_list()
}

refresh_all_data()

// 点击搜索按钮
const handle_click_search_button = () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }
  if (search_requirement_id.value != undefined) {
    params.requirement_id = search_requirement_id.value;
  }
  if (search_requirement_title.value != "") {
    params.requirement_title = search_requirement_title.value;
  }
  if (search_requirement_document_id.value != undefined) {
    params.requirement_document_id = search_requirement_document_id.value;
  }
  if (search_status.value != undefined) {
    params.status = search_status.value;
  }
  if (search_module.value != "") {
    params.module = search_module.value;
  }

  request.get(API_URLS.requirement.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          requirement_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              requirement_id: item.id,
              project_id: item.project_id,
              requirement_document_id: item.requirement_document_id,
              requirement_title: item.requirement_title,
              requirement_content: item.requirement_content,
              module: item.module,
              status: item.status,
              is_vectorized: item.is_vectorized,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }
          });
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
}

// 点击重置按钮
const handle_click_reset_button = () => {
  search_requirement_id.value = undefined;
  search_requirement_title.value = ""
  search_requirement_document_id.value = undefined
  search_status.value = undefined;
  search_module.value = ""
  pagination.value!.current = 1
  handle_click_search_button()
}

// 选择行变化
const handle_select_change = (selectedRowKeys: number[]) => {
  selected_row_keys.value = selectedRowKeys
}

// 查看详情
const handle_view_detail = (row: requirement_data) => {
  show_detail_dialog.value = true
  selected_requirement_data.value = row
}

// 点击编辑需求项
const handle_update_requirement = (row: requirement_data) => {
  show_update_dialog.value = true
  updated_requirement_data.value = row
}

// 审核单个需求项
const handle_audit_requirement = (row: requirement_data) => {
  const requirement_id = row.requirement_id
  loading_row.value.add(requirement_id)

  const confirm_dialog = DialogPlugin.confirm({
    header: '确认审核',
    body: `确定要审核需求项「${row.requirement_title || row.requirement_id}」吗？审核后将触发向量化处理。`,
    confirmBtn: '确认',
    cancelBtn: '取消',
    theme: 'info',
    onConfirm: () => {
      request.post(API_URLS.requirement.audit, { requirement_id_list: [requirement_id] })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`审核提交成功`);
              refresh_requirement_list();
            }
            else {
              MessagePlugin.error(`审核失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`审核失败: ${e.response?.data?.message || e.message}`);
          })
          .finally(() => {
            loading_row.value.delete(requirement_id);
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      loading_row.value.delete(requirement_id);
      confirm_dialog.destroy();
    },
    onCancel: () => {
      loading_row.value.delete(requirement_id);
      confirm_dialog.destroy();
    }
  });
}

// 生成单个需求项的测试用例
const handle_generate_test_case = (row: requirement_data) => {
  const requirement_id = row.requirement_id
  loading_row.value.add(requirement_id)

  request.post(API_URLS.functional_test_case.generate, { requirement_id_list: [requirement_id] })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`提交生成测试用例成功`);
          refresh_requirement_list();
        }
        else {
          MessagePlugin.error(`生成测试用例失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`生成测试用例失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading_row.value.delete(requirement_id);
      });
}

// 批量审核
const handle_batch_audit = () => {
  if (selected_row_keys.value.length === 0) {
    MessagePlugin.warning("请选择要审核的需求项")
    return
  }

  // 检查是否有非待审核状态的需求项
  const invalid_rows = requirement_data.value.filter(
      row => selected_row_keys.value.includes(row.requirement_id) && row.status !== 0
  )
  if (invalid_rows.length > 0) {
    MessagePlugin.warning("只能审核待审核状态的需求项")
    return
  }

  const confirm_dialog = DialogPlugin.confirm({
    header: '确认批量审核',
    body: `确定要审核选中的 ${selected_row_keys.value.length} 个需求项吗？审核后将触发向量化处理。`,
    confirmBtn: '确认',
    cancelBtn: '取消',
    theme: 'info',
    onConfirm: () => {
      request.post(API_URLS.requirement.audit, { requirement_id_list: selected_row_keys.value })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`批量审核提交成功`);
              selected_row_keys.value = []
              refresh_requirement_list();
            }
            else {
              MessagePlugin.error(`批量审核失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`批量审核失败: ${e.response?.data?.message || e.message}`);
          })
          .finally(() => {
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      confirm_dialog.destroy();
    },
    onCancel: () => {
      confirm_dialog.destroy();
    }
  });
}

// 批量生成测试用例
const handle_batch_generate_test_case = () => {
  if (selected_row_keys.value.length === 0) {
    MessagePlugin.warning("请选择要生成测试用例的需求项")
    return
  }

  // 检查是否有非已审核状态的需求项
  const invalid_rows = requirement_data.value.filter(
      row => selected_row_keys.value.includes(row.requirement_id) && row.status !== 2
  )
  if (invalid_rows.length > 0) {
    MessagePlugin.warning("只有已审核状态的需求项才能生成测试用例")
    return
  }
  request.post(API_URLS.functional_test_case.generate, { requirement_id_list: selected_row_keys.value })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`批量生成测试用例任务提交成功`);
          selected_row_keys.value = []
          refresh_requirement_list();
        }
        else {
          MessagePlugin.error(`批量生成失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`批量生成失败: ${e.response?.data?.message || e.message}`);
      })
}

// 点击删除需求项
const handle_delete_requirement = (row: requirement_data) => {
  const requirement_id = row.requirement_id;
  loading_row.value.add(requirement_id)
  if (!requirement_id){
    MessagePlugin.error("需求项不存在")
    return ;
  }
  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除需求项「${row.requirement_title || row.requirement_id}」吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(requirement_id)
      request.post(API_URLS.requirement.delete, { requirement_id: requirement_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除需求项成功`);
              refresh_requirement_list();
            }
            else {
              MessagePlugin.error(`删除失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`删除失败: ${e.response?.data?.message || e.message}`);
          })
          .finally(() => {
            loading_row.value.delete(requirement_id);
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      loading_row.value.delete(requirement_id);
      confirm_dialog.destroy();
    },
    onCancel: () => {
      loading_row.value.delete(requirement_id);
      confirm_dialog.destroy();
    }
  });
}

</script>

<style scoped>
.requirement-container{
  height: 100vh;
}

.sidebar-section{
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f0f0f0;
}

/* 布局相关 */
:deep(.t-layout .t-layout){
  height: 100%;
}

:deep(.t-layout__sider){
  height: 100%;
  width: 300px;
  border-radius: 20px;
  margin-right: 20px;
}

:deep(.t-layout__header){
  border-radius: 20px;
  overflow: hidden;
  height: 60px;
}

:deep(.t-layout__content){
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 20px;
  overflow: hidden;
  min-height: 0;
}

:deep(.t-head-menu){
  height: 100%;
}

.header-menu{
  display: flex;
  justify-content:  space-between;
  align-items: center;
  width: 100%;
  border-radius: 20px;
  padding: 20px;
}

.current_page_path{
  display: flex;
  font-size: 18px;
  padding: 10px;
}

.main-content{
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 24px;
  overflow: hidden;
  margin-top: 10px;
  min-height: 0;
}

/* 筛选操作栏 */
.filter-actions-container{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: #FFF;
  gap: 10px;
  padding: 0 20px;
}

.search-input{
  width: 15%;
}

:deep(.search-input .t-input) {
  border-radius: 12px;
  height: 40px;
}

.search-select{
  width: 12%;
}

:deep(.t-input.t-is-readonly) {
  border-radius: 12px;
  height: 40px;
}

:deep(.status-filter .t-input) {
  border-radius: 12px;
  transition: all 0.25s ease;
  height: 40px;
}

/* 搜索、重置、批量审核按钮  */
.search-button,
.reset-search-button,
.batch-audit-button,
.batch-generate_test_case{
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 需求项表单样式 */
.requirement-table-container{
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

:deep(.t-table) {
  display: flex;
  flex-direction: column;
  height: 800px;
  min-height: 0;
}

:deep(.t-table__header){
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.t-table__content){
  padding: 0 20px 20px 20px;
}

:deep(.t-table thead td, .t-table th){
  font-size: 16px;
}

/* 操作栏按钮 */
:deep(.t-link--theme-primary){
  padding-right: 5px;
}
</style>
