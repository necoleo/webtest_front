<template>
  <t-dialog
      width="600px"
      :visible="props.visible"
      header="编辑环境"
      :loading="loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form ref="form_ref" :data="form_data" :rules="form_rules">
      <t-form-item label="环境名称" name="env_name">
        <t-input v-model="form_data.env_name" placeholder="请输入环境名称，如：开发环境、测试环境" />
      </t-form-item>
      <t-form-item label="Base URL" name="base_url">
        <t-input v-model="form_data.base_url" placeholder="例如: https://api.example.com" />
      </t-form-item>
      <t-form-item label="超时时间(秒)" name="timeout">
        <t-input-number
            v-model="form_data.timeout"
            :min="1"
            :max="600"
            style="width: 100%;"
            @blur="handle_timeout_blur"
        />
      </t-form-item>
      <t-form-item label="Headers (JSON)" name="headers">
        <t-textarea
            v-model="form_data.headers"
            placeholder='{"Content-Type": "application/json", "Authorization": "Bearer xxx"}'
            :autosize="{ minRows: 3, maxRows: 6 }"
        />
        <template #help>
          <span class="field-help">请输入 JSON 格式的请求头，如：{"Content-Type": "application/json"}</span>
        </template>
      </t-form-item>
      <t-form-item label="Variables (JSON)" name="variables">
        <t-textarea
            v-model="form_data.variables"
            placeholder='{"token": "xxx", "user_id": 123}'
            :autosize="{ minRows: 3, maxRows: 6 }"
        />
        <template #help>
          <span class="field-help">请输入 JSON 格式的环境变量，可在用例中通过 ${variable_name} 引用</span>
        </template>
      </t-form-item>
      <t-form-item label="描述" name="description">
        <t-textarea
            v-model="form_data.description"
            placeholder="请输入环境描述"
            :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </t-form-item>
      <t-form-item label="设为默认" name="is_default">
        <t-switch v-model="form_data.is_default" />
        <template #help>
          <span class="field-help">默认环境将在执行测试用例时自动选中</span>
        </template>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {MessagePlugin} from "tdesign-vue-next";
import {request, API_URLS} from "@/api/urls.ts";

const props = defineProps<{
  visible: boolean;
  environment_data: any;
}>();

const emit = defineEmits(['update:visible', 'success']);

const loading = ref(false);
const form_ref = ref();

const form_data = ref({
  id: null as number | null,
  env_name: "",
  base_url: "",
  timeout: 30,
  headers: "",
  variables: "",
  description: "",
  is_default: false
});

const form_rules = {
  env_name: [{ required: true, message: '请输入环境名称', type: 'error' }],
  base_url: [{ required: true, message: '请输入 Base URL', type: 'error' }],
};

// 监听 visible 变化，填充数据
watch(() => props.visible, (is_visible) => {
  if (is_visible && props.environment_data) {
    form_data.value = {
      id: props.environment_data.id,
      env_name: props.environment_data.env_name || "",
      base_url: props.environment_data.base_url || "",
      timeout: props.environment_data.timeout || 30,
      headers: props.environment_data.headers ? JSON.stringify(props.environment_data.headers, null, 2) : "",
      variables: props.environment_data.variables ? JSON.stringify(props.environment_data.variables, null, 2) : "",
      description: props.environment_data.description || "",
      is_default: props.environment_data.is_default || false
    };
  }
});

const reset_form = () => {
  form_data.value = {
    id: null,
    env_name: "",
    base_url: "",
    timeout: 30,
    headers: "",
    variables: "",
    description: "",
    is_default: false
  };
};

const handle_timeout_blur = () => {
  if (form_data.value.timeout > 600) {
    form_data.value.timeout = 600;
  } else if (form_data.value.timeout < 1 || !form_data.value.timeout) {
    form_data.value.timeout = 1;
  }
};

const validate_json = (value: string, field_name: string): boolean => {
  if (!value || value.trim() === "") {
    return true;
  }
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    MessagePlugin.warning(`${field_name} 格式不正确，请输入有效的 JSON`);
    return false;
  }
};

const handle_close = () => {
  reset_form();
  emit('update:visible', false);
};

const handle_confirm = async () => {
  const validate_result = await form_ref.value?.validate();
  if (validate_result !== true) {
    return;
  }

  // 验证 JSON 格式
  if (!validate_json(form_data.value.headers, "Headers")) {
    return;
  }
  if (!validate_json(form_data.value.variables, "Variables")) {
    return;
  }

  loading.value = true;

  // 构建提交数据
  const submit_data: any = {
    environment_id: form_data.value.id,
    env_name: form_data.value.env_name,
    base_url: form_data.value.base_url,
    timeout: form_data.value.timeout,
    description: form_data.value.description,
    is_default: form_data.value.is_default,
  };

  // 解析 JSON 字段
  if (form_data.value.headers && form_data.value.headers.trim()) {
    submit_data.headers = JSON.parse(form_data.value.headers);
  } else {
    submit_data.headers = {};
  }
  if (form_data.value.variables && form_data.value.variables.trim()) {
    submit_data.variables = JSON.parse(form_data.value.variables);
  } else {
    submit_data.variables = {};
  }

  request.post(API_URLS.api_test_environment.update, submit_data)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success("更新成功");
          emit('success');
          handle_close();
        } else {
          MessagePlugin.error(`更新失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`更新失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading.value = false;
      });
};
</script>

<style scoped>
.field-help {
  color: #909399;
  font-size: 12px;
}

:deep(.t-input) {
  border-radius: 12px;
  height: 40px;
}

:deep(.t-textarea__inner) {
  border-radius: 12px;
}
</style>
