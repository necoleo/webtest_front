<template>
  <t-drawer
      size="850px"
      :visible="props.visible"
      header="测试用例详情"
      :footer="false"
      :on-close="handle_close"
      placement="right"
  >
    <div class="detail-container">
      <t-descriptions
          :column="2"
          bordered
          layout="horizontal"
      >
        <t-descriptions-item label="用例ID">
          {{ form_data.test_case_id }}
        </t-descriptions-item>
        <t-descriptions-item label="关联需求ID">
          {{ form_data.requirement_id }}
        </t-descriptions-item>
        <t-descriptions-item label="所属需求文档" :span="2">
          {{ form_data.requirement_document_name || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="用例标题" :span="2">
          {{ form_data.case_title || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="所属项目ID">
          {{ form_data.project_id }}
        </t-descriptions-item>
        <t-descriptions-item label="所属模块">
          {{ form_data.module || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="优先级">
          <t-tag :theme="get_priority_theme(form_data.priority)">
            {{ get_priority_text(form_data.priority) }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="来源">
          <t-tag :theme="get_case_source_theme(form_data.case_source)">
            {{ get_case_source_text(form_data.case_source) }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="执行状态">
          <t-tag :theme="get_execution_status_theme(form_data.execution_status)">
            {{ get_execution_status_text(form_data.execution_status) }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="创建人">
          {{ form_data.created_user || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="创建时间" :span="2">
          {{ form_data.created_at || '-' }}
        </t-descriptions-item>
      </t-descriptions>

      <div class="content-section">
        <div class="content-label">前置条件</div>
        <div class="content-text">
          {{ form_data.precondition || '-' }}
        </div>
      </div>

      <div class="content-section">
        <div class="content-label">测试步骤</div>
        <div class="content-text">
          {{ form_data.test_steps || '-' }}
        </div>
      </div>

      <div class="content-section">
        <div class="content-label">预期结果</div>
        <div class="content-text">
          {{ form_data.expected_result || '-' }}
        </div>
      </div>

      <div class="content-section" v-if="form_data.comment">
        <div class="content-label">备注</div>
        <div class="content-text">
          {{ form_data.comment }}
        </div>
      </div>
    </div>
  </t-drawer>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";

// 测试用例数据类型定义
interface test_case_data {
  test_case_id: number;
  project_id: number;
  requirement_id: number;
  requirement_document_id: number;
  requirement_document_name: string;
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

// props 定义
const props = defineProps<{
  visible: boolean;
  test_case_data?: test_case_data | null;
}>()

// Emits 定义
const emit = defineEmits(['update:visible'])

// 表单信息
const form_data = ref({
  test_case_id: null as number | null,
  project_id: null as number | null,
  requirement_id: null as number | null,
  requirement_document_id: null as number | null,
  requirement_document_name: "",
  case_title: "",
  precondition: "",
  test_steps: "",
  expected_result: "",
  module: "",
  priority: null as number | null,
  comment: "",
  case_source: null as number | null,
  execution_status: null as number | null,
  created_user: "",
  created_at: "",
})

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

const get_priority_theme = (priority: number | null): string => {
  switch (priority) {
    case 0: return "danger";
    case 1: return "warning";
    case 2: return "primary";
    case 3: return "default";
    default: return "default";
  }
}

const get_priority_text = (priority: number | null): string => {
  if (priority === null) return "未知"
  return priority_map[priority] || "未知"
}

const get_case_source_theme = (case_source: number | null): string => {
  switch (case_source) {
    case 0: return "default";
    case 1: return "primary";
    case 2: return "warning";
    default: return "default";
  }
}

const get_case_source_text = (case_source: number | null): string => {
  if (case_source === null) return "未知"
  return case_source_map[case_source] || "未知"
}

const get_execution_status_theme = (status: number | null): string => {
  switch (status) {
    case 0: return "default";
    case 1: return "warning";
    case 2: return "success";
    case 3: return "danger";
    default: return "default";
  }
}

const get_execution_status_text = (status: number | null): string => {
  if (status === null) return "未知"
  return execution_status_map[status] || "未知"
}

// 关闭弹窗
const handle_close = () => {
  form_data.value = {
    test_case_id: null,
    project_id: null,
    requirement_id: null,
    requirement_document_id: null,
    requirement_document_name: "",
    case_title: "",
    precondition: "",
    test_steps: "",
    expected_result: "",
    module: "",
    priority: null,
    comment: "",
    case_source: null,
    execution_status: null,
    created_user: "",
    created_at: "",
  }
  emit('update:visible', false)
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val){
    if (props.test_case_data){
      form_data.value = {
        test_case_id: props.test_case_data.test_case_id || null,
        project_id: props.test_case_data.project_id || null,
        requirement_id: props.test_case_data.requirement_id || null,
        requirement_document_id: props.test_case_data.requirement_document_id || null,
        requirement_document_name: props.test_case_data.requirement_document_name || "",
        case_title: props.test_case_data.case_title || "",
        precondition: props.test_case_data.precondition || "",
        test_steps: props.test_case_data.test_steps || "",
        expected_result: props.test_case_data.expected_result || "",
        module: props.test_case_data.module || "",
        priority: props.test_case_data.priority ?? null,
        comment: props.test_case_data.comment || "",
        case_source: props.test_case_data.case_source ?? null,
        execution_status: props.test_case_data.execution_status ?? null,
        created_user: props.test_case_data.created_user || "",
        created_at: props.test_case_data.created_at || "",
      }
    }
  }
})

</script>

<style scoped>
.detail-container {
  padding: 10px 0;
}

.content-section {
  margin-top: 20px;
}

.content-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.content-text {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

:deep(.t-descriptions__label) {
  width: 100px;
}
</style>
