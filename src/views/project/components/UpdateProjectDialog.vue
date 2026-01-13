<template>
  <t-dialog
      width="auto"
      :visible="props.visible"
      header="编辑项目"
      :loading = "loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <t-form-item
          label="项目名称"
          name="project_name"
      >
        <t-input
            v-model="form_data.project_name"
            placeholder="项目名称"
        />
      </t-form-item>

      <t-form-item
          label="项目描述"
          name="description"
      >
        <t-textarea
            v-model="form_data.description"
            placeholder="请输入项目描述"
            :maxlength="500"
            :autosize="{ minRows: 2, maxRows: 4}"
        >
        </t-textarea>
      </t-form-item>

      <t-form-item
          label="项目类型"
          name="project_type"
      >
        <t-input
            v-model="form_data.project_type"
            placeholder="请输入项目类型"
        >
        </t-input>
      </t-form-item>

      <t-form-item
          label="项目状态"
          name="project_status"
      >
        <t-select
            v-model="form_data.project_status"
            :options="project_status_options"
            placeholder="请选择状态项目状态"
            clearable
        />
      </t-form-item>

      <t-form-item
          label="计划开始日期"
          name="start_date"
      >
        <t-date-picker
            v-model="form_data.start_date"
            placeholder="请选择开始日期"
            format="YYYY-MM-DD"
            clearable
        ></t-date-picker>
      </t-form-item>

      <t-form-item
          label="计划结束日期"
          name="end_date"
      >
        <t-date-picker
            v-model="form_data.end_date"
            placeholder="请选择结束日期"
            format="YYYY-MM-DD"
            clearable
        ></t-date-picker>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {API_URLS} from "@/api/urls.ts";
import {MessagePlugin} from "tdesign-vue-next";
import {request} from "@/api/urls.ts";

interface project_data {
  project_id: number;
  project_name: string;
  description: string;
  project_type: string;
  project_status: number;
  start_date: string;
  end_date: string;
}

// props 定义：接收 visible 和项目数据
const props = defineProps<{
  visible: boolean;
  project_data?: project_data | null;
}>()

// Emits 定义
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)
// 表单信息
const form_data = ref({
  project_id: null as number | null,
  project_name: "",
  description: "",
  project_type: "",
  project_status: null as number | null,
  start_date: null as string | null,
  end_date: null as string | null,
})

// 项目状态下拉选项
const project_status_options = ref<{label: string; value: number}[]>([
  {
    label: "未开始",
    value: 0
  },
  {
    label: "进行中",
    value: 1
  },
  {
    label: "完成",
    value: 2
  },
  {
    label: "暂停",
    value: 3
  },
  {
    label: "终止",
    value: 4
  },
])

// 关闭弹窗
const handle_close = () => {
  // 重置表单
  form_data.value = {
    project_id: null,
    project_name: "",
    description: "",
    project_type: "",
    project_status: null,
    start_date: null,
    end_date: null,
  }
  // 通知父组件关闭
  emit('update:visible', false)
}

// 确认上传
const handle_confirm = async () => {
  // 校验必填项
  if (!form_data.value.project_name) {
    MessagePlugin.warning("请输入项目名称")
    return
  }

  // 表单数据 FormData
  loading.value = true
  // 直接发送 JSON
  request.post(API_URLS.project.update, {
    project_id: form_data.value.project_id,
    project_name: form_data.value.project_name,
    description: form_data.value.description,
    project_type: form_data.value.project_type,
    project_status: form_data.value.project_status,
    start_date: form_data.value.start_date,
    end_date: form_data.value.end_date,
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`更新项目成功`);
          // 通知父组件
          emit("success")
          handle_close()
        }
        else {
          MessagePlugin.error(`更新项目失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新项目失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading.value = false
      });
}

// 监听弹窗打开, 初始化数据
watch(() => props.visible, async (val) => {
  if (val){
    // 填充所有字段
    if (props.project_data){
      console.log(props.project_data)
      form_data.value = {
        project_id: props.project_data.project_id ?? null,
        project_name: props.project_data.project_name || "",
        description: props.project_data.description || "",
        project_type: props.project_data.project_type || "",
        project_status: props.project_data.project_status ?? null,
        start_date: props.project_data.start_date || null,
        end_date: props.project_data.end_date || null,
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

/* 下拉框样式 */
:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}
</style>

