<template>
  <div class="container">
    <t-layout class="project-container">
      <!-- 侧边栏区域 -->
      <t-aside>
        <div class="sidebar-section">
          <Sidebar :menu_items="default_menu"/>
        </div>
      </t-aside>
      <t-layout>
        <!-- 顶部导航栏 -->
        <t-header>
          <t-head-menu>
            <div class="header-menu">
              <h2> 项目管理 </h2>
              <div class="header-menu-operations">
                <t-button
                    variant="text"
                    shape="square"
                >
                  <template #icon>
                    <t-icon name="user"/>
                  </template>
                </t-button>
              </div>
            </div>
          </t-head-menu>
        </t-header>
        <t-content>
          <div class="current_page_path">
            <span> 功能测试 / 项目管理</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
                <t-input
                    class="search-input"
                    v-model="search_key_word"
                    placeholder="输入项目名称"
                    clearable
                    size="medium"
                    type="search"
                >
                  <template #prefix-icon>
                    <t-icon name="search"/>
                  </template>
                </t-input>

                <t-select
                    class="status-filter"
                    v-model="status_filter_selection"
                    :options="status_filter_options"
                    clearable
                    size="medium"
                    placeholder="全部状态"
                />
                <t-button
                    class="search-button"
                    type="primary"
                    variant="outline"
                    @click="handleClickSearchButton"
                >
                  搜索
                </t-button>
                <t-button
                    class="reset-search-button"
                    type="primary"
                    variant="outline"
                    @click="handleClickResetButton"
                >
                  重置
                </t-button>
                <t-button
                    class="upload-file-button"
                    type="primary"
                    variant="outline"
                    @click="handleUploadFileButton"
                >
                  <UploadIcon />
                  上传需求文档
                </t-button>
                <t-button
                    class="add_project_button"
                    theme="primary"
                    variant="outline"
                >
                  新增项目
                </t-button>

              </div>
            <div class="project-table-container">
              <t-table
                  class="project-table"
                  row-key="project_code"
                  :data="project_data"
                  :columns="columns"
                  :stripe="false"
                  :bordered="false"
                  :hover="hover"
                  :table-layout="tableLayout ? 'auto' : 'fixed'"
                  :size="size"
                  :pagination="pagination"
                  :show-header="showHeader"
                  cell-empty-content="-"
                  resizable
                  lazy-load
              >
                <template #requirement_document="{ row }">
                  <t-link theme="primary"
                          hover="color"
                          @click="handleDownloadRequirementDoc(row)"
                          :disabled="!row.requirement_document_url"
                  >
                    {{ row.requirement_document_name }}
                  </t-link>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="edit_project_button"
                        theme="primary"
                        hover="color"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_project_button"
                        theme="primary"
                        hover="color"
                        @click="handleDeleteProject(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <div class="delete_dialog">
              <t-dialog
                  v-model:visible="delete_dialog_visible"
                  header="删除确认"
                  width="25%"
                  :confirm-on-enter="true"
                  :on-cancel="onCancel"
                  :on-esc-keydown="onEscKeydown"
                  :on-close-btn-click="onCloseBtnClick"
                  :on-overlay-click="onOverlayClick"
                  :on-close="close"
                  :on-confirm="onConfirmAnother"
              >
                <p> 是否确认删除该项目,此操作不可撤销 </p>
              </t-dialog>
            </div>
            <div class="upload-file-dialog">
              <t-dialog
                  v-model:visible="upload_file_dialog_visible"
                  header="上传需求文档"
                  width="25%"
                  :loading = "upload_dialog_loading"
                  :confirm-on-enter="true"
                  :on-cancel="onCancel"
                  :on-esc-keydown="onEscKeydown"
                  :on-close-btn-click="onCloseBtnClick"
                  :on-overlay-click="onOverlayClick"
                  :on-close="close"
                  :on-confirm="handleClickUploadConfirmButton"
              >
                <t-select
                    class="project-selection"
                    v-model="project_filter_selection"
                    :options="project_filter_options"
                    label="项目"
                    placeholder="请选择项目"
                    clearable
                    @blur="handleBlurProjectSelect"
                />
                <t-upload
                    ref="upload_file_ref"
                    v-model="uploaded_files"
                    :with-credentials="true"
                    :data="{ project_code: project_filter_selection }"
                    :action="BASE_URLS + '/' + API_URLS.requirements_document.upload"
                    draggable
                    theme="custom"
                    :auto-upload="false"
                    @fail="handle_upload_file_fail"
                    @success="handle_upload_file_success"
                    @progress="handle_upload_progress"
                >
                  <template #dragContent="params">
                    <ul v-if="uploaded_files && uploaded_files.length" style="padding: 0">
                      <li v-for="file in uploaded_files" :key="file.name" style="list-style-type: none">{{ file.name }}</li>
                    </ul>
                    <template v-else>
                      <p v-if="params && params.dragActive">释放鼠标</p>
                      <t-button v-else-if="uploaded_files.length < 1">自定义拖拽区域</t-button>
                    </template>
                    <t-button v-if="uploaded_files && uploaded_files.length" size="small" style="margin-top: 36px">更换文件</t-button>
                    <!-- <span>数据状态：{{params}}</span> -->
                  </template>
                </t-upload>
              </t-dialog>
            </div>
          </div>

        </t-content>
        <t-footer>
          Heypon AI 测试
        </t-footer>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
  import Sidebar from "@/components/Sidebar.vue";
  import {default_menu} from "@/config/sidebar_menus";
  import {API_URLS, BASE_URLS} from "@/api/urls.ts";
  import {computed, ref} from "vue";
  import type {TableProps, UploadInstanceFunctions} from "tdesign-vue-next";
  import { MessagePlugin} from 'tdesign-vue-next';
  import {request} from "@/api/urls.ts";
  import { UploadIcon } from 'tdesign-icons-vue-next'

  interface project_data {
    project_code: number;
    project_name: string;
    description: string;
    project_type: string;
    project_status: string;
    start_date: string;
    end_date: string;
    requirement_document_name: string | null;
    requirement_document_url?: string | null;
  }

  // 项目列表初始化
  const project_data = ref<project_data[]>([]);
  // 总页数
  const total = ref(0);
  const status_map: Record<number, string> = {
    0: '未开始',
    1: '进行中',
    2: '完成',
    3: '暂停',
    4: '终止'
  }

  // 项目状态下拉框初始化
  const status_filter_selection = ref("")
  // 项目状态选项
  const status_filter_options = [
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
  ]

  // 搜索框关键字
  const search_key_word = ref("")

  const hover = ref(false);
  const size = ref<TableProps['size']>('large');
  const tableLayout = ref(false);
  const showHeader = ref(true);

  const columns = ref<TableProps['columns']>([
    {
      colKey: 'project_code',
      title: '项目编码',

    },
    {
      colKey: 'project_name',
      title: '项目名称',
      width: '100',
    },
    {
      colKey: 'description',
      title: '项目描述',
    },
    {
      colKey: 'project_type',
      title: '项目类型',
      ellipsis: true,
    },
    {
      colKey: 'project_status',
      title: '项目状态',
    },
    {
      colKey: 'start_date',
      title: '项目开始日期',
    },
    {
      colKey: 'end_date',
      title: '项目结束时间',
    },
    {
      colKey: 'requirement_document',
      title: '需求文档',
    },
    {
      colKey: 'operation',
      title: '操作',
      width: 120,
    },
  ]);

  const pagination = ref<TableProps['pagination']>({
    defaultCurrent: 1,
    defaultPageSize: 5,
    total: total.value,
  });

  // 刷新项目列表
  const refreshProjectList = async () => {
    request.get(API_URLS.projects.get_projects_list)
        .then((res) => {
          if (res.status === 200 && res.data.code === "success") {
            project_data.value = res.data.data.projects_list.map((item: any) => {
              return {
                ...item,
                project_code: item.code,
                project_name: item.name,
                description: item.description,
                project_type: item.type,
                project_status: status_map[item.status],
                start_date: item.start_date,
                end_date: item.end_date,
                requirement_document_name: item.requirement_name,
                requirement_document_url: item.requirement_url,
              }
            });
            total.value = project_data.value.length;
            // 更新分页显示总数据
            // ts 要求处理可能出现的 undefined 问题
            if (pagination.value) {
              pagination.value.total = total.value;
            }


            console.log(project_data.value)
          }
        })

  }

  refreshProjectList()

  // 项目下拉框初始化
  const project_filter_selection = ref<number | null>(null)
  // 项目下拉框选项
  const project_filter_options = computed(() => {
    return project_data.value.map((item: any) => ({
      label: item.project_name,
      value: item.project_code,
    }))
  })
  // 处理项目选择框失焦事件
  const handleBlurProjectSelect = () => {
    if (project_filter_selection.value == null) {
      MessagePlugin.error("项目为必选项")
    }
  }
  // 已上传的文件
  const uploaded_files = ref<any[]>([])
  // 显示上传进度
  const upload_process = ref(0)

  // 处理上传需求文档失败
  const handle_upload_file_fail = (context: any) => {
    const { file, response } = context || {}
    MessagePlugin.error(response?.message || `上传失败${file?.name ? `：${file.name}` : ''}`)
    upload_dialog_loading.value = false
  }

  //处理上传需求文档成功
  const handle_upload_file_success = (context: any) => {
    const { file, response } = context
    MessagePlugin.success(response?.message || `上传成功${file?.name ? `：${file.name}` : ''}`)
    upload_dialog_loading.value = false
  }

  // 处理上传进度
  const handle_upload_progress = (context: any) => {
    const { percent }= context || {}
    upload_process.value = Math.round(percent || 0)
  }

  const upload_file_ref = ref<UploadInstanceFunctions>()
  const upload_dialog_loading = ref(false)
  // 点击确认上传需求文档
  const handleClickUploadConfirmButton = () => {
    upload_dialog_loading.value = true
    if (!project_filter_selection.value) {
      MessagePlugin.error('请选择项目');
      upload_dialog_loading.value = false
      return;
    }
    if (!uploaded_files.value.length) {
      MessagePlugin.error('请先选择文件');
      upload_dialog_loading.value = false
      return;
    }
    // 上传文件和project_code
    if (upload_file_ref.value){
      upload_file_ref.value?.uploadFiles()
    }
  }

  // 点击搜索按钮
  const handleClickSearchButton = () => {
    console.log(search_key_word.value)
  }

  // 点击重置按钮
  const handleClickResetButton = () => {
    search_key_word.value = "";
    status_filter_selection.value = "";
    handleClickSearchButton()
  }

  // 点击上传需求文档
  const upload_file_dialog_visible = ref(false);
  const handleUploadFileButton = () => {
    upload_file_dialog_visible.value = true;
  }

  // 点击删除
  const delete_dialog_visible = ref(false);
  const target_project = ref<number | null>(null)
  const handleDeleteProject = (row: project_data) => {
    target_project.value = row.project_code;
    if (!target_project){
      MessagePlugin.error("项目不存在")
    }
    delete_dialog_visible.value = true;
  }

  // 下载需求文档
  const handleDownloadRequirementDoc = (row: project_data) => {
    const url = row.requirement_document_url;
    if (!url) {
      MessagePlugin.error('该项目暂无需求文档');
      return;
    }
    try {
      window.open(url, '_blank');
    } catch (e) {
      MessagePlugin.error('打开链接失败');
    }
  }

  const onCancel = () => {
    delete_dialog_visible.value = false;
  }

  const onEscKeydown = () => {
    delete_dialog_visible.value = false;
  }

  const onCloseBtnClick = () => {
    delete_dialog_visible.value = false;
  }

  const onOverlayClick = () => {
    delete_dialog_visible.value = false;
  }

  const close = () => {
    target_project.value = null;
  }

  // 点击项目删除确认按钮
  const onConfirmAnother = () => {
    console.log(target_project.value);
    if (!target_project){
      MessagePlugin.error("项目不存在")
    }
    try{
      request.post(API_URLS.projects.delete_project, {"project_code": target_project.value})
          .then((res) => {
            if (res.status === 200 && res.data.code === "success") {
              MessagePlugin.success("删除成功")
              delete_dialog_visible.value = false;
              refreshProjectList()
            }
            else {
              MessagePlugin.error("删除失败: ${res.data.data}")
            }
          })
    }
    catch (e) {
      MessagePlugin.error("删除失败: ${e.message}")
    }
  }

  const handleRowClick: TableProps['onRowClick'] = (e) => {
    console.log(e);
  };
