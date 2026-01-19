<template>
  <div class="container">
    <t-layout class="api-test-case-detail-container">
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
              <h2>用例详情</h2>
              <div class="header-menu-operations">
                <t-button
                    variant="text"
                    shape="square"
                    @click="handle_go_back"
                >
                  <template #icon>
                    <t-icon name="chevron-left"/>
                  </template>
                  返回
                </t-button>
              </div>
            </div>
          </t-head-menu>
        </t-header>
        <t-content>
          <div class="current_page_path">
            <span> 接口测试 / 接口用例 / 详情</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <t-loading :loading="loading">
              <template v-if="load_error">
                <div class="error-container">
                  <t-result
                      theme="error"
                      title="加载失败"
                      description="请稍后重试"
                  >
                    <template #extra>
                      <t-button theme="primary" @click="load_detail">重新加载</t-button>
                    </template>
                  </t-result>
                </div>
              </template>

              <template v-else-if="!detail.id && !loading">
                <div class="empty-container">
                  <t-result
                      theme="default"
                      title="用例不存在"
                      description="该用例可能已被删除"
                  />
                </div>
              </template>

              <template v-else>
                <!-- 基本信息卡片 -->
                <t-card title="基本信息" :bordered="false" class="info-card">
                  <template #actions>
                    <t-button
                        v-if="detail.cos_access_url"
                        theme="primary"
                        variant="text"
                        @click="handle_download_yaml"
                    >
                      <template #icon>
                        <t-icon name="download"/>
                      </template>
                      下载 YAML
                    </t-button>
                  </template>
                  <t-descriptions :column="2">
                    <t-descriptions-item label="ID">{{ detail.id }}</t-descriptions-item>
                    <t-descriptions-item label="用例名称">{{ detail.case_name }}</t-descriptions-item>
                    <t-descriptions-item label="所属项目">{{ detail.project_id }}</t-descriptions-item>
                    <t-descriptions-item label="来源">{{ detail.source === 0 ? '手动上传' : 'AI生成' }}</t-descriptions-item>
                    <t-descriptions-item label="执行次数">{{ detail.total_executions }}</t-descriptions-item>
                    <t-descriptions-item label="成功次数">{{ detail.success_count }}</t-descriptions-item>
                    <t-descriptions-item label="创建人">{{ detail.created_user }}</t-descriptions-item>
                    <t-descriptions-item label="创建时间">{{ detail.created_at }}</t-descriptions-item>
                    <t-descriptions-item label="更新时间">{{ detail.updated_at }}</t-descriptions-item>
                    <t-descriptions-item label="最后执行状态">
                      <t-tag v-if="detail.last_execution_status === 0" theme="warning" variant="light">待执行</t-tag>
                      <t-tag v-else-if="detail.last_execution_status === 1" theme="primary" variant="light">执行中</t-tag>
                      <t-tag v-else-if="detail.last_execution_status === 2" theme="success" variant="light">成功</t-tag>
                      <t-tag v-else-if="detail.last_execution_status === 3" theme="danger" variant="light">失败</t-tag>
                      <span v-else>-</span>
                    </t-descriptions-item>
                    <t-descriptions-item label="描述" :span="2">{{ detail.description || '-' }}</t-descriptions-item>
                  </t-descriptions>
                </t-card>

                <!-- YAML 内容卡片 -->
                <t-card title="YAML 内容" :bordered="false" class="yaml-card">
                  <template #actions>
                    <t-button
                        theme="default"
                        variant="text"
                        :loading="yaml_loading"
                        @click="load_yaml_content"
                    >
                      <template #icon>
                        <t-icon name="refresh"/>
                      </template>
                      刷新
                    </t-button>
                    <t-button
                        theme="default"
                        variant="text"
                        @click="handle_copy_yaml"
                    >
                      <template #icon>
                        <t-icon name="file-copy"/>
                      </template>
                      复制
                    </t-button>
                  </template>
                  <div class="yaml-content-container">
                    <t-loading :loading="yaml_loading">
                      <template v-if="yaml_error">
                        <div class="yaml-error">
                          <t-icon name="error-circle" size="24px" />
                          <span>加载 YAML 内容失败</span>
                          <t-button theme="primary" size="small" @click="load_yaml_content">重试</t-button>
                        </div>
                      </template>
                      <template v-else-if="yaml_content">
                        <pre class="yaml-code"><code>{{ yaml_content }}</code></pre>
                      </template>
                      <template v-else>
                        <div class="yaml-empty">
                          <t-icon name="file" size="24px" />
                          <span>暂无 YAML 内容</span>
                        </div>
                      </template>
                    </t-loading>
                  </div>
                </t-card>

                <!-- 执行历史卡片 -->
                <t-card title="执行历史" :bordered="false" class="history-card">
                  <t-table
                      :data="execution_history"
                      :columns="history_columns"
                      :loading="history_loading"
                      row-key="id"
                      :stripe="false"
                      :bordered="false"
                      :hover="true"
                  >
                    <template #status="{ row }">
                      <t-tag v-if="row.status === 0" theme="warning" variant="light">待执行</t-tag>
                      <t-tag v-else-if="row.status === 1" theme="primary" variant="light">执行中</t-tag>
                      <t-tag v-else-if="row.status === 2" theme="success" variant="light">成功</t-tag>
                      <t-tag v-else-if="row.status === 3" theme="danger" variant="light">失败</t-tag>
                    </template>
                    <template #pass_rate="{ row }">
                      <span>{{ row.pass_rate != null ? row.pass_rate.toFixed(1) + '%' : '-' }}</span>
                    </template>
                    <template #report_url="{ row }">
                      <t-link v-if="row.report_url" theme="primary" :href="row.report_url" target="_blank">
                        查看报告
                      </t-link>
                      <span v-else>-</span>
                    </template>
                    <template #operation="{ row }">
                      <t-link theme="primary" @click="handle_view_execution_detail(row)">
                        详情
                      </t-link>
                    </template>
                  </t-table>
                </t-card>
              </template>
            </t-loading>
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
import {MessagePlugin, type TableProps} from "tdesign-vue-next";
import {API_URLS} from "@/api/urls.ts";
import {ref, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const load_error = ref(false)
const history_loading = ref(false)
const yaml_loading = ref(false)
const yaml_error = ref(false)
const detail = ref<any>({})
const execution_history = ref<any[]>([])
const yaml_content = ref<string>("")

const history_columns = ref<TableProps['columns']>([
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'trigger_type_label', title: '触发方式', width: 100 },
  { colKey: 'total_cases', title: '总数', width: 80 },
  { colKey: 'passed_cases', title: '通过', width: 80 },
  { colKey: 'failed_cases', title: '失败', width: 80 },
  { colKey: 'pass_rate', title: '通过率', width: 100 },
  { colKey: 'duration', title: '耗时(秒)', width: 100 },
  { colKey: 'started_at', title: '开始时间', width: 180 },
  { colKey: 'report_url', title: '报告', width: 100 },
  { colKey: 'operation', title: '操作', width: 80 },
]);

