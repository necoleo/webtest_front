<template>
  <div class="container">
    <t-layout class="execution-history-container">
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
              <h2>执行历史</h2>
              <div class="header-menu-operations">
                <t-button
                    variant="text"
                    shape="square"
                    @click="refresh_execution_list"
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
            <span> 接口测试 / 执行历史</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
              <t-input
                  class="case-name-filter"
                  v-model="filter_case_name"
                  placeholder="用例名称"
                  clearable
              />

              <t-select
                  class="status-filter"
                  v-model="filter_status"
                  placeholder="执行状态"
                  clearable
              >
                <t-option :value="0" label="待执行" />
                <t-option :value="1" label="执行中" />
                <t-option :value="2" label="成功" />
                <t-option :value="3" label="失败" />
              </t-select>

              <t-select
                  class="trigger-filter"
                  v-model="filter_trigger_type"
                  placeholder="触发方式"
                  clearable
              >
                <t-option :value="0" label="手动触发" />
                <t-option :value="1" label="定时触发" />
              </t-select>

              <t-date-range-picker
                  class="date-filter"
                  v-model="filter_date_range"
                  placeholder="选择时间范围"
                  clearable
                  enable-time-picker
                  :time-picker-props="{ format: 'HH:mm:ss' }"
              />

              <t-button
                  class="search-button"
                  theme="primary"
                  variant="outline"
                  @click="handle_click_search_button"
              >
                查询
              </t-button>
              <t-button
                  class="reset-search-button"
                  theme="default"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
            </div>
            <div class="execution_table_container">
              <t-table
                  class="execution-table"
                  row-key="id"
                  :data="execution_data"
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
                <template #status="{ row }">
                  <t-tag v-if="row.status === 0" theme="warning" variant="light">待执行</t-tag>
                  <t-tag v-else-if="row.status === 1" theme="primary" variant="light">执行中</t-tag>
                  <t-tag v-else-if="row.status === 2" theme="success" variant="light">成功</t-tag>
                  <t-tag v-else-if="row.status === 3" theme="danger" variant="light">失败</t-tag>
                </template>
                <template #pass_rate="{ row }">
                  <t-progress
                      v-if="row.pass_rate != null && (row.status === 2 || row.status === 3)"
                      :percentage="row.pass_rate"
                      :color="row.pass_rate >= 80 ? '#00a870' : row.pass_rate >= 50 ? '#ed7b2f' : '#e34d59'"
                      size="small"
                      :label="row.pass_rate.toFixed(1) + '%'"
                  />
                  <span v-else>-</span>
                </template>
                <template #duration="{ row }">
                  <span v-if="row.duration != null">{{ format_duration(row.duration) }}</span>
                  <span v-else>-</span>
                </template>
                <template #report_url="{ row }">
                  <t-link v-if="row.report_url" theme="primary" :href="row.report_url" target="_blank">
                    <t-icon name="browse" /> 查看
                  </t-link>
                  <span v-else>-</span>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="detail_button"
                        theme="primary"
                        hover="color"
                        @click="handle_view_detail(row)"
                    >
                      详情
                    </t-link>
                  </div>
                </template>
                <template #empty>
                  <div class="empty-container">
                    <t-icon name="file" size="48px" />
                    <p>暂无执行记录</p>
                  </div>
                </template>
              </t-table>
            </div>
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
import {type TableProps} from "tdesign-vue-next";
import {API_URLS} from "@/api/urls.ts";
import {ref, onMounted} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()

// 执行记录数据接口
interface execution_item {
  id: number;
  test_case_id: number;
  case_name: string;
  env_id: number;
  env_name: string;
  status: number;
  trigger_type: number;
  trigger_type_label: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  pass_rate: number;
  report_url: string;
  started_at: string;
  finished_at: string;
  duration: number;
}

// 执行记录列表初始化
const execution_data = ref<execution_item[]>([])
const table_loading = ref(false)

// 筛选条件
const filter_case_name = ref<string>("")
const filter_status = ref<number | undefined>()
const filter_trigger_type = ref<number | undefined>()
const filter_date_range = ref<string[]>([])

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
  pageSize: 20,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current
    pagination.value!.pageSize = pageInfo.pageSize
    handle_click_search_button()
  }
})

// 列表行
const columns = ref<TableProps['columns']>([
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'case_name', title: '用例名称', ellipsis: true },
  { colKey: 'env_name', title: '环境', width: 100 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'trigger_type_label', title: '触发方式', width: 100 },
  { colKey: 'total_cases', title: '总数', width: 70 },
  { colKey: 'passed_cases', title: '通过', width: 70 },
  { colKey: 'failed_cases', title: '失败', width: 70 },
  { colKey: 'pass_rate', title: '通过率', width: 120 },
  { colKey: 'duration', title: '耗时', width: 90 },
  { colKey: 'started_at', title: '开始时间', width: 170 },
  { colKey: 'report_url', title: '报告', width: 70 },
  { colKey: 'operation', title: '操作', width: 70 },
])

// 格式化耗时
const format_duration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}m ${secs}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

// 处理重置按钮
const handle_click_reset_button = () => {
  filter_case_name.value = ""
  filter_status.value = undefined
  filter_trigger_type.value = undefined
  filter_date_range.value = []
  pagination.value!.current = 1
  handle_click_search_button()
}

// 刷新列表
const refresh_execution_list = async () => {
  table_loading.value = true
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }

  request.get(API_URLS.api_test_execution.history, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          execution_data.value = res.data.data.results
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
    page_size: pagination.value?.pageSize || 20,
  }

  if (filter_case_name.value) {
    params.case_name = filter_case_name.value
  }
  if (filter_status.value !== undefined) {
    params.status = filter_status.value
  }
  if (filter_trigger_type.value !== undefined) {
    params.trigger_type = filter_trigger_type.value
  }
  if (filter_date_range.value && filter_date_range.value.length === 2) {
    params.start_date = filter_date_range.value[0]
    params.end_date = filter_date_range.value[1]
  }

  request.get(API_URLS.api_test_execution.history, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          execution_data.value = res.data.data.results
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

// 查看详情
const handle_view_detail = (row: execution_item) => {
  router.push({ name: 'ApiTestExecutionDetail', params: { id: row.id } })
}

onMounted(() => {
  refresh_execution_list()
})
</script>

<style scoped>
.execution-history-container{
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

.case-name-filter {
  width: 180px;
}

.status-filter,
.trigger-filter {
  width: 130px;
}

.date-filter {
  width: 340px;
}

:deep(.t-input) {
  border-radius: 12px;
  height: 40px;
}

:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}

:deep(.t-range-input) {
  border-radius: 12px;
  height: 40px;
}

.search-button,
.reset-search-button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 表格容器样式 */
.execution_table_container{
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

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.empty-container p {
  margin-top: 12px;
  font-size: 14px;
}

/* 进度条样式 */
:deep(.t-progress__info) {
  font-size: 12px;
}
</style>
