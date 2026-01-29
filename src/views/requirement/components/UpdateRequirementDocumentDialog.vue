<template>
  <t-dialog
      width="auto"
      :visible="props.visible"
      header="编辑需求文档"
      :loading = "loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <!-- 所属项目-只读 -->
      <t-form-item
          label="项目"
          name="project_id"
      >
        <t-select
            class="project-selection"
            v-model="form_data.project_id"
            :options="project_options"
            placeholder="所属项目"
            :disabled="true"
        />
      </t-form-item>

      <!-- 需求文档名称-可编辑 -->
      <t-form-item
          label="名称"
          name="doc_name"
      >
        <t-input
            v-model="form_data.doc_name"
            placeholder="请输入需求文档名称"
            :maxlength="255"
        />
      </t-form-item>

      <!-- 需求文档版本-可编辑  -->
      <t-form-item
          label="版本"
          name="version"
      >
        <t-input
            v-model="form_data.version"
            placeholder="请输入版本"
            :maxlength="50"
        >
        </t-input>
      </t-form-item>

      <!-- 需求文档备注-可编辑 -->
      <t-form-item
          label="备注"
          name="comment"
      >
        <t-textarea
            v-model="form_data.comment"
            placeholder="请输入备注(可选)"
            :maxlength="200"
            :autosize="{ minRows: 2, maxRows: 4}"
        >
        </t-textarea>
      </t-form-item>

      <!-- 解析状态-只读 -->
      <t-form-item
          label="解析状态"
          name="parse_status"
      >
        <t-tag
            :theme="get_status_theme(form_data.parse_status)"
        >
          {{ get_status_text(form_data.parse_status) }}
        </t-tag>
      </t-form-item>

    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {API_URLS} from "@/api/urls.ts";
import {MessagePlugin} from "tdesign-vue-next";
import {request} from "@/api/urls.ts";

// 需求文档数据类型定义
interface requirement_document_data {
  project_id: number;
  doc_name: string;
  version: string;
  comment: string;
  parse_status: number;
  requirement_document_id: number;
}

// props 定义：接收 visible 和需求文档数据
const props = defineProps<{
  visible: boolean;
  requirement_document_data?: requirement_document_data | null;
}>()

// Emits 定义
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 表单信息
const form_data = ref({
  // 可编辑字段
  doc_name: "",
  version: "",
  comment: "",

  // 只读字段
  project_id: null as number | null,
  parse_status: null as number | null,
  requirement_document_id: null as number | null,
})

const status_map: Record<number, string> = {
  0: '未解析',
  1: '解析中',
  2: '已解析',
  3: '解析失败'
}

// 状态主题映射
const get_status_theme = (status: number | null): string => {
  switch (status) {
    case 0: return "default";
    case 1: return "warning";
    case 2: return "success";
    case 3: return "danger";
    default: return "default";
  }
}

const get_status_text = (status: number | null): string => {
  if (status === null || status === undefined) {
    return "未知"
  }
  return status_map[status] || "未知"
}

// 项目下拉选项
const project_options = ref<{label: string; value: number}[]>([])

// 关闭弹窗
const handle_close = () => {
  // 重置表单
  form_data.value = {
    doc_name: "",
    version: "",
    comment: "",

    project_id: null,
    parse_status: null,
    requirement_document_id: null
  }

  // 通知父组件关闭
  emit('update:visible', false)
}

// 确认更新
const handle_confirm = async () => {
  // 参数校验
  if (!form_data.value.requirement_document_id) {
    MessagePlugin.warning("文档ID不存在")
    return
  }
  if (!form_data.value.doc_name || !form_data.value.doc_name.trim()) {
    MessagePlugin.warning("请输入需求文档名称")
    return
  }
  if (!form_data.value.version || !form_data.value.version.trim()) {
    MessagePlugin.warning("请输入版本号")
    return
  }

  // 表单数据 FormData
  loading.value = true
  const update_data = {
    requirement_document_id: form_data.value.requirement_document_id,
    doc_name: form_data.value.doc_name.trim(),
    version: form_data.value.version.trim(),
    comment: form_data.value.comment?.trim() || ""
  }
  request.post(API_URLS.requirements_document.update, update_data)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新成功`);
          // 通知父组件
          emit("success")
          handle_close()
        }
        else {
          MessagePlugin.error(`更新失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading.value = false
      });
}

// 获取项目列表（弹窗打开时调用)
const fetch_project_lists = async () => {
  request.get(API_URLS.project.list)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          project_options.value = res.data.data.results.map((item: any) => ({
            label: item.project_name,
            value: item.id
          }))
        }
      })
}

// 监听弹窗打开, 初始化数据
watch(() => props.visible, async (val) => {
  if (val){
    // 先获取项目列表
    await fetch_project_lists()

    // 填充所有字段
    if (props.requirement_document_data){
      form_data.value = {
        project_id: props.requirement_document_data.project_id || null,
        doc_name: props.requirement_document_data.doc_name,
        version: props.requirement_document_data.version || "",
        comment: props.requirement_document_data.comment || "",
        parse_status: props.requirement_document_data.parse_status || null,
        requirement_document_id: props.requirement_document_data.requirement_document_id || null,
      }
    }
  }
})

</script>

<style scoped>
:deep(.t-upload__dragger-center){
  border-radius: 12px;
}

/* 文本输入框样式 */
:deep(.t-textarea__inner){
  border-radius: 12px;
}

/* 输入框样式 */
:deep(.t-input){
  border-radius: 12px;
  height: 40px;
}

/* 禁用状态的输入框样式（可选，TDesign 已有默认样式） */
:deep(.t-input.is-disabled .t-input__inner) {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

/* 下拉框样式 */
:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}

/* 禁用状态的下拉框样式 */
:deep(.t-select.is-disabled .t-input__inner) {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

</style>