const load_detail = async () => {
  loading.value = true
  load_error.value = false
  request.get(API_URLS.api_test_case.detail, {
    params: { test_case_id: route.params.id }
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          detail.value = res.data.data
          // 加载详情成功后，加载 YAML 内容
          load_yaml_content()
        }
        else {
          load_error.value = true
          MessagePlugin.error(`加载详情失败: ${res.data.message}`)
        }
      })
      .catch((e) => {
        load_error.value = true
        MessagePlugin.error(`加载详情失败: ${e.response?.data?.message || e.message}`)
      })
      .finally(() => {
        loading.value = false
      })
}

const load_yaml_content = () => {
  if (!detail.value.id) {
    return
  }

  yaml_loading.value = true
  yaml_error.value = false

  // 通过后端 API 获取 YAML 内容（避免 CORS 问题）
  request.get(API_URLS.api_test_case.yaml, {
    params: { test_case_id: detail.value.id }
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          yaml_content.value = res.data.data.yaml_content
        } else {
          yaml_error.value = true
          console.error("加载 YAML 内容失败:", res.data.message)
        }
      })
      .catch((e) => {
        yaml_error.value = true
        console.error("加载 YAML 内容失败:", e.response?.data?.message || e.message)
      })
      .finally(() => {
        yaml_loading.value = false
      })
}

const load_history = async () => {
  history_loading.value = true
  request.get(API_URLS.api_test_execution.history, {
    params: {
      test_case_id: route.params.id,
      page: 1,
      page_size: 20
    }
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          execution_history.value = res.data.data.results
        }
      })
      .catch((e) => {
        MessagePlugin.error(`加载执行历史失败: ${e.response?.data?.message || e.message}`)
      })
      .finally(() => {
        history_loading.value = false
      })
}

const handle_go_back = () => {
  router.back()
}

const handle_download_yaml = () => {
  if (detail.value.cos_access_url) {
    window.open(detail.value.cos_access_url, '_blank')
  }
}

const handle_copy_yaml = async () => {
  if (yaml_content.value) {
    try {
      await navigator.clipboard.writeText(yaml_content.value)
      MessagePlugin.success("已复制到剪贴板")
    } catch (e) {
      MessagePlugin.error("复制失败")
    }
  }
}

const handle_view_execution_detail = (row: any) => {
  router.push({ name: 'ApiTestExecutionDetail', params: { id: row.id } })
}

onMounted(() => {
  load_detail()
  load_history()
})
</script>

<style scoped>
.api-test-case-detail-container{
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
  overflow: auto;
  margin-top: 10px;
  min-height: 0;
  padding: 20px;
  gap: 20px;
}

.info-card,
.yaml-card,
.history-card {
  background-color: #fff;
  border-radius: 12px;
}

.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* YAML 内容样式 */
.yaml-content-container {
  min-height: 200px;
  max-height: 500px;
  overflow: auto;
}

.yaml-code {
  margin: 0;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
  color: #333;
  text-align: left;
}

.yaml-code code {
  font-family: inherit;
}

.yaml-error,
.yaml-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 150px;
  color: #909399;
}

.yaml-error {
  color: #f56c6c;
}

/* 操作栏按钮 */
:deep(.t-link--theme-primary){
  padding-right: 5px;
}
</style>
