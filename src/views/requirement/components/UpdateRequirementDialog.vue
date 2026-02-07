<template>
  <t-dialog
      width="600px"
      :visible="props.visible"
      header="编辑需求项"
      :loading = "loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <!-- 需求项ID-只读 -->
      <t-form-item
          label="需求项ID"
          name="requirement_id"
      >
        <t-input
            v-model="form_data.requirement_id"
            :disabled="true"
        />
      </t-form-item>

      <!-- 所属文档ID-只读 -->
      <t-form-item
          label="所属文档ID"
          name="requirement_document_name"
      >
        <t-input
            v-model="form_data.requirement_document_name"
            :disabled="true"
        />
      </t-form-item>

      <!-- 需求标题-可编辑 -->
      <t-form-item
          label="需求标题"
          name="requirement_title"
      >
        <t-input
            v-model="form_data.requirement_title"
            placeholder="请输入需求标题"
            :maxlength="255"
        />
      </t-form-item>

      <!-- 所属模块-可编辑  -->
      <t-form-item
          label="所属模块"
          name="module"
      >
        <t-select
            v-model="form_data.module"
            :options="module_options"
            placeholder="选择或输入模块"
            filterable
            creatable
            clearable
            @create="handle_create_module"
        />
      </t-form-item>

      <!-- 需求内容-可编辑 -->
      <t-form-item
          label="需求内容"
          name="requirement_content"
      >
        <t-textarea
            v-model="form_data.requirement_content"
            placeholder="请输入需求内容"
            :maxlength="5000"
            :autosize="{ minRows: 4, maxRows: 10}"
        >
        </t-textarea>
      </t-form-item>

      <!-- 状态-只读 -->
      <t-form-item
          label="状态"
          name="status"
      >
        <t-tag
            :theme="get_status_theme(form_data.status)"
        >
          {{ get_status_text(form_data.status) }}
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
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 表单信息
const form_data = ref({
  // 可编辑字段
  requirement_title: "",
  requirement_content: "",
  module: "",

  // 只读字段
  requirement_id: null as number | null,
  requirement_document_name: "",
  status: null as number | null,
})

// 所属模块下拉选项
const module_options = ref<{label: string; value: string}[]>([])
const handle_create_module = (value: string) => {
  // 将新模块添加到选项列表并自动选中
  module_options.value.push({
    label: value,
    value: value
  })
  form_data.value.module = value
}

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
    requirement_title: "",
    requirement_content: "",
    module: "",

    requirement_id: null,
    requirement_document_name: "",
    status: null,
  }

  // 通知父组件关闭
  emit('update:visible', false)
}
// 获取模块列表
const fetch_modules_list = async () => {
  request.get(API_URLS.requirement.modules)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000"){
          module_options.value = res.data.data.module.map((item: any) => ({
            label: `${item.module} (${item.count})`,
            value: item.module
          }))
        }
      })
}
// 确认更新
const handle_confirm = async () => {
  // 参数校验
  if (!form_data.value.requirement_id) {
    MessagePlugin.warning("需求项ID不存在")
    return
  }

  // 至少有一个可编辑字段有值
  if (!form_data.value.requirement_title?.trim() && 
      !form_data.value.requirement_content?.trim() && 
      !form_data.value.module?.trim()) {
    MessagePlugin.warning("请至少填写一个字段")
    return
  }

  loading.value = true
  const update_data: any = {
    requirement_id: form_data.value.requirement_id,
  }

  if (form_data.value.requirement_title?.trim()) {
    update_data.requirement_title = form_data.value.requirement_title.trim()
  }
  if (form_data.value.requirement_content?.trim()) {
    update_data.requirement_content = form_data.value.requirement_content.trim()
  }
  if (form_data.value.module?.trim()) {
    update_data.module = form_data.value.module.trim()
  }

  request.post(API_URLS.requirement.update, update_data)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新成功`);
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

// 监听弹窗打开, 初始化数据
watch(() => props.visible, (val) => {
  if (val){
    fetch_modules_list()
    if (props.requirement_data){
      form_data.value = {
        requirement_id: props.requirement_data.requirement_id || null,
        requirement_document_name: props.requirement_data.requirement_document_name || "",
        requirement_title: props.requirement_data.requirement_title || "",
        requirement_content: props.requirement_data.requirement_content || "",
        module: props.requirement_data.module || "",
        status: props.requirement_data.status ?? null,
      }
    }
  }
})

</script>

<style scoped>
/* 文本输入框样式 */
:deep(.t-textarea__inner){
  border-radius: 12px;
}

/* 输入框样式 */
:deep(.t-input){
  border-radius: 12px;
  height: 40px;
}

/* 禁用状态的输入框样式 */
:deep(.t-input.is-disabled .t-input__inner) {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
</style>
