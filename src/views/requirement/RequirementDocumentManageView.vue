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
              <h2> 需求文档管理 </h2>
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
            <span>需求文档管理 / 需求文档列表</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <form class="filter-actions-container"
                  @submit.prevent="handle_click_search_button"
            >
              <t-input
                  class="search-input"
                  v-model="search_requirement_document_id"
                  placeholder="输入需求文档id"
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
                  v-model="search_doc_name"
                  placeholder="输入需求文档名称"
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
                  v-model="search_project_id"
                  placeholder="输入所属项目id"
                  clearable
                  size="medium"
                  type="number"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-select
                  class="search-select"
                  v-model="search_parse_status"
                  :options="status_filter_options"
                  clearable
                  size="medium"
                  placeholder="全部状态"
              />
              <t-input
                  class="search-input"
                  v-model="search_version"
                  placeholder="输入版本"
                  clearable
                  size="medium"
                  type="search"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>
              <t-date-picker
                  class="search-date-picker"
                  v-model="search_created_at"
                  placeholder="创建时间"
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
                  class="add_requirement_document_button"
                  theme="primary"
                  variant="outline"
                  @click="show_upload_requirement_document_dialog=true"
              >
                上传需求文档
              </t-button>
            </form>

            <div class="requirement_document-table-container">
              <t-table
                  class="requirement_document-table"
                  row-key="requirement_document_id"
                  :data="requirement_document_data"
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
                <template #cos_access_url="{ row }">
                  <t-link theme="primary"
                          hover="color"
                          @click="handle_download_requirement_document(row)"
                          :disabled="!row.cos_access_url"
                  >
                    {{ row.doc_name }}
                  </t-link>
                </template>
                <template #parse_status_text="{ row }">
                  <t-tag :theme="get_status_theme(row.parse_status)">
                    {{ get_status_text(row.parse_status) }}
                  </t-tag>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        v-if="row.parse_status == 0 || row.parse_status == 3"
                        class="edit_requirement_document_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_document_id)"
                        @click="handle_parse_requirement_document(row)"
                    >
                      解析
                    </t-link>
                    <t-link
                        class="edit_requirement_document_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_document_id)"
                        @click="handle_update_requirement_document(row)"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_requirement_document_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.requirement_document_id)"
                        @click="handle_delete_requirement_document(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>
            </div>
            <upload-requirement-document-dialog
                v-model:visible="show_upload_requirement_document_dialog"
                @success="refresh_requirement_document_list"
            ></upload-requirement-document-dialog>
            <update-requirement-document-dialog
                v-model:visible="show_update_requirement_document_dialog"
                :requirement_document_data="updated_requirement_document_data"
                @success="refresh_requirement_document_list"
            ></update-requirement-document-dialog>
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
import { formatFileSize } from "@/utils/format_file_size";
import UploadRequirementDocumentDialog from "@/views/requirement/components/UploadRequirementDocumentDialog.vue";
import UpdateRequirementDocumentDialog from "@/views/requirement/components/UpdateRequirementDocumentDialog.vue";

interface requirement_document_data {
  requirement_document_id: number;
  doc_name: string;
  project_id: number;
  version: string;
  cos_access_url: string;
  file_size: string;
  comment: string;
  parse_status: number;
  requirement_count: number;
  created_user: string;
  created_at: string
}

// 需求文档状态map
const status_map: Record<number, string> = {
  0: '未解析',
  1: '解析中',
  2: '已解析',
  3: '解析失败'
}

// 状态主题映射
const get_status_theme = (status: number | null): string => {
  switch (status) {
    case 0: return "default";
    case 1: return "warning";
    case 2: return "success";
    case 3: return "danger";
    default: return "default";
  }
}

const get_status_text = (status: number | null): string => {
  if (status === null || status === undefined) {
    console.log(status);
    return "未知"
  }
  console.log(status);
  return status_map[status] || "未知"
}

// 需求文档列表初始化
const requirement_document_data = ref<requirement_document_data[]>([]);

// 搜索框-需求文档id
const search_requirement_document_id = ref<number | undefined>();

// 搜索框-需求文档名称
const search_doc_name = ref<string>("")

// 搜索框-所属项目id
const search_project_id = ref<number | undefined>();

// 搜索框-需求文档状态
const search_parse_status = ref<number | undefined>();

// 搜索框-版本
const search_version = ref<string>("");

// 搜索框-创建时间
const search_created_at = ref<string>("");

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 新建需求文档弹窗
const show_upload_requirement_document_dialog = ref<boolean>(false);

// 编辑需求文档弹窗
const show_update_requirement_document_dialog = ref<boolean>(false)
// 选中的需求文档
const updated_requirement_document_data = ref<requirement_document_data | null>(null)

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
// 需求文档状态选项
const status_filter_options = [
  {
    label: "未解析",
    value: 0
  },
  {
    label: "解析中",
    value: 1
  },
  {
    label: "已解析 ",
    value: 2
  },
  {
    label: "解析失败",
    value: 3
  }
]

const hover = ref(false);
const size = ref<TableProps['size']>('large');
const tableLayout = ref(false);
const showHeader = ref(true);

