<template>
  <div class="container">
    <t-layout class="scheduled-task-container">
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
              <h2>定时任务</h2>
              <div class="header-menu-operations">
                <t-button
                    variant="text"
                    shape="square"
                    @click="refresh_schedule_list"
                >
                  <template #icon>
                    <t-icon name="refresh"/>
                  </template>
                </t-button>
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
            <span> 接口测试 / 定时任务</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
              <t-input
                  class="task-name-filter"
                  v-model="filter_task_name"
                  placeholder="任务名称"
                  clearable
              />

              <t-select
                  class="type-filter"
                  v-model="filter_schedule_type"
                  placeholder="调度类型"
                  clearable
              >
                <t-option :value="0" label="每天" />
                <t-option :value="1" label="每周" />
              </t-select>

              <t-select
                  class="status-filter"
                  v-model="filter_is_enabled"
                  placeholder="启用状态"
                  clearable
              >
                <t-option :value="true" label="已启用" />
                <t-option :value="false" label="已禁用" />
              </t-select>

              <t-button
                  class="search-button"
                  theme="primary"
                  variant="outline"
                  @click="handle_click_search_button"
              >
                查询
              </t-button>
              <t-button
                  class="reset-button"
                  theme="default"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <div class="spacer"></div>
              <t-button
                  class="add_schedule_button"
                  theme="primary"
                  @click="handle_create_schedule"
              >
                <template #icon>
                  <t-icon name="add"/>
                </template>
                新建任务
              </t-button>
            </div>
            <div class="schedule_table_container">
              <t-table
                  class="schedule-table"
                  row-key="id"
                  :data="schedule_data"
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
                <template #schedule_type="{ row }">
                  <t-tag :theme="row.schedule_type === 0 ? 'primary' : 'warning'" variant="light">
                    {{ row.schedule_type === 0 ? '每天' : '每周' }}
                  </t-tag>
                </template>
                <template #schedule_info="{ row }">
                  <span v-if="row.schedule_type === 0">
                    <t-icon name="time" style="margin-right: 4px;" />
                    每天 {{ row.schedule_time }}
                  </span>
                  <span v-else>
                    <t-icon name="calendar" style="margin-right: 4px;" />
                    每周{{ weekday_names[row.schedule_weekday - 1] }} {{ row.schedule_time }}
                  </span>
                </template>
                <template #is_enabled="{ row }">
                  <t-switch
                      :value="row.is_enabled"
                      :loading="toggle_loading.has(row.id)"
                      @change="(val: boolean) => handle_toggle_schedule(row, val)"
                  />
                </template>
                <template #last_execution_status="{ row }">
                  <t-tag v-if="row.last_execution_status === 0" theme="warning" variant="light">待执行</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 1" theme="primary" variant="light">执行中</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 2" theme="success" variant="light">成功</t-tag>
                  <t-tag v-else-if="row.last_execution_status === 3" theme="danger" variant="light">失败</t-tag>
                  <span v-else>-</span>
                </template>
                <template #next_execution_time="{ row }">
                  <span v-if="row.next_execution_time && row.is_enabled">
                    {{ row.next_execution_time }}
                  </span>
                  <t-tag v-else-if="!row.is_enabled" theme="default" variant="light">已禁用</t-tag>
                  <span v-else>-</span>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="trigger_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.id)"
                        @click="handle_trigger_schedule(row)"
                    >
                      立即执行
                    </t-link>
                    <t-link
                        class="edit_button"
                        theme="primary"
                        hover="color"
                        @click="handle_edit_schedule(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_button"
                        theme="danger"
                        hover="color"
                        :disabled="loading_row.has(row.id)"
                        @click="handle_delete_schedule(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
                <template #empty>
                  <div class="empty-container">
                    <t-icon name="time" size="48px" />
                    <p>暂无定时任务</p>
                    <t-button theme="primary" variant="outline" @click="handle_create_schedule">
                      创建第一个任务
                    </t-button>
                  </div>
                </template>
              </t-table>
            </div>

            <!-- 新建任务弹窗 -->
            <CreateScheduleDialog
                v-model:visible="show_create_dialog"
                @success="refresh_schedule_list"
            />

            <!-- 编辑任务弹窗 -->
            <UpdateScheduleDialog
                v-model:visible="show_update_dialog"
                :schedule_data="current_schedule"
                @success="refresh_schedule_list"
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
import CreateScheduleDialog from "./components/CreateScheduleDialog.vue";
import UpdateScheduleDialog from "./components/UpdateScheduleDialog.vue";

// 定时任务数据接口
interface schedule_item {
  id: number;
  project_id: number;
  task_name: string;
  test_case_id: number;
  case_name: string;
  env_id: number;
  env_name: string;
  schedule_type: number;
  schedule_time: string;
  schedule_weekday: number;
  is_enabled: boolean;
  last_execution_status: number;
  next_execution_time: string;
  description: string;
}

// 星期名称
const weekday_names = ['一', '二', '三', '四', '五', '六', '日']

// 定时任务列表初始化
const schedule_data = ref<schedule_item[]>([])
const table_loading = ref(false)

// 筛选条件
const filter_task_name = ref<string>("")
const filter_schedule_type = ref<number | undefined>()
const filter_is_enabled = ref<boolean | undefined>()

// hover 效果
const hover = ref<boolean>(true)
// 表格布局
const table_layout = ref<string>("auto")
// 布局大小
const size = ref<string>("medium")
// 显示表头
const show_header = ref<boolean>(true)

