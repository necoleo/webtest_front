<template>
  <t-dialog
      width="400px"
      :visible="props.visible"
      header="执行测试用例"
      :loading="loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <t-form-item
          label="用例名称"
          name="case_name"
      >
        <t-input
            :value="props.test_case?.case_name"
            disabled
        />
      </t-form-item>

      <t-form-item
          label="执行环境"
          name="env_id"
      >
        <t-select
            v-model="form_data.env_id"
            :options="env_options"
            placeholder="请选择执行环境"
            clearable
        />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import {ref, watch, onMounted} from "vue";
import {API_URLS} from "@/api/urls.ts";
import {MessagePlugin} from "tdesign-vue-next";
import {request} from "@/api/urls.ts";

const props = defineProps<{
  visible: boolean
  test_case: any
}>()
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 表单信息
const form_data = ref({
  env_id: null as number | null,
})

// 环境下拉选项
const env_options = ref<{label: string; value: number}[]>([])

// 关闭弹窗
const handle_close = () => {
  // 重置表单
  form_data.value = {
    env_id: null,
  }
  // 通知父组件关闭
  emit('update:visible', false)
}

// 确认执行
const handle_confirm = async () => {
  // 校验必填项
  if (!form_data.value.env_id) {
    MessagePlugin.warning("请选择执行环境")
    return
  }

  loading.value = true
  request.post(API_URLS.api_test_execution.execute, {
    test_case_id: props.test_case.id,
    env_id: form_data.value.env_id
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`执行任务已提交`);
          emit("success")
          handle_close()
        }
        else {
          MessagePlugin.error(`提交失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`提交失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading.value = false
      });
}

// 获取环境列表
const fetch_env_list = async () => {
  request.get(API_URLS.api_test_environment.list, {
    params: { page: 1, page_size: 1000 }
  })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          env_options.value = res.data.data.results.map((item: any) => ({
            label: item.env_name,
            value: item.id
          }))
          // 设置默认环境
          const default_env = res.data.data.results.find((e: any) => e.is_default)
          if (default_env && form_data.value.env_id === null) {
            form_data.value.env_id = default_env.id
          }
        }
      })
}

// 监听弹窗打开，获取环境列表
watch(() => props.visible, (val) => {
  if (val){
    fetch_env_list()
  }
})

onMounted(() => {
  fetch_env_list()
})
</script>

<style scoped>
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
