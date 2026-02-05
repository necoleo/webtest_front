<template>
  <div class="container">
    <t-layout class="functional-test-container">
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
              <h2> 功能测试用例管理 </h2>
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
            <span>功能测试 / 测试用例列表</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <form class="filter-actions-container"
                  @submit.prevent="handle_click_search_button"
            >
              <t-input
                  class="search-input"
                  v-model="search_test_case_id"
                  placeholder="输入用例id"
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
                  v-model="search_case_title"
                  placeholder="输入用例标题"
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
                  v-model="search_requirement_id"
                  placeholder="输入关联需求id"
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
                  v-model="search_priority"
                  :options="priority_options"
                  clearable
                  size="medium"
                  placeholder="优先级"
              />

              <t-select
                  class="search-select"
                  v-model="search_case_source"
                  :options="case_source_options"
                  clearable
                  size="medium"
                  placeholder="用例来源"
              />

              <t-select
                  class="search-select"
                  v-model="search_execution_status"
                  :options="execution_status_options"
                  clearable
                  size="medium"
                  placeholder="执行状态"
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
                  type="button"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <t-button
                  class="create-test-case-button"
                  theme="primary"
                  variant="outline"
                  @click="show_create_dialog = true"
              >
                新建用例
              </t-button>
            </form>

            <div class="test-case-table-container">
              <t-table
                  class="test-case-table"
                  row-key="test_case_id"
                  :data="test_case_data"
                  :columns="columns"
                  :stripe="false"
                  :bordered="false"
                  :hover="hover"
                  :table-layout="tableLayout ? 'auto' : 'fixed'"
                  :size="size"
                  :pagination="pagination"
                  :show-header="showHeader"
                  cell-empty-content="-"
                  resizable
                  lazy-load
              >
                <template #case_title="{ row }">
                  <t-link theme="primary"
                          hover="color"
                          @click="handle_view_detail(row)"
                  >
                    {{ row.case_title }}
                  </t-link>
                </template>
                <template #priority="{ row }">
                  <t-tag :theme="get_priority_theme(row.priority)">
                    {{ get_priority_text(row.priority) }}
                  </t-tag>
                </template>
                <template #case_source="{ row }">
                  <t-tag :theme="get_case_source_theme(row.case_source)">
                    {{ get_case_source_text(row.case_source) }}
                  </t-tag>
                </template>
                <template #execution_status="{ row }">
                  <t-tag :theme="get_execution_status_theme(row.execution_status)">
                    {{ get_execution_status_text(row.execution_status) }}
                  </t-tag>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="view_test_case_button"
                        theme="primary"
                        hover="color"
                        @click="handle_view_detail(row)"
                    >
                      详情
                    </t-link>
                    <t-link
                        v-if="row.execution_status === 0"
                        theme="primary"
                        hover="color"
                        @click="handle_start_execute(row)"
                    >
                      执行
                    </t-link>
                    <t-link
                        v-if="row.execution_status === 1"
                        theme="primary"
                        hover="color"
                        @click="handle_mark_pass(row)"
                    >
                      通过
                    </t-link>
                    <t-link
                        v-if="row.execution_status === 1"
                        theme="primary"
                        hover="color"
                        @click="handle_mark_fail(row)"
                    >
                      失败
                    </t-link>
                    <t-link
                        class="edit_test_case_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.test_case_id)"
                        @click="handle_update_test_case(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_test_case_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.test_case_id)"
                        @click="handle_delete_test_case(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <functional-test-case-detail-dialog
                v-model:visible="show_detail_dialog"
                :test_case_data="selected_test_case_data"
            ></functional-test-case-detail-dialog>
            <create-functional-test-case-dialog
                v-model:visible="show_create_dialog"
                @success="refresh_test_case_list"
            ></create-functional-test-case-dialog>
            <update-functional-test-case-dialog
                v-model:visible="show_update_dialog"
                :test_case_data="updated_test_case_data"
                @success="refresh_test_case_list"
            ></update-functional-test-case-dialog>
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
import { MessagePlugin, DialogPlugin} from 'tdesign-vue-next';
import {request} from "@/api/urls.ts";
import FunctionalTestCaseDetailDialog from "@/views/functional_test/components/FunctionalTestCaseDetailDialog.vue";
import CreateFunctionalTestCaseDialog from "@/views/functional_test/components/CreateFunctionalTestCaseDialog.vue";
import UpdateFunctionalTestCaseDialog from "@/views/functional_test/components/UpdateFunctionalTestCaseDialog.vue";

