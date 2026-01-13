<template>
  <t-dialog
      width="auto"
      :visible="props.visible"
      header="上传接口文档"
      :loading = "loading"
      :on-close="handle_close"
      :on-confirm="handle_confirm"
  >
    <t-form
        ref="form"
        :data="form_data"
    >
      <t-form-item
          label="项目"
          name="project_id"
      >
        <t-select
            class="project-selection"
            v-model="form_data.project_id"
            :options="project_options"
            placeholder="请选择项目"
            clearable
        />
      </t-form-item>

      <t-form-item
        label="版本"
        name="version"
      >
        <t-input
            v-model="form_data.version"
            placeholder="请输入版本"
        >
        </t-input>
      </t-form-item>

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

      <t-form-item
        label="接口文档"
        name="upload_api_document_file"
      >
        <t-upload
            v-model="uploaded_files"
            :auto-upload="false"
            :multiple="false"
            :max="1"
            accept=".json, .yaml, .yml"
            draggable
            theme="custom"
        >
          <template #dragContent="{ drag_active }">
            <div class="upload-area">
              <template
                  v-if="uploaded_files.length"
              >
                <t-icon
                    name="file"
                    size="48px"
                />
                <p>{{ uploaded_files[0].name }}</p>
              </template>
              <template v-else>
                <t-icon name="upload" size="48px" />
                <p v-if="drag_active">释放鼠标上传</p>
                <p v-else>点击或拖拽上传 JSON/YAML 文件</p>
              </template>

            </div>
          </template>
        </t-upload>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
  import {API_URLS} from "@/api/urls.ts";
  import {MessagePlugin} from "tdesign-vue-next";
  import {request} from "@/api/urls.ts";

  const props = defineProps<{ visible: boolean}>()
  const emit = defineEmits(['update:visible', 'success'])

  const loading = ref(false)
  // 表单信息
  const form_data = ref({
    project_id: null as number | null,
    version: "",
    comment: ""
  })

  // 上传文件列表
  const uploaded_files = ref<any[]>([])

  // 项目下拉选项
  const project_options = ref<{label: string; value: number}[]>([])

  // 关闭弹窗
  const handle_close = () => {
    // 重置表单
    form_data.value = {
      project_id: null,
      version: "",
      comment: ""
    }
    uploaded_files.value = []

    // 通知父组件关闭
    emit('update:visible', false)
  }

  // 确认上传
  const handle_confirm = async () => {
    // 校验必填项
    if (!form_data.value.project_id) {
      MessagePlugin.warning("请选择项目")
      return
    }
    if (!form_data.value.version) {
      MessagePlugin.warning("请选择版本")
      return
    }
    if (!uploaded_files.value.length) {
      MessagePlugin.warning("请上传接口文档")
      return
    }

    // 表单数据 FormData
    loading.value = true
    const submit_form_data = new FormData()
    submit_form_data.append("project_id", String(form_data.value.project_id))
    submit_form_data.append("version", form_data.value.version)
    submit_form_data.append("comment", form_data.value.comment)
    submit_form_data.append("file", uploaded_files.value[0].raw) // t-upload 的原始文件

    request.post(API_URLS.api_document.upload, submit_form_data)
        .then((res) => {
          if (res.status === 200 && res.data.code === "000000") {
            MessagePlugin.success(`上传成功`);
            // 通知父组件
            emit("success")
            handle_close()
          }
          else {
            MessagePlugin.error(`上传失败: ${res.data.message}`);
          }
        })
        .catch((e) => {
          MessagePlugin.error(`上传失败: ${e.response?.data?.message || e.message}`);
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

  // 监听弹窗打开，获取项目列表
  watch(() => props.visible, (val) => {
    if (val){
      fetch_project_lists()
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

