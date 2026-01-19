<template>
  <t-dialog
      width="550px"
      :visible="props.visible"
      header="编辑定时任务"
      :loading="loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form ref="form_ref" :data="form_data" :rules="form_rules">
      <t-form-item label="任务名称" name="task_name">
        <t-input v-model="form_data.task_name" placeholder="请输入任务名称" />
      </t-form-item>
      <t-form-item label="测试用例" name="test_case_id">
        <t-select
            v-model="form_data.test_case_id"
            placeholder="请选择测试用例"
            :loading="test_case_loading"
            filterable
        >
          <t-option
              v-for="item in test_case_options"
              :key="item.id"
              :value="item.id"
              :label="item.case_name"
          />
        </t-select>
      </t-form-item>
      <t-form-item label="执行环境" name="env_id">
        <t-select
            v-model="form_data.env_id"
            placeholder="请选择执行环境"
            :loading="env_loading"
            filterable
        >
          <t-option
              v-for="item in env_options"
              :key="item.id"
              :value="item.id"
              :label="item.env_name"
          />
        </t-select>
      </t-form-item>
      <t-form-item label="调度类型" name="schedule_type">
        <t-radio-group v-model="form_data.schedule_type">
          <t-radio :value="0">每天</t-radio>
          <t-radio :value="1">每周</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item v-if="form_data.schedule_type === 1" label="执行星期" name="schedule_weekday">
        <t-select v-model="form_data.schedule_weekday" placeholder="选择星期">
          <t-option :value="1" label="周一" />
          <t-option :value="2" label="周二" />
          <t-option :value="3" label="周三" />
          <t-option :value="4" label="周四" />
          <t-option :value="5" label="周五" />
          <t-option :value="6" label="周六" />
          <t-option :value="7" label="周日" />
        </t-select>
      </t-form-item>
      <t-form-item label="执行时间" name="schedule_time">
        <t-time-picker v-model="form_data.schedule_time" format="HH:mm" style="width: 100%;" />
      </t-form-item>
      <t-form-item label="描述" name="description">
        <t-textarea
            v-model="form_data.description"
            placeholder="请输入任务描述"
            :autosize="{ minRows: 2, maxRows: 4 }"
        />
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
  schedule_data: any;
}>();

const emit = defineEmits(['update:visible', 'success']);

const loading = ref(false);
const test_case_loading = ref(false);
const env_loading = ref(false);
const form_ref = ref();

const test_case_options = ref<any[]>([]);
const env_options = ref<any[]>([]);

const form_data = ref({
  id: null as number | null,
  task_name: "",
  test_case_id: null as number | null,
  env_id: null as number | null,
  schedule_type: 0,
  schedule_weekday: 1,
  schedule_time: "09:00",
  description: ""
});

const form_rules = {
  task_name: [{ required: true, message: '请输入任务名称', type: 'error' }],
  test_case_id: [{ required: true, message: '请选择测试用例', type: 'error' }],
  env_id: [{ required: true, message: '请选择执行环境', type: 'error' }],
  schedule_time: [{ required: true, message: '请选择执行时间', type: 'error' }],
};

const reset_form = () => {
  form_data.value = {
    id: null,
    task_name: "",
    test_case_id: null,
    env_id: null,
    schedule_type: 0,
    schedule_weekday: 1,
    schedule_time: "09:00",
    description: ""
  };
};

const load_options = async () => {
  // 加载测试用例列表
  test_case_loading.value = true;
  request.get(API_URLS.api_test_case.list, { params: { page: 1, page_size: 1000 } })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          test_case_options.value = res.data.data.results || [];
        }
      })
      .finally(() => {
        test_case_loading.value = false;
      });

  // 加载环境列表
  env_loading.value = true;
  request.get(API_URLS.api_test_environment.list, { params: { page: 1, page_size: 1000 } })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          env_options.value = res.data.data.results || [];
        }
      })
      .finally(() => {
        env_loading.value = false;
      });
};

const fill_form_data = () => {
  if (props.schedule_data) {
    form_data.value = {
      id: props.schedule_data.id,
      task_name: props.schedule_data.task_name || "",
      test_case_id: props.schedule_data.test_case_id,
      env_id: props.schedule_data.env_id,
      schedule_type: props.schedule_data.schedule_type || 0,
      schedule_weekday: props.schedule_data.schedule_weekday || 1,
      schedule_time: props.schedule_data.schedule_time || "09:00",
      description: props.schedule_data.description || ""
    };
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

  loading.value = true;

  const submit_data: any = {
    schedule_id: form_data.value.id,
    task_name: form_data.value.task_name,
    test_case_id: form_data.value.test_case_id,
    env_id: form_data.value.env_id,
    schedule_type: form_data.value.schedule_type,
    schedule_time: form_data.value.schedule_time,
    description: form_data.value.description,
  };

  if (form_data.value.schedule_type === 1) {
    submit_data.schedule_weekday = form_data.value.schedule_weekday;
  }

  request.post(API_URLS.api_test_schedule.update, submit_data)
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

// 弹窗打开时加载选项和填充数据
watch(() => props.visible, (is_visible) => {
  if (is_visible) {
    load_options();
    fill_form_data();
  }
});
</script>

<style scoped>
:deep(.t-input) {
  border-radius: 12px;
  height: 40px;
}

:deep(.t-textarea__inner) {
  border-radius: 12px;
}

:deep(.t-select) {
  width: 100%;
}

:deep(.t-select .t-input) {
  border-radius: 12px;
}

:deep(.t-time-picker) {
  width: 100%;
}

:deep(.t-time-picker .t-input) {
  border-radius: 12px;
}
</style>
