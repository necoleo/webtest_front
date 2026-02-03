<template>
  <div class="container">
    <t-layout class="api-test-case-container">
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
              <h2>接口用例管理</h2>
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
            <span> 接口测试 / 接口用例</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
              <t-input
                  class="search-input"
                  v-model="search_case_name"
                  placeholder="输入用例名称"
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
                  v-model="search_project_id"
                  placeholder="输入所属项目ID"
                  clearable
                  size="medium"
                  type="number"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-button
                  class="search-button"
                  type="primary"
                  variant="outline"
                  @click="handle_click_search_button"
              >
                搜索
              </t-button>
              <t-button
                  class="reset-search-button"
                  type="primary"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <t-button
                  class="add_test_case_button"
                  theme="primary"
                  variant="outline"
                  @click="show_upload_dialog = true"
              >
                上传用例
              </t-button>
            </div>
            <div class="test_case_table_container">
              <t-table
                  class="test-case-table"
                  row-key="id"
                  :data="test_case_data"
                  :columns="columns"
                  :stripe="false"
                  :bordered="false"
                  :hover="hover"
                  :table-layout="table_layout ? 'auto' : 'fixed'"
                  :size="size"
                  :pagination="pagination"
                  :show-header="show_header"
                  cell-empty-content="-"
                  resizable
                  lazy-load
              >
                <template #source="{ row }">
                  <t-tag :theme="row.source === 0 ? 'primary' : 'success'" variant="light">
                    {{ row.source === 0 ? '手动上传' : 'AI生成' }}
                  </t-tag>
                </template>
                <template #last_execution_status="{ row }">
                  <t-tag v-if="row.last_execution_status === 0" theme="warning" variant="light">待执行</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 1" theme="primary" variant="light">执行中</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 2" theme="success" variant="light">成功</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 3" theme="danger" variant="light">失败</t-tag>
                  <t-tag v-else theme="default" variant="light">未执行</t-tag>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="execute_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.id)"
                        @click="handle_execute_test_case(row)"
                    >
                      执行
                    </t-link>
                    <t-link
                        class="detail_button"
                        theme="primary"
                        hover="color"
                        @click="handle_view_detail(row)"
                    >
                      详情
                    </t-link>
                    <t-link
                        class="delete_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.id)"
                        @click="handle_delete_test_case(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <upload-api-test-case-dialog
                v-model:visible="show_upload_dialog"
                @success="refresh_test_case_list"
            ></upload-api-test-case-dialog>
            <execute-api-test-case-dialog
                v-model:visible="show_execute_dialog"
                :test_case="selected_test_case"
                @success="refresh_test_case_list"
            ></execute-api-test-case-dialog>
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
import {ref} from "vue";
import {useRouter} from "vue-router";
import UploadApiTestCaseDialog from "@/views/api_test/components/UploadApiTestCaseDialog.vue";
import ExecuteApiTestCaseDialog from "@/views/api_test/components/ExecuteApiTestCaseDialog.vue";

const router = useRouter()

// 测试用例数据接口
interface test_case_item {
  id: number;
  project_id: number;
  case_name: string;
  source: number;
  total_executions: number;
  last_execution_status: number;
  created_user: string;
  created_at: string;
}

// 测试用例列表初始化
const test_case_data = ref<test_case_item[]>([])

// 搜索框-用例名称
const search_case_name = ref("");
// 搜索框-所属项目id
const search_project_id = ref<number | undefined>();

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
  pageSize: 20,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current;
    pagination.value!.pageSize = pageInfo.pageSize;
    handle_click_search_button()
  }
});

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 上传弹窗
const show_upload_dialog = ref<boolean>(false)
// 执行弹窗
const show_execute_dialog = ref<boolean>(false)
// 选中的测试用例
const selected_test_case = ref<test_case_item | null>(null)

// 列表行
const columns = ref<TableProps['columns']>([
  {
    colKey: 'id',
    title: '编号',
    width: 80,
  },
  {
    colKey: 'case_name',
    title: '用例名称',
  },
  {
    colKey: 'project_id',
    title: '所属项目',
    width: 100,
  },
  {
    colKey: 'source',
    title: '来源',
    width: 100,
  },
  {
    colKey: 'total_executions',
    title: '执行次数',
    width: 100,
  },
  {
    colKey: 'last_execution_status',
    title: '最后执行状态',
    width: 120,
  },
  {
    colKey: 'created_user',
    title: '创建人',
    width: 100,
  },
  {
    colKey: 'created_at',
    title: '创建时间',
    width: 180,
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 180,
  },
]);

// 处理重置按钮
const handle_click_reset_button = () => {
  search_case_name.value = "";
  search_project_id.value = undefined;
  handle_click_search_button()
}

// 刷新列表
const refresh_test_case_list = async () => {
  request.get(API_URLS.api_test_case.list)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          test_case_data.value = res.data.data.results;
          console.log(test_case_data.value);
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
}

// 进来先刷新列表
refresh_test_case_list()

// 搜索
const handle_click_search_button = () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }

  if (search_case_name.value != "") {
    params.case_name = search_case_name.value;
  }
  if (search_project_id.value != undefined) {
    params.project_id = search_project_id.value;
  }

  request.get(API_URLS.api_test_case.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          test_case_data.value = res.data.data.results;
          total.value = res.data.data.total_count;
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })
}

// 执行测试用例
const handle_execute_test_case = (row: test_case_item) => {
  selected_test_case.value = row
  show_execute_dialog.value = true
}

// 查看详情
const handle_view_detail = (row: test_case_item) => {
  router.push({ name: 'ApiTestCaseDetail', params: { id: row.id } })
}

// 删除测试用例
const handle_delete_test_case = (row: test_case_item) => {
  const test_case_id = row.id
  loading_row.value.add(test_case_id)

  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除用例「${row.case_name}」吗？关联的定时任务也会被删除。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(test_case_id)
      request.post(API_URLS.api_test_case.delete, { test_case_id: test_case_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除成功`);
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
.api-test-case-container{
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
  gap: 20px;
  padding: 0 20px;
}

.search-input{
  width: 50%;
}

:deep(.search-input .t-input) {
  border-radius: 12px;
  height: 40px;
}

/* 搜索、重置、上传按钮  */
.search-button,
.reset-search-button,
.add_test_case_button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

.add_test_case_button {
  width: 25%;
}

/* 表格容器样式 */
.test_case_table_container{
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
