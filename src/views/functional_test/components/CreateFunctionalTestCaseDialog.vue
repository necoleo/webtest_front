<template>
  <t-dialog
      width="700px"
      :visible="props.visible"
      header="新建测试用例"
      :loading = "loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <t-form-item
          label="所属项目"
          name="project_id"
      >
        <t-select
            v-model="form_data.project_id"
            :options="project_options"
            placeholder="请选择项目"
            clearable
        />
      </t-form-item>

      <t-form-item
          label="关联需求"
          name="requirement_id"
      >
        <t-select
            v-model="form_data.requirement_id"
            :options="requirement_options"
            placeholder="请选择关联需求"
            clearable
            filterable
        />
      </t-form-item>

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

      <t-form-item
          label="前置条件"
          name="precondition"
      >
        <t-textarea
            v-model="form_data.precondition"
            placeholder="请输入前置条件（可选）"
            :autosize="{ minRows: 2, maxRows: 4}"
        />
      </t-form-item>

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

      <t-form-item
          label="预期结果"
          name="expected_result"
      >
        <t-textarea
            v-model="form_data.expected_result"
            placeholder="请输入预期结果"
            :autosize="{ minRows: 2, maxRows: 4}"
        />
      </t-form-item>

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
  </t-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {API_URLS} from "@/api/urls.ts";
import {MessagePlugin} from "tdesign-vue-next";
import {request} from "@/api/urls.ts";

// props 定义
const props = defineProps<{
  visible: boolean;
}>()

// Emits 定义
const emit = defineEmits(['update:visible', 'success'])

const loading = ref(false)

// 表单信息
const form_data = ref({
  project_id: null as number | null,
  requirement_id: null as number | null,
  case_title: "",
  module: "",
  priority: 0,
  precondition: "",
  test_steps: "",
  expected_result: "",
  comment: "",
})

// 项目下拉选项
const project_options = ref<{label: string; value: number}[]>([])

// 需求下拉选项
const requirement_options = ref<{label: string; value: number}[]>([])

// 所属模块下拉选项
const module_options = ref<{label: string; value: string}[]>([])
const handle_create_module = (value: string) => {
  // 将新模块添加到选项列表并自动选中
  module_options.value.push({
    label: value,
    value: value,
  })
  form_data.value.module = value
}

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
    project_id: null,
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

// 确认创建
const handle_confirm = async () => {
  // 参数校验
  if (!form_data.value.project_id) {
    MessagePlugin.warning("请选择所属项目")
    return
  }
  if (!form_data.value.requirement_id) {
    MessagePlugin.warning("请选择关联需求")
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
  const create_data = {
    project_id: form_data.value.project_id,
    requirement_id: form_data.value.requirement_id,
    case_title: form_data.value.case_title.trim(),
    module: form_data.value.module?.trim() || null,
    priority: form_data.value.priority,
    precondition: form_data.value.precondition?.trim() || null,
    test_steps: form_data.value.test_steps.trim(),
    expected_result: form_data.value.expected_result.trim(),
    comment: form_data.value.comment?.trim() || null,
    case_source: 0, // 手动创建
  }

  request.post(API_URLS.functional_test_case.create, create_data)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`创建成功`);
          emit("success")
          handle_close()
        }
        else {
          MessagePlugin.error(`创建失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`创建失败: ${e.response?.data?.message || e.message}`);
      })
      .finally(() => {
        loading.value = false
      });
}

// 获取项目列表
const fetch_project_list = async () => {
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

// 获取需求列表（已审核的需求）
const fetch_requirement_list = async () => {
  const params = {
    page: 1,
    page_size: 100,
    status: 2
    , // 已审核
  }
  request.get(API_URLS.requirement.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          requirement_options.value = res.data.data.results.map((item: any) => ({
            label: `#${item.id} ${item.requirement_title || '未命名需求'}`,
            value: item.id
          }))
        }
      })
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
// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val){
    fetch_project_list()
    fetch_requirement_list()
    fetch_modules_list()
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

/* 下拉框样式 */
:deep(.t-select .t-input) {
  border-radius: 12px;
  height: 40px;
}
</style>
