<template>
  <div class="container">
    <t-layout class="execution-detail-container">
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
              <h2>执行详情</h2>
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
            <span> 接口测试 / 执行历史 / 详情</span>
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
                      title="执行记录不存在"
                      description="该记录可能已被删除"
                  />
                </div>
              </template>

              <template v-else>
                <t-card title="执行信息" :bordered="false" class="info-card">
                  <t-descriptions :column="2">
                    <t-descriptions-item label="ID">{{ detail.id }}</t-descriptions-item>
                    <t-descriptions-item label="用例名称">{{ detail.case_name }}</t-descriptions-item>
                    <t-descriptions-item label="环境">{{ detail.env_name }}</t-descriptions-item>
                    <t-descriptions-item label="Base URL">{{ detail.env_base_url }}</t-descriptions-item>
                    <t-descriptions-item label="状态">
                      <t-tag v-if="detail.status === 0" theme="warning" variant="light">待执行</t-tag>
                      <t-tag v-else-if="detail.status === 1" theme="primary" variant="light">执行中</t-tag>
                      <t-tag v-else-if="detail.status === 2" theme="success" variant="light">成功</t-tag>
                      <t-tag v-else-if="detail.status === 3" theme="danger" variant="light">失败</t-tag>
                    </t-descriptions-item>
                    <t-descriptions-item label="触发方式">{{ detail.trigger_type_label }}</t-descriptions-item>
                    <t-descriptions-item label="总用例数">{{ detail.total_cases }}</t-descriptions-item>
                    <t-descriptions-item label="通过数">{{ detail.passed_cases }}</t-descriptions-item>
                    <t-descriptions-item label="失败数">{{ detail.failed_cases }}</t-descriptions-item>
                    <t-descriptions-item label="通过率">{{ detail.pass_rate != null ? detail.pass_rate.toFixed(1) + '%' : '-' }}</t-descriptions-item>
                    <t-descriptions-item label="耗时">{{ detail.duration != null ? detail.duration + '秒' : '-' }}</t-descriptions-item>
                    <t-descriptions-item label="执行人">{{ detail.executed_user }}</t-descriptions-item>
                    <t-descriptions-item label="开始时间">{{ detail.started_at }}</t-descriptions-item>
                    <t-descriptions-item label="结束时间">{{ detail.finished_at }}</t-descriptions-item>
                    <t-descriptions-item label="错误信息" :span="2">{{ detail.error_message || '-' }}</t-descriptions-item>
                  </t-descriptions>
                </t-card>

                <div class="action-bar" v-if="detail.report_url">
                  <t-button theme="primary" :href="detail.report_url" tag="a" target="_blank">
                    <template #icon>
                      <t-icon name="browse" />
                    </template>
                    查看报告
                  </t-button>
                </div>
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
import {MessagePlugin} from "tdesign-vue-next";
import {API_URLS} from "@/api/urls.ts";
import {ref, onMounted, onUnmounted} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const load_error = ref(false)
const detail = ref<any>({})
let poll_timer: number | null = null

const load_detail = async () => {
  loading.value = true
  load_error.value = false
  request.get(API_URLS.api_test_execution.detail, {
    params: { execution_id: route.params.id }
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          detail.value = res.data.data

          // 如果还在执行中，继续轮询
          if (detail.value.status === 0 || detail.value.status === 1) {
            start_polling()
          } else {
            stop_polling()
          }
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

const start_polling = () => {
  if (poll_timer) return
  poll_timer = window.setInterval(() => {
    load_detail()
  }, 3000) // 每 3 秒轮询一次
}

const stop_polling = () => {
  if (poll_timer) {
    clearInterval(poll_timer)
    poll_timer = null
  }
}

const handle_go_back = () => {
  router.back()
}

onMounted(() => {
  load_detail()
})

onUnmounted(() => {
  stop_polling()
})
</script>

<style scoped>
.execution-detail-container{
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

.info-card {
  background-color: #fff;
  border-radius: 12px;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
