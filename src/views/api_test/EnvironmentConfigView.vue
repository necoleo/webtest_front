<template>
  <div class="container">
    <t-layout class="environment-config-container">
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
              <h2>环境配置</h2>
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
            <span> 接口测试 / 环境配置</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
              <t-select
                  v-model="filter_project_id"
                  placeholder="选择项目"
                  clearable
                  :loading="project_loading"
                  style="width: 200px;"
                  @change="refresh_environment_list"
              >
                <t-option
                    v-for="item in project_options"
                    :key="item.id"
                    :value="item.id"
                    :label="item.project_name"
                />
              </t-select>
              <t-button
                  class="add_environment_button"
                  theme="primary"
                  variant="outline"
                  @click="handle_create_environment"
              >
                新建环境
              </t-button>
            </div>
            <div class="environment_table_container">
              <t-table
                  class="environment-table"
                  row-key="id"
                  :data="environment_data"
                  :columns="columns"
                  :stripe="false"
                  :bordered="false"
                  :hover="hover"
                  :table-layout="table_layout ? 'auto' : 'fixed'"
                  :size="size"
                  :pagination="pagination"
                  :show-header="show_header"
                  :loading="table_loading"
                  cell-empty-content="-"
                  resizable
                  lazy-load
              >
                <template #is_default="{ row }">
                  <t-tag v-if="row.is_default" theme="success" variant="light">默认</t-tag>
                  <span v-else>-</span>
                </template>
                <template #headers="{ row }">
                  <t-popup
                      v-if="row.headers && Object.keys(row.headers).length > 0"
                      trigger="hover"
                      placement="top"
                  >
                    <t-tag theme="primary" variant="light">{{ Object.keys(row.headers).length }} 项</t-tag>
                    <template #content>
                      <pre class="json-preview">{{ JSON.stringify(row.headers, null, 2) }}</pre>
                    </template>
                  </t-popup>
                  <span v-else>-</span>
                </template>
                <template #variables="{ row }">
                  <t-popup
                      v-if="row.variables && Object.keys(row.variables).length > 0"
                      trigger="hover"
                      placement="top"
                  >
                    <t-tag theme="warning" variant="light">{{ Object.keys(row.variables).length }} 项</t-tag>
                    <template #content>
                      <pre class="json-preview">{{ JSON.stringify(row.variables, null, 2) }}</pre>
                    </template>
                  </t-popup>
                  <span v-else>-</span>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="edit_button"
                        theme="primary"
                        hover="color"
                        @click="handle_edit_environment(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.id)"
                        @click="handle_delete_environment(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>

            <!-- 新建环境弹窗 -->
            <CreateEnvironmentDialog
                v-model:visible="show_create_dialog"
                @success="refresh_environment_list"
            />

            <!-- 编辑环境弹窗 -->
            <UpdateEnvironmentDialog
                v-model:visible="show_update_dialog"
                :environment_data="current_environment"
                @success="refresh_environment_list"
            />
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
import {request} from "@/api/urls.ts";
import {MessagePlugin, type TableProps, DialogPlugin} from "tdesign-vue-next";
import {API_URLS} from "@/api/urls.ts";
import {ref, onMounted} from "vue";
import CreateEnvironmentDialog from "./components/CreateEnvironmentDialog.vue";
import UpdateEnvironmentDialog from "./components/UpdateEnvironmentDialog.vue";

// 环境数据接口
interface environment_item {
  id: number;
  project_id: number;
  env_name: string;
  base_url: string;
  timeout: number;
  headers: object;
  variables: object;
  description: string;
  is_default: boolean;
  created_user: string;
  created_at: string;
}

// 环境列表初始化
const environment_data = ref<environment_item[]>([])
const table_loading = ref(false)

// 项目筛选
const filter_project_id = ref<number | null>(null)
const project_loading = ref(false)
const project_options = ref<any[]>([])

// hover 效果
const hover = ref<boolean>(true);
// 表格布局
const table_layout = ref<string>("auto")
// 布局大小
const size = ref<string>("medium")
// 显示表头
const show_header = ref<boolean>(true)

// 总页数
const total = ref(0);
const pagination = ref<TableProps['pagination']>({
  current: 1,
  pageSize: 10,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current;
    pagination.value!.pageSize = pageInfo.pageSize;
    refresh_environment_list()
  }
});

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 弹窗状态
const show_create_dialog = ref(false)
const show_update_dialog = ref(false)
const current_environment = ref<any>(null)

// 列表行
const columns = ref<TableProps['columns']>([
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'env_name', title: '环境名称', width: 150 },
  { colKey: 'base_url', title: 'Base URL' },
  { colKey: 'timeout', title: '超时(秒)', width: 90 },
  { colKey: 'headers', title: 'Headers', width: 100 },
  { colKey: 'variables', title: 'Variables', width: 100 },
  { colKey: 'is_default', title: '默认', width: 80 },
  { colKey: 'created_user', title: '创建人', width: 100 },
  { colKey: 'created_at', title: '创建时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 120 },
]);

// 加载项目列表
const load_projects = async () => {
  project_loading.value = true
  request.get(API_URLS.project.list, { params: { page: 1, page_size: 100 } })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          project_options.value = res.data.data.results || []
        }
      })
      .finally(() => {
        project_loading.value = false
      })
}

// 刷新列表
const refresh_environment_list = async () => {
  table_loading.value = true
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 10,
  }
  if (filter_project_id.value) {
    params.project_id = filter_project_id.value
  }
  request.get(API_URLS.api_test_environment.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          environment_data.value = res.data.data.results;
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
      .finally(() => {
        table_loading.value = false
      })
}

// 新建环境
const handle_create_environment = () => {
  show_create_dialog.value = true
}

// 编辑环境
const handle_edit_environment = (row: environment_item) => {
  current_environment.value = row
  show_update_dialog.value = true
}

// 删除环境
const handle_delete_environment = (row: environment_item) => {
  const environment_id = row.id
  loading_row.value.add(environment_id)

  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除环境「${row.env_name}」吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(environment_id)
      request.post(API_URLS.api_test_environment.delete, { environment_id: environment_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除成功`);
              refresh_environment_list();
            }
            else {
              MessagePlugin.error(`删除失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`删除失败: ${e.response?.data?.message || e.message}`);
          })
          .finally(() => {
            loading_row.value.delete(environment_id);
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      loading_row.value.delete(environment_id);
      confirm_dialog.destroy();
    },
    onCancel: () => {
      loading_row.value.delete(environment_id);
      confirm_dialog.destroy();
    }
  });
}

onMounted(() => {
  load_projects()
  refresh_environment_list()
})
</script>

<style scoped>
.environment-config-container{
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
  justify-content: flex-start;
  align-items: center;
  height: 80px;
  background-color: #FFF;
  gap: 20px;
  padding: 0 20px;
}

.add_environment_button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 表格容器样式 */
.environment_table_container{
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

/* JSON 预览样式 */
.json-preview {
  margin: 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  max-width: 400px;
  max-height: 300px;
  overflow: auto;
  white-space: pre;
}

/* 下拉框样式 */
:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}
</style>
