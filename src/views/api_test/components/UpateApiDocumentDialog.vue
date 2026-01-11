<template>
  <t-dialog
      width="auto"
      :visible="props.visible"
      header="编辑接口文档"
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

      <!-- 接口文档名称-可编辑 -->
      <t-form-item
          label="名称"
          name="api_document_title"
      >
        <t-input
            v-model="form_data.api_document_title"
            placeholder="请输入接口文档名称"
            :maxlength="255"
        />
      </t-form-item>

      <!-- 接口文档版本-可编辑  -->
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

      <!-- 接口文档备注-可编辑 -->
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

      <!-- 是否解析-只读 -->
      <t-form-item
          label="解析状态"
          name="is_prased"
      >
        <t-tag
            :theme="form_data.is_parsed ? 'success' : 'default'"
        >
          {{ form_data.is_parsed ? '已解析' : '未解析' }}
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

// 接口文档数据类型定义
interface api_document_data {
  project_id: number;
  api_document_title: string;
  version: string;
  comment: string;
  is_parsed: boolean;
  api_document_id: number;
}

// props 定义：接收 visible 和接口文档数据
const props = defineProps<{
  visible: boolean;
  api_document_data?: api_document_data | null;
}>()

// Emits 定义
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 表单信息
const form_data = ref({
  // 可编辑字段
  api_document_title: "",
  version: "",
  comment: "",

  // 只读字段
  project_id: null as number | null,
  is_parsed: null as boolean | null,
  api_document_id: null as number | null,
})

// 项目下拉选项
const project_options = ref<{label: string; value: number}[]>([])

// 关闭弹窗
const handle_close = () => {
  // 重置表单
  form_data.value = {
    api_document_title: "",
    version: "",
    comment: "",

    project_id: null,
    is_parsed: null,
    api_document_id: null
  }

  // 通知父组件关闭
  emit('update:visible', false)
}

// 确认更新
const handle_confirm = async () => {
  // 参数校验
  if (!form_data.value.api_document_id) {
    MessagePlugin.warning("文档ID不存在")
    return
  }
  if (!form_data.value.api_document_title || !form_data.value.api_document_title.trim()) {
    MessagePlugin.warning("请输入接口文档名称")
    return
  }
  if (!form_data.value.version || !form_data.value.version.trim()) {
    MessagePlugin.warning("请输入版本号")
    return
  }

  // 表单数据 FormData
  loading.value = true
  const update_data = {
    api_document_id: form_data.value.api_document_id,
    doc_name: form_data.value.api_document_title.trim(),
    version: form_data.value.version.trim(),
    comment: form_data.value.comment?.trim() || ""
  }
  request.post(API_URLS.api_document.update, update_data)
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
  request.get(API_URLS.projects.get_projects_list)
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
    if (props.api_document_data){
      form_data.value = {
        project_id: props.api_document_data.project_id || null,
        api_document_title: props.api_document_data.api_document_title,
        version: props.api_document_data.version || "",
        comment: props.api_document_data.comment || "",
        is_parsed: props.api_document_data.is_parsed || null,
        api_document_id: props.api_document_data.api_document_id || null,
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