const columns = ref<TableProps['columns']>([
  {
    colKey: 'requirement_document_id',
    title: '需求文档id',
    ellipsis: true,
  },
  {
    colKey: 'doc_name',
    title: '需求文档名称',
    ellipsis: true,
  },
  {
    colKey: 'project_id',
    title: '所属项目',
    ellipsis: true,
  },
  {
    colKey: 'version',
    title: '版本',
    ellipsis: true,
  },
  {
    colKey: 'cos_access_url',
    title: '访问链接',
  },
  {
    colKey: 'file_size',
    title: '文件大小',
    ellipsis: true,
    cell: (_, { row }) => formatFileSize(row.file_size || 0)
  },
  {
    colKey: 'comment',
    title: '备注',
    ellipsis: true,
  },
  {
    colKey: 'parse_status_text',
    title: '解析状态',
  },
  {
    colKey: 'requirement_count',
    title: '需求项数量',
  },
  {
    colKey: 'created_user',
    title: '创建人'
  },
  {
    colKey: 'created_at',
    title: '创建时间'
  },
  {
    colKey: 'operation',
    title: '操作'
  }
]);

// 刷新需求文档列表
const refresh_requirement_document_list = async () => {
  request.get(API_URLS.requirements_document.list)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          requirement_document_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              requirement_document_id: item.id,
              doc_name: item.doc_name,
              project_id: item.project_id,
              version: item.version,
              cos_access_url: item.cos_access_url,
              file_size: item.file_size,
              comment: item.comment,
              parse_status: item.parse_status,
              parse_status_text: status_map[item.parse_status],
              requirement_count: item.requirement_count,
              created_user: item.created_user,
              created_at: item.created_at,
            }
          });
          total.value = requirement_document_data.value.length;
          // 更新分页显示总数据
          // ts 要求处理可能出现的 undefined 问题
          if (pagination.value) {
            pagination.value.total = total.value;
          }
        }
      })

}

refresh_requirement_document_list()

// 点击搜索按钮
const handle_click_search_button = () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 20,
  }
  if (search_requirement_document_id.value != undefined) {
    params.id = search_requirement_document_id.value;
  }
  if (search_doc_name.value != "") {
    params.doc_name = search_doc_name.value;
  }
  if (search_project_id.value != undefined) {
    params.project_id = search_project_id.value;
  }
  if (search_parse_status.value != undefined) {
    params.parse_status = search_parse_status.value;
  }
  if (search_version.value != "") {
    params.version = search_version.value;
  }
  if (search_created_at .value != "") {
    params.created_at = search_created_at.value;
  }

  request.get(API_URLS.requirements_document.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          requirement_document_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              requirement_document_id: item.id,
              doc_name: item.doc_name,
              project_id: item.project_id,
              version: item.version,
              cos_access_url: item.cos_access_url,
              file_size: item.file_size,
              comment: item.comment,
              parse_status: item.parse_status,
              parse_status_text: status_map[item.parse_status],
              requirement_count: item.requirement_count,
              created_user: item.created_user,
              created_at: item.created_at,
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
  search_requirement_document_id.value = undefined;
  search_doc_name.value = ""
  search_project_id.value = undefined
  search_parse_status.value = undefined;
  search_version.value = ""
  search_created_at.value = ""
  handle_click_search_button()
}

// 下载需求文档
const handle_download_requirement_document = (row: requirement_document_data) => {
  const url = row.cos_access_url;
  if (!url) {
    MessagePlugin.error("该需求文档暂无访问链接")
    return;
  }
  try{
    window.open(url, "_blank");
  } catch(error) {
    MessagePlugin.error("打开链接失败");
  }
}

// 解析需求文档
const handle_parse_requirement_document = (row: requirement_document_data) => {
  const requirement_document_id = row.requirement_document_id
  loading_row.value.add(requirement_document_id)
  if (!requirement_document_id) {
    MessagePlugin.error('未找到该id的需求文档');
    return;
  }
  request.post(API_URLS.requirements_document.parse, { requirement_document_id: requirement_document_id })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`成功提交解析任务`);
          refresh_requirement_document_list();
        }
        else {
          MessagePlugin.error(`提交解析失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`提交解析失败: ${e.response.data.message}`);
      })
      .finally(() => {
        loading_row.value.delete(requirement_document_id);
      });
}

// 点击编辑需求文档
const handle_update_requirement_document = (row: requirement_document_data) => {
  show_update_requirement_document_dialog.value = true
  console.log(row)
  updated_requirement_document_data.value = row
}


// 点击删除需求文档
const handle_delete_requirement_document = (row: requirement_document_data) => {
  const requirement_document_id = row.requirement_document_id;
  loading_row.value.add(requirement_document_id)
  if (!requirement_document_id){
    MessagePlugin.error("需求文档不存在")
    return ;
  }
  //二次确认弹窗
  const confirm_dialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除接口文档「${row.doc_name}」吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: () => {
      loading_row.value.add(requirement_document_id)
      request.post(API_URLS.requirements_document.delete, { requirement_document_id: requirement_document_id })
          .then((res) => {
            if (res.status === 200 && res.data.code === "000000") {
              MessagePlugin.success(`删除需求文档成功`);
              refresh_requirement_document_list();
            }
            else {
              MessagePlugin.error(`删除失败: ${res.data.message}`);
            }
          })
          .catch((e) => {
            MessagePlugin.error(`删除失败: ${e.response.data.message}`);
          })
          .finally(() => {
            loading_row.value.delete(requirement_document_id);
            confirm_dialog.destroy();
          });
    },
    onClose: () => {
      loading_row.value.delete(requirement_document_id);
      confirm_dialog.destroy();
    },
    onCancel: () => {
      loading_row.value.delete(requirement_document_id);
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

/* 搜索、重置、新增需求文档按钮  */
.search-button,
.reset-search-button,
.add_requirement_document_button {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 16px;
  height: 40px;
}

/* 需求文档表单样式 */
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