interface test_case_data {
  test_case_id: number;
  project_id: number;
  requirement_id: number;
  case_title: string;
  precondition: string;
  test_steps: string;
  expected_result: string;
  module: string;
  priority: number;
  comment: string;
  case_source: number;
  execution_status: number;
  created_user: string;
  created_at: string;
}

// 优先级map
const priority_map: Record<number, string> = {
  0: 'P0-最高',
  1: 'P1-高',
  2: 'P2-中',
  3: 'P3-低'
}

// 用例来源map
const case_source_map: Record<number, string> = {
  0: '手动创建',
  1: 'AI生成',
  2: '导入'
}

// 执行状态map
const execution_status_map: Record<number, string> = {
  0: '未执行',
  1: '执行中',
  2: '通过',
  3: '失败'
}

// 优先级主题
const get_priority_theme = (priority: number): string => {
  switch (priority) {
    case 0: return "danger";
    case 1: return "warning";
    case 2: return "primary";
    case 3: return "default";
    default: return "default";
  }
}

const get_priority_text = (priority: number): string => {
  return priority_map[priority] || "未知"
}

// 用例来源主题
const get_case_source_theme = (case_source: number): string => {
  switch (case_source) {
    case 0: return "default";
    case 1: return "primary";
    case 2: return "warning";
    default: return "default";
  }
}

const get_case_source_text = (case_source: number): string => {
  return case_source_map[case_source] || "未知"
}

// 执行状态主题
const get_execution_status_theme = (status: number): string => {
  switch (status) {
    case 0: return "default";
    case 1: return "warning";
    case 2: return "success";
    case 3: return "danger";
    default: return "default";
  }
}

const get_execution_status_text = (status: number): string => {
  return execution_status_map[status] || "未知"
}

// 测试用例列表
const test_case_data = ref<test_case_data[]>([]);

// 搜索框
const search_test_case_id = ref<number | undefined>();
const search_case_title = ref<string>("")
const search_requirement_id = ref<number | undefined>();
const search_priority = ref<number | undefined>();
const search_case_source = ref<number | undefined>();
const search_execution_status = ref<number | undefined>();

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 详情弹窗
const show_detail_dialog = ref<boolean>(false);
const selected_test_case_data = ref<test_case_data | null>(null)

// 创建弹窗
const show_create_dialog = ref<boolean>(false);

// 编辑弹窗
const show_update_dialog = ref<boolean>(false)
const updated_test_case_data = ref<test_case_data | null>(null)

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

// 筛选选项
const priority_options = [
  { label: "P0-最高", value: 0 },
  { label: "P1-高", value: 1 },
  { label: "P2-中", value: 2 },
  { label: "P3-低", value: 3 }
]

const case_source_options = [
  { label: "手动创建", value: 0 },
  { label: "AI生成", value: 1 },
  { label: "导入", value: 2 }
]

const execution_status_options = [
  { label: "未执行", value: 0 },
  { label: "执行中", value: 1 },
  { label: "通过", value: 2 },
  { label: "失败", value: 3 }
]

const hover = ref(false);
const size = ref<TableProps['size']>('large');
const tableLayout = ref(false);
const showHeader = ref(true);

const columns = ref<TableProps['columns']>([
  { colKey: 'test_case_id', title: '用例id', width: 80 },
  { colKey: 'case_title', title: '用例标题', ellipsis: true },
  { colKey: 'requirement_id', title: '关联需求', width: 100 },
  { colKey: 'module', title: '模块', width: 100 },
  { colKey: 'priority', title: '优先级', width: 100 },
  { colKey: 'case_source', title: '来源', width: 100 },
  { colKey: 'execution_status', title: '执行状态', width: 100 },
  { colKey: 'created_user', title: '创建人', width: 100 },
  { colKey: 'created_at', title: '创建时间', width: 160 },
  { colKey: 'operation', title: '操作', width: 160 }
]);

// 刷新测试用例列表
const refresh_test_case_list = async () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }
  request.get(API_URLS.functional_test_case.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          test_case_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              test_case_id: item.id,
              project_id: item.project_id,
              requirement_id: item.requirement_id,
              case_title: item.case_title,
              precondition: item.precondition,
              test_steps: item.test_steps,
              expected_result: item.expected_result,
              module: item.module,
              priority: item.priority,
              comment: item.comment,
              case_source: item.case_source,
              execution_status: item.execution_status,
              created_user: item.created_user,
              created_at: item.created_at,
            }
          });
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
}

refresh_test_case_list()

