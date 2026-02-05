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
            <span>项目管理 / 项目列表</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <form class="filter-actions-container"
                  @submit.prevent="handle_click_search_button"
            >
              <t-input
                  class="search-input"
                  v-model="search_project_id"
                  placeholder="输入项目id"
                  clearable
                  size="medium"
                  type="number"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-input
                  class="search-input"
                  v-model="search_project_name"
                  placeholder="输入项目名称"
                  clearable
                  size="medium"
                  type="search"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-input
                  class="search-input"
                  v-model="search_project_type"
                  placeholder="输入项目类型"
                  clearable
                  size="medium"
                  type="search"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-select
                  class="search-select"
                  v-model="search_project_status"
                  :options="status_filter_options"
                  clearable
                  size="medium"
                  placeholder="全部状态"
              />

              <t-date-picker
                  class="search-date-picker"
                  v-model="search_project_start_date"
                  placeholder="开始日期"
                  format="YYYY-MM-DD"
                  clearable
              ></t-date-picker>

              <t-date-picker
                  class="search-date-picker"
                  v-model="search_project_end_date"
                  placeholder="结束日期"
                  format="YYYY-MM-DD"
                  clearable
              ></t-date-picker>

              <t-button
                  class="search-button"
                  type="submit"
                  variant="outline"
              >
                搜索
              </t-button>
              <t-button
                  class="reset-search-button"
                  type="button"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <t-button
                  class="add_project_button"
                  theme="primary"
                  variant="outline"
                  @click="show_create_project_dialog=true"
              >
                新增项目
              </t-button>
            </form>

            <div class="project-table-container">
              <t-table
                  class="project-table"
                  row-key="project_id"
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
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="edit_project_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.project_id)"
                        @click="handle_update_project(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_project_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.project_id)"
                        @click="handle_delete_project(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <create-project-dialog
                v-model:visible="show_create_project_dialog"
                @success="refresh_project_list"
            ></create-project-dialog>
            <update-project-dialog
                v-model:visible="show_update_project_dialog"
                :project_data="updated_project_data"
                @success="refresh_project_list"
            ></update-project-dialog>
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
  import {API_URLS} from "@/api/urls.ts";
  import {ref} from "vue";
  import type {TableProps} from "tdesign-vue-next";
  import { MessagePlugin,DialogPlugin} from 'tdesign-vue-next';
  import {request} from "@/api/urls.ts";
  import CreateProjectDialog from "@/views/project/components/CreateProjectDialog.vue";
  import UpdateProjectDialog from "@/views/project/components/UpdateProjectDialog.vue";

  interface project_data {
    project_id: number;
    project_name: string;
    description: string;
    project_type: string;
    project_status: number;
    start_date: string;
    end_date: string;
  }

  // 项目列表初始化
  const project_data = ref<project_data[]>([]);

  // 搜索框-项目id
  const search_project_id = ref<number | undefined>();

  // 搜索框-项目名称
  const search_project_name = ref<string>("")

  // 搜索框-项目类型
  const search_project_type = ref<string>("")

  // 搜索框-项目状态
  const search_project_status = ref<number | undefined>();

  // 搜索框-计划开始日期
  const search_project_start_date = ref<string>("");

  // 搜索框-计划结束日期
  const search_project_end_date = ref<string>("");

  // 存储正在操作的行 id
  const loading_row = ref<Set<number>>(new Set());

  // 新建项目弹窗
  const show_create_project_dialog = ref<boolean>(false);

  // 编辑项目弹窗
  const show_update_project_dialog = ref<boolean>(false)
  // 选中的项目
  const updated_project_data = ref<project_data | null>(null)

  // 总页数
  const total = ref(0)
  const pagination = ref<TableProps['pagination']>({
    current: 1,
    pageSize: 20,
    total: total.value,
    onChange: (pageInfo) => {
      pagination.value!.current = pageInfo.current;
      pagination.value!.pageSize = pageInfo.pageSize;
    }
  });
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
    }
  ]
  // 项目状态map
  const status_map: Record<number, string> = {
    0: '未开始',
    1: '进行中',
    2: '完成',
    3: '暂停',
    4: '终止'
  }
  const hover = ref(false);
  const size = ref<TableProps['size']>('large');
  const tableLayout = ref(false);
  const showHeader = ref(true);

  const columns = ref<TableProps['columns']>([
    {
      colKey: 'project_id',
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
      colKey: 'project_status_text',
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
      colKey: 'operation',
      title: '操作',
      width: 120,
    },
  ]);

  // 刷新项目列表
  const refresh_project_list = async () => {
    request.get(API_URLS.project.list)
        .then((res) => {
          if (res.status === 200 && res.data.code === "000000") {
            project_data.value = res.data.data.results.map((item: any) => {
              return {
                ...item,
                project_id: item.id,
                project_name: item.project_name,
                description: item.description,
                project_type: item.project_type,
                project_status: item.project_status,
                project_status_text: status_map[item.project_status],
                start_date: item.start_date,
                end_date: item.end_date
              }
            });
            total.value = project_data.value.length;
            // 更新分页显示总数据
            // ts 要求处理可能出现的 undefined 问题
            if (pagination.value) {
              pagination.value.total = total.value;
            }
          }
        })

  }

  refresh_project_list()

  // 点击搜索按钮
  const handle_click_search_button = () => {
    const params: any = {
      page: pagination.value?.current || 1,
      page_size: pagination.value?.pageSize || 20,
    }
    if (search_project_id.value != undefined) {
      params.id = search_project_id.value;
    }
    if (search_project_name.value != "") {
      params.project_name = search_project_name.value;
    }
    if (search_project_type.value != "") {
      params.project_type = search_project_type.value;
    }
    if (search_project_status.value != undefined) {
      params.project_status = search_project_status.value;
    }
    if (search_project_start_date.value != "") {
      params.start_date = search_project_start_date.value;
    }
    if (search_project_end_date.value != "") {
      params.end_date = search_project_end_date.value;
    }

    request.get(API_URLS.project.list, { params })
        .then((res) => {
          if (res.status === 200 && res.data.code === "000000") {
            project_data.value = res.data.data.results.map((item: any) => {
              return {
                ...item,
                project_id: item.id,
                project_name: item.project_name,
                description: item.description,
                project_type: item.project_type,
                project_status: item.project_status,
                project_status_text: status_map[item.project_status],
                start_date: item.start_date,
                end_date: item.end_date,
              }
            });
            total.value = res.data.data.total_count;
            // 更新分页显示总数据
            if (pagination.value) {
              pagination.value.total = total.value;
            }
          }
        })
  }

  // 点击重置按钮
  const handle_click_reset_button = () => {
    search_project_id.value = undefined;
    search_project_name.value = ""
    search_project_type.value = ""
    search_project_status.value = undefined;
    search_project_start_date.value = ""
    search_project_end_date.value = ""
    handle_click_search_button()
  }

  // 点击编辑项目
  const handle_update_project = (row: project_data) => {
    show_update_project_dialog.value = true
    console.log(row)
    updated_project_data.value = row
  }


  // 点击删除项目
  const handle_delete_project = (row: project_data) => {
    const project_id = row.project_id;
    loading_row.value.add(project_id)
    if (!project_id){
      MessagePlugin.error("项目不存在")
      return ;
    }
    //二次确认弹窗
    const confirm_dialog = DialogPlugin.confirm({
      header: '确认删除',
      body: `确定要删除接口文档「${row.project_name}」吗？`,
      confirmBtn: '删除',
      cancelBtn: '取消',
      theme: 'warning',
      onConfirm: () => {
        loading_row.value.add(project_id)
        request.post(API_URLS.project.delete, { project_id: project_id })
            .then((res) => {
              if (res.status === 200 && res.data.code === "000000") {
                MessagePlugin.success(`删除项目成功`);
                refresh_project_list();
              }
              else {
                MessagePlugin.error(`删除失败: ${res.data.message}`);
              }
            })
            .catch((e) => {
              MessagePlugin.error(`删除失败: ${e.response.data.message}`);
            })
            .finally(() => {
              loading_row.value.delete(project_id);
              confirm_dialog.destroy();
            });
      },
      onClose: () => {
        loading_row.value.delete(project_id);
        confirm_dialog.destroy();
      },
      onCancel: () => {
        loading_row.value.delete(project_id);
        confirm_dialog.destroy();
      }
    });
  }

  
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
    gap: 10px;
    padding: 0 20px;
  }

  .search-input{
    width: 15%;
  }

  :deep(.search-input .t-input) {
    border-radius: 12px;
    height: 40px;
  }

  .search-select{
    width: 12%;
  }
  .search-date-picker{
    width: 12%;
  }

  :deep(.t-input.t-is-readonly) {
    border-radius: 12px;
    height: 40px;
  }

  :deep(.status-filter .t-input) {
    border-radius: 12px;
    transition: all 0.25s ease;
    height: 40px;
  }

  /* 搜索、重置、新增项目按钮  */
  .search-button,
  .reset-search-button,
  .add_project_button {
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0 16px;
    height: 40px;
  }

  /* 项目表单样式 */
  .project-table-container{
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