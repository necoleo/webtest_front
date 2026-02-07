<template>
  <t-dialog
      width="600px"
      :visible="props.visible"
      header="需求项详情"
      :footer="false"
      :on-close="handle_close"
  >
    <div class="content-section">
    <div class="content-label">需求内容</div>
    <div class="content-text">
      {{ form_data.requirement_content || '-' }}
    </div>
  </div>
    <div class="detail-container">
      <t-descriptions
          :column="1"
          bordered
          layout="horizontal"
      >
        <t-descriptions-item label="需求项ID">
          {{ form_data.requirement_id }}
        </t-descriptions-item>
        <t-descriptions-item label="需求标题">
          {{ form_data.requirement_title || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="所属项目ID">
          {{ form_data.project_id }}
        </t-descriptions-item>
        <t-descriptions-item label="所属文档ID">
          {{ form_data.requirement_document_name }}
        </t-descriptions-item>
        <t-descriptions-item label="所属模块">
          {{ form_data.module || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="状态">
          <t-tag :theme="get_status_theme(form_data.status)">
            {{ get_status_text(form_data.status) }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="已向量化">
          <t-tag :theme="form_data.is_vectorized ? 'success' : 'default'">
            {{ form_data.is_vectorized ? '是' : '否' }}
          </t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="创建时间">
          {{ form_data.created_at || '-' }}
        </t-descriptions-item>
        <t-descriptions-item label="更新时间">
          {{ form_data.updated_at || '-' }}
        </t-descriptions-item>
      </t-descriptions>
    </div>
  </t-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";

// 需求项数据类型定义
interface requirement_data {
  requirement_id: number;
  project_id: number;
  requirement_document_id: number;
  requirement_document_name: string;
  requirement_title: string;
  requirement_content: string;
  module: string;
  status: number;
  is_vectorized: boolean;
  created_at: string;
  updated_at: string;
}

// props 定义：接收 visible 和需求项数据
const props = defineProps<{
  visible: boolean;
  requirement_data?: requirement_data | null;
}>()

// Emits 定义
const emit = defineEmits(['update:visible'])

// 表单信息
const form_data = ref({
  requirement_id: null as number | null,
  project_id: null as number | null,
  requirement_document_id: null as number | null,
  requirement_document_name: "",
  requirement_title: "",
  requirement_content: "",
  module: "",
  status: null as number | null,
  is_vectorized: false,
  created_at: "",
  updated_at: "",
})

// 需求项状态map
const status_map: Record<number, string> = {
  0: '待审核',
  1: '处理中',
  2: '已审核',
  3: '测试用例生成中',
  4: '测试用例已覆盖',
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

// 关闭弹窗
const handle_close = () => {
  // 重置表单
  form_data.value = {
    requirement_id: null,
    project_id: null,
    requirement_document_id: null,
    requirement_document_name: "",
    requirement_title: "",
    requirement_content: "",
    module: "",
    status: null,
    is_vectorized: false,
    created_at: "",
    updated_at: "",
  }

  // 通知父组件关闭
  emit('update:visible', false)
}

// 监听弹窗打开, 初始化数据
watch(() => props.visible, (val) => {
  if (val){
    if (props.requirement_data){
      form_data.value = {
        requirement_id: props.requirement_data.requirement_id || null,
        project_id: props.requirement_data.project_id || null,
        requirement_document_id: props.requirement_data.requirement_document_id || null,
        requirement_document_name: props.requirement_data.requirement_document_name || "",
        requirement_title: props.requirement_data.requirement_title || "",
        requirement_content: props.requirement_data.requirement_content || "",
        module: props.requirement_data.module || "",
        status: props.requirement_data.status ?? null,
        is_vectorized: props.requirement_data.is_vectorized || false,
        created_at: props.requirement_data.created_at || "",
        updated_at: props.requirement_data.updated_at || "",
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
  max-height: 300px;
  overflow-y: auto;
}

:deep(.t-descriptions__label) {
  width: 120px;
}
</style>