// 点击搜索按钮
const handle_click_search_button = () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }
  if (search_test_case_id.value != undefined) {
    params.test_case_id = search_test_case_id.value;
  }
  if (search_case_title.value != "") {
    params.case_title = search_case_title.value;
  }
  if (search_requirement_id.value != undefined) {
    params.requirement_id = search_requirement_id.value;
  }
  if (search_priority.value != undefined) {
    params.priority = search_priority.value;
  }
  if (search_case_source.value != undefined) {
    params.case_source = search_case_source.value;
  }
  if (search_execution_status.value != undefined) {
    params.execution_status = search_execution_status.value;
  }

  request.get(API_URLS.functional_test_case.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          test_case_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              test_case_id: item.id,
              project_id: item.project_id,
              requirement_id: item.requirement_id,
              case_title: item.case_title,
              precondition: item.precondition,
              test_steps: item.test_steps,
              expected_result: item.expected_result,
              module: item.module,
              priority: item.priority,
              comment: item.comment,
              case_source: item.case_source,
              execution_status: item.execution_status,
              created_user: item.created_user,
              created_at: item.created_at,
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
  search_test_case_id.value = undefined;
  search_case_title.value = ""
  search_requirement_id.value = undefined
  search_priority.value = undefined;
  search_case_source.value = undefined;
  search_execution_status.value = undefined;
  pagination.value!.current = 1
  handle_click_search_button()
}

// 查看详情
const handle_view_detail = (row: test_case_data) => {
  show_detail_dialog.value = true
  selected_test_case_data.value = row
}

// 点击执行
const handle_start_execute = (row: test_case_data) => {
  const test_case_id = row.test_case_id
  loading_row.value.add(test_case_id)
  if (!test_case_id){
    MessagePlugin.error("测试用例不存在")
    return ;
  }
  request.post(API_URLS.functional_test_case.update, {test_case_id: test_case_id, execution_status: 1})
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新状态成功`);
          refresh_test_case_list();
        }
        else {
          MessagePlugin.error(`更新状态失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新状态失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading_row.value.delete(test_case_id);
      });
}

// 点击通过
const handle_mark_pass = (row: test_case_data) => {
  const test_case_id = row.test_case_id
  loading_row.value.add(test_case_id)
  if (!test_case_id){
    MessagePlugin.error("测试用例不存在")
    return ;
  }
  request.post(API_URLS.functional_test_case.update, {test_case_id: test_case_id, execution_status: 2})
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新状态成功`);
          refresh_test_case_list();
        }
        else {
          MessagePlugin.error(`更新状态失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新状态失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading_row.value.delete(test_case_id);
      });
}

// 点击失败
const handle_mark_fail = (row: test_case_data) => {
  const test_case_id = row.test_case_id
  loading_row.value.add(test_case_id)
  if (!test_case_id){
    MessagePlugin.error("测试用例不存在")
    return ;
  }
  request.post(API_URLS.functional_test_case.update, {test_case_id: test_case_id, execution_status: 3})
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新状态成功`);
          refresh_test_case_list();
        }
        else {
          MessagePlugin.error(`更新状态失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新状态失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading_row.value.delete(test_case_id);
      });
}

// 点击编辑
const handle_update_test_case = (row: test_case_data) => {
  show_update_dialog.value = true
  updated_test_case_data.value = row
}

// 点击删除
const handle_delete_test_case = (row: test_case_data) => {
  const test_case_id = row.test_case_id;
  loading_row.value.add(test_case_id)
  if (!test_case_id){
    MessagePlugin.error("测试用例不存在")
    return ;
  }
  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除测试用例「${row.case_title}」吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(test_case_id)
      request.post(API_URLS.functional_test_case.delete, { test_case_id: test_case_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除测试用例成功`);
              refresh_test_case_list();
            }
            else {
              MessagePlugin.error(`删除失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`删除失败: ${e.response?.data?.message || e.message}`);
          })
          .finally(() => {
            loading_row.value.delete(test_case_id);
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      loading_row.value.delete(test_case_id);
      confirm_dialog.destroy();
    },
    onCancel: () => {
      loading_row.value.delete(test_case_id);
      confirm_dialog.destroy();
    }
  });
}

</script>

<style scoped>
.functional-test-container{
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
  width: 12%;
}

:deep(.search-input .t-input) {
  border-radius: 12px;
  height: 40px;
}

.search-select{
  width: 10%;
}

:deep(.t-input.t-is-readonly) {
  border-radius: 12px;
  height: 40px;
}

/* 搜索、重置、新建按钮  */
.search-button,
.reset-search-button,
.create-test-case-button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 测试用例表单样式 */
.test-case-table-container{
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
