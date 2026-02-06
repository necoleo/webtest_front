<template>
  <t-drawer
      size="850px"
      :visible="props.visible"
      header="编辑测试用例"
      placement="right"
      :on-close="handle_close"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: loading }"
      cancel-btn="取消"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <!-- 用例ID-只读 -->
      <t-form-item
          label="用例ID"
          name="test_case_id"
      >
        <t-input
            v-model="form_data.test_case_id"
            :disabled="true"
        />
      </t-form-item>

      <!-- 关联需求-只读 -->
      <t-form-item
          label="关联需求"
          name="requirement_id"
      >
        <t-input
            v-model="form_data.requirement_id"
            :disabled="true"
        />
      </t-form-item>

      <!-- 用例标题-可编辑 -->
      <t-form-item
          label="用例标题"
          name="case_title"
      >
        <t-input
            v-model="form_data.case_title"
            placeholder="请输入用例标题"
            :maxlength="255"
        />
      </t-form-item>

      <!-- 所属模块-可编辑 -->
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

      <!-- 优先级-可编辑 -->
      <t-form-item
          label="优先级"
          name="priority"
      >
        <t-select
            v-model="form_data.priority"
            :options="priority_options"
            placeholder="请选择优先级"
        />
      </t-form-item>

      <!-- 前置条件-可编辑 -->
      <t-form-item
          label="前置条件"
          name="precondition"
      >
        <t-textarea
            v-model="form_data.precondition"
            placeholder="请输入前置条件（可选）"
            :autosize="{ minRows: 2, maxRows: 6}"
        />
      </t-form-item>

      <!-- 测试步骤-可编辑 -->
      <t-form-item
          label="测试步骤"
          name="test_steps"
      >
        <t-textarea
            v-model="form_data.test_steps"
            placeholder="请输入测试步骤"
            :autosize="{ minRows: 3, maxRows: 6}"
        />
      </t-form-item>

      <!-- 预期结果-可编辑 -->
      <t-form-item
          label="预期结果"
          name="expected_result"
      >
        <t-textarea
            v-model="form_data.expected_result"
            placeholder="请输入预期结果"
            :autosize="{ minRows: 2, maxRows: 6}"
        />
      </t-form-item>

      <!-- 备注-可编辑 -->
      <t-form-item
          label="备注"
          name="comment"
      >
        <t-textarea
            v-model="form_data.comment"
            placeholder="请输入备注（可选）"
            :autosize="{ minRows: 2, maxRows: 4}"
        />
      </t-form-item>

    </t-form>
  </t-drawer>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {API_URLS} from "@/api/urls.ts";
import {MessagePlugin} from "tdesign-vue-next";
import {request} from "@/api/urls.ts";

// 测试用例数据类型定义
interface test_case_data {
  test_case_id: number;
  project_id: number;
  requirement_id: number;
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
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 所属模块下拉选项
const module_options = ref<{label: string; value: string}[]>([])
const handle_create_module = (value: string) => {
  // 将新模块添加到选项列表并自动选中
  module_options.value.push(
      {
        label: value,
        value: value
      }
  )
  form_data.value.module = value
}

// 表单信息
const form_data = ref({
  test_case_id: null as number | null,
  requirement_id: null as number | null,
  case_title: "",
  module: "",
  priority: 0,
  precondition: "",
  test_steps: "",
  expected_result: "",
  comment: "",
})

// 优先级选项
const priority_options = [
  { label: "P0-最高", value: 0 },
  { label: "P1-高", value: 1 },
  { label: "P2-中", value: 2 },
  { label: "P3-低", value: 3 }
]

// 关闭弹窗
const handle_close = () => {
  form_data.value = {
    test_case_id: null,
    requirement_id: null,
    case_title: "",
    module: "",
    priority: 0,
    precondition: "",
    test_steps: "",
    expected_result: "",
    comment: "",
  }
  emit('update:visible', false)
}

// 获取模块列表
const fetch_modules_list = async () => {
  request.get(API_URLS.functional_test_case.modules)
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
  if (!form_data.value.test_case_id) {
    MessagePlugin.warning("用例ID不存在")
    return
  }
  if (!form_data.value.case_title?.trim()) {
    MessagePlugin.warning("请输入用例标题")
    return
  }
  if (!form_data.value.test_steps?.trim()) {
    MessagePlugin.warning("请输入测试步骤")
    return
  }
  if (!form_data.value.expected_result?.trim()) {
    MessagePlugin.warning("请输入预期结果")
    return
  }

  loading.value = true
  const update_data = {
    test_case_id: form_data.value.test_case_id,
    case_title: form_data.value.case_title.trim(),
    module: form_data.value.module?.trim() || null,
    priority: form_data.value.priority,
    precondition: form_data.value.precondition?.trim() || null,
    test_steps: form_data.value.test_steps.trim(),
    expected_result: form_data.value.expected_result.trim(),
    comment: form_data.value.comment?.trim() || null,
  }

  request.post(API_URLS.functional_test_case.update, update_data)
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

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val){
    fetch_modules_list()
    if (props.test_case_data){
      form_data.value = {
        test_case_id: props.test_case_data.test_case_id || null,
        requirement_id: props.test_case_data.requirement_id || null,
        case_title: props.test_case_data.case_title || "",
        module: props.test_case_data.module || "",
        priority: props.test_case_data.priority ?? 0,
        precondition: props.test_case_data.precondition || "",
        test_steps: props.test_case_data.test_steps || "",
        expected_result: props.test_case_data.expected_result || "",
        comment: props.test_case_data.comment || "",
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

/* 下拉框样式 */
:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}
</style>