// 总页数
const total = ref(0)
const pagination = ref<TableProps['pagination']>({
  current: 1,
  pageSize: 10,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current
    pagination.value!.pageSize = pageInfo.pageSize
    handle_click_search_button()
  }
})

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set())
const toggle_loading = ref<Set<number>>(new Set())

// 弹窗状态
const show_create_dialog = ref(false)
const show_update_dialog = ref(false)
const current_schedule = ref<any>(null)

// 列表行
const columns = ref<TableProps['columns']>([
  { colKey: 'id', title: 'ID', width: 70 },
  { colKey: 'task_name', title: '任务名称', ellipsis: true },
  { colKey: 'case_name', title: '用例名称', ellipsis: true },
  { colKey: 'env_name', title: '环境', width: 90 },
  { colKey: 'schedule_type', title: '类型', width: 70 },
  { colKey: 'schedule_info', title: '执行计划', width: 160 },
  { colKey: 'is_enabled', title: '启用', width: 70 },
  { colKey: 'last_execution_status', title: '上次状态', width: 90 },
  { colKey: 'next_execution_time', title: '下次执行', width: 160 },
  { colKey: 'operation', title: '操作', width: 180 },
])

// 刷新列表
const refresh_schedule_list = async () => {
  table_loading.value = true
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 10,
  }
  request.get(API_URLS.api_test_schedule.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          schedule_data.value = res.data.data.results
          total.value = res.data.data.total_count
          if (pagination.value) {
            pagination.value.total = total.value
          }
        }
      })
      .finally(() => {
        table_loading.value = false
      })
}

// 搜索
const handle_click_search_button = () => {
  table_loading.value = true
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 10,
  }

  if (filter_task_name.value) {
    params.task_name = filter_task_name.value
  }
  if (filter_schedule_type.value !== undefined) {
    params.schedule_type = filter_schedule_type.value
  }
  if (filter_is_enabled.value !== undefined) {
    params.is_enabled = filter_is_enabled.value
  }

  request.get(API_URLS.api_test_schedule.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          schedule_data.value = res.data.data.results
          total.value = res.data.data.total_count
          if (pagination.value) {
            pagination.value.total = total.value
          }
        }
      })
      .finally(() => {
        table_loading.value = false
      })
}

// 重置筛选
const handle_click_reset_button = () => {
  filter_task_name.value = ""
  filter_schedule_type.value = undefined
  filter_is_enabled.value = undefined
  pagination.value!.current = 1
  handle_click_search_button()
}

// 新建任务
const handle_create_schedule = () => {
  show_create_dialog.value = true
}

// 编辑任务
const handle_edit_schedule = (row: schedule_item) => {
  current_schedule.value = row
  show_update_dialog.value = true
}

// 切换启用状态
const handle_toggle_schedule = (row: schedule_item, enabled: boolean) => {
  toggle_loading.value.add(row.id)
  request.post(API_URLS.api_test_schedule.toggle, {
    schedule_id: row.id,
    is_enabled: enabled
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(enabled ? '已启用' : '已禁用')
          refresh_schedule_list()
        }
        else {
          MessagePlugin.error(`操作失败: ${res.data.message}`)
        }
      })
      .catch((e) => {
        MessagePlugin.error(`操作失败: ${e.response?.data?.message || e.message}`)
      })
      .finally(() => {
        toggle_loading.value.delete(row.id)
      })
}

// 立即执行
const handle_trigger_schedule = (row: schedule_item) => {
  const schedule_id = row.id
  loading_row.value.add(schedule_id)

  request.post(API_URLS.api_test_schedule.trigger, { schedule_id: schedule_id })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`已触发执行，可在执行历史中查看进度`)
          refresh_schedule_list()
        }
        else {
          MessagePlugin.error(`触发失败: ${res.data.message}`)
        }
      })
      .catch((e) => {
        MessagePlugin.error(`触发失败: ${e.response?.data?.message || e.message}`)
      })
      .finally(() => {
        loading_row.value.delete(schedule_id)
      })
}

// 删除任务
const handle_delete_schedule = (row: schedule_item) => {
  const schedule_id = row.id
  loading_row.value.add(schedule_id)

  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除任务「${row.task_name}」吗？删除后无法恢复。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(schedule_id)
      request.post(API_URLS.api_test_schedule.delete, { schedule_id: schedule_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除成功`)
              refresh_schedule_list()
            }
            else {
              MessagePlugin.error(`删除失败: ${res.data.message}`)
            }
          })
          .catch((e) => {
            MessagePlugin.error(`删除失败: ${e.response?.data?.message || e.message}`)
          })
          .finally(() => {
            loading_row.value.delete(schedule_id)
            confirm_dialog.destroy()
          })
    },
    onClose: () => {
      loading_row.value.delete(schedule_id)
      confirm_dialog.destroy()
    },
    onCancel: () => {
      loading_row.value.delete(schedule_id)
      confirm_dialog.destroy()
    }
  })
}

onMounted(() => {
  refresh_schedule_list()
})
</script>

<style scoped>
.scheduled-task-container{
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

.header-menu-operations {
  display: flex;
  gap: 8px;
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
  gap: 16px;
  padding: 0 20px;
  flex-wrap: wrap;
}

.task-name-filter {
  width: 180px;
}

.type-filter,
.status-filter {
  width: 130px;
}

.spacer {
  flex: 1;
}

:deep(.t-input) {
  border-radius: 12px;
  height: 40px;
}

:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}

.search-button,
.reset-button,
.add_schedule_button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 表格容器样式 */
.schedule_table_container{
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

:deep(.t-link--theme-danger){
  padding-right: 5px;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  gap: 12px;
}

.empty-container p {
  font-size: 14px;
  margin: 0;
}
</style>