</script>

<style scoped>
  .project-container{
    height: 100vh;
  }

  .sidebar-section{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #f0f0f0;
  }

  /* 布局相关 */
  :deep(.t-layout .t-layout){
    height: 100%;
  }

  :deep(.t-layout__sider){
    height: 100%;
    width: 300px;
    border-radius: 20px;
    margin-right: 20px;
  }

  :deep(.t-layout__header){
    border-radius: 20px;
    overflow: hidden;
    height: 60px;
  }

  :deep(.t-layout__content){
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 20px;
    overflow: hidden;
    min-height: 0;
  }

  :deep(.t-head-menu){
    height: 100%;
  }

  .header-menu{
    display: flex;
    justify-content:  space-between;
    align-items: center;
    width: 100%;
    border-radius: 20px;
    padding: 20px;
  }

  .current_page_path{
    display: flex;
    font-size: 18px;
    padding: 10px;
  }

  .main-content{
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 24px;
    overflow: hidden;
    margin-top: 10px;
    min-height: 0;
  }

  /* 筛选操作栏 */
  .filter-actions-container{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    background-color: #FFF;
    gap: 20px;
    padding: 0 20px;
  }

  .search-input{
    width: 50%;
  }

  :deep(.search-input .t-input) {
    border-radius: 12px;
    height: 40px;
  }

  .status-filter{
    width: 25%;
  }

  :deep(.t-input.t-is-readonly .t-input__inner) {
    width: 25%;
  }

  :deep(.status-filter .t-input) {
    border-radius: 12px;
    transition: all 0.25s ease;
    height: 40px;
  }

  /* 搜索、重置、上传按钮  */
  .search-button,
  .reset-search-button,
  .upload-file-button {
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0 16px;
    height: 40px;
  }

  :deep(.upload-file-button .t-button__text) {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .add_project_button {
    border-radius: 12px;
    width: 25%;
    height: 40px;
  }
  /* 接口文档表单样式 */
  .api_document_table_container{
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  :deep(.t-table) {
    display: flex;
    flex-direction: column;
    height: 800px;
    min-height: 0;
  }

  :deep(.t-table__header){
    position: sticky;
    top: 0;
    z-index: 10;
  }

  :deep(.t-table__content){
    padding: 0 20px 20px 20px;
  }

  :deep(.t-table thead td, .t-table th){
    font-size: 16px;
  }

  /* 操作栏按钮 */
  :deep(.t-link--theme-primary){
    padding-right: 5px;
  }
</style>