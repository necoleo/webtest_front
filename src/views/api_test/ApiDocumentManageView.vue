<template>
  <div class="container">
    <t-layout class="api-document-container">
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
              <h2>接口管理</h2>
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
            <span> 接口测试 / 接口管理</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <!-- 筛选栏 -->
            <div class="filter-actions-container">
              <t-input
                  class="search-input"
                  v-model="search_api_document_id"
                  placeholder="输入接口文档编号"
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
                  v-model="search_api_document_title"
                  placeholder="输入接口文档标题"
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
                  placeholder="输入接口所属项目"
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
                  v-model="search_version"
                  placeholder="输入接口版本"
                  clearable
                  size="medium"
                  type="search"
              >
                <template #prefix-icon>
                  <t-icon name="search"/>
                </template>
              </t-input>

              <t-button
                  class="search-button"
                  type="primary"
                  variant="outline"
                  @click="handle_click_search_button"
              >
                搜索
              </t-button>
              <t-button
                  class="reset-search-button"
                  type="primary"
                  variant="outline"
                  @click="handle_click_reset_button"
              >
                重置
              </t-button>
              <t-button
                  class="add_project_button"
                  theme="primary"
                  variant="outline"
                  @click="show_upload_dialog = true"
              >
                新增接口文档
              </t-button>

            </div>
            <div class="api_document_table_container">
              <t-table
                  class="api-document-table"
                  row-key="api_document_id"
                  :data="api_document_data"
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
                          @click="handle_download_api_document(row)"
                          :disabled="!row.cos_access_url"
                  >
                    {{ row.api_document_title }}
                  </t-link>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        v-if="!row.is_parsed"
                        class="edit_api_document_button"
                        theme="primary"
                        hover="color"
                        @click="handle_parse_api_document(row)"
                    >
                      解析
                    </t-link>
                    <t-link
                        class="edit_api_document_button"
                        theme="primary"
                        hover="color"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_api_document_button"
                        theme="primary"
                        hover="color"
                        :disabled="loading_row.has(row.api_document_id)"
                        @click="handle_delete_api_document(row)"
                    >
                      删除
                    </t-link>
                  </div>
                </template>
              </t-table>

            </div>
            <upload-api-document-dialog
                v-model:visible="show_upload_dialog"
                @success="refresh_api_document_list"
            ></upload-api-document-dialog>
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
import {request} from "@/api/urls.ts";
import {MessagePlugin, type TableProps} from "tdesign-vue-next";
import {API_URLS} from "@/api/urls.ts";
import {ref} from "vue";
import UploadApiDocumentDialog from "@/views/api_test/components/UploadApiDocumentDialog.vue";

// 接口文档参数
interface api_document_data {
  api_document_id: number;
  project_id: number;
  api_document_title: string;
  version: string;
  cos_access_url: string;
  file_size: number;
  comment: string;
  is_parsed: boolean;
  created_user: string;
  created_at: string;
  updated_at: string;
}

// 接口文档列表初始化
const api_document_data = ref<api_document_data[]>([])

// 搜索框-接口文档id
const search_api_document_id = ref<number | undefined>();
// 搜索框-接口文档标题
const search_api_document_title = ref("");
// 搜索框-所属项目id
const search_project_id = ref<number | undefined>();
// 搜索框-版本
const search_version = ref<string>("");

// hover 效果
const hover = ref<boolean>(true);
// 表格布局
const tableLayout = ref<string>("auto")
// 布局大小
const size = ref<string>("medium")
// 显示表头
const showHeader = ref<boolean>(true)

// 总页数
const total = ref(0);
const pagination = ref<TableProps['pagination']>({
  current: 1,
  pageSize: 10,
  total: total.value,
  onChange: (pageInfo) => {
    pagination.value!.current = pageInfo.current;
    pagination.value!.pageSize = pageInfo.pageSize;
  }
});

// 存储正在操作的行 id
const loading_row = ref<Set<number>>(new Set());

// 上传接口文档的弹窗
const show_upload_dialog = ref<boolean>(false)

// 列表行
const columns = ref<TableProps['columns']>([
  {
    colKey: 'api_document_id',
    title: '编号',
  },
  {
    colKey: 'api_document_title',
    title: '接口文档名称',
  },
  {
    colKey: 'project_id',
    title: '所属项目',
  },
  {
    colKey: 'version',
    title: '版本号',
  },
  {
    colKey: 'created_user',
    title: '创建人',
  },
  {
    colKey: 'created_at',
    title: '创建时间',
  },
  {
    colKey: 'updated_at',
    title: '更新时间',
  },
  {
    colKey: 'cos_access_url',
    title: '访问地址',
  },
  {
    colKey: 'operation',
    title: '操作',
  },
]);

// 处理重置按钮
const handle_click_reset_button = () => {
  search_api_document_id.value = undefined;
  search_api_document_title.value = "";
  search_project_id.value = undefined;
  search_version.value = "";
}

// 刷新接口文档列表
const refresh_api_document_list = async () => {
  request.get(API_URLS.api_document.list)
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          api_document_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              api_document_id: item.id,
              project_id: item.project_id,
              api_document_title: item.doc_name,
              version: item.version,
              cos_access_url: item.cos_access_url,
              file_size: item.file_size,
              comment: item.comment,
              is_parsed: item.is_parsed,
              created_user: item.created_user,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }
          });
          total.value = res.data.data.total_count;
          // 更新分页显示总数据
          // ts 要求处理可能出现的 undefined 问题
          if (pagination.value) {
            pagination.value.total = total.value;
          }
          console.log(api_document_data.value)
        }
      })
}

// 进来先刷新列表
refresh_api_document_list()

// 搜索接口文档
const handle_click_search_button = () => {
  const params: any = {
    page: pagination.value?.current || 1,
    page_size: pagination.value?.pageSize || 10,
  }

  if (search_api_document_id.value != undefined) {
    params.id = search_api_document_id.value;
  }
  if (search_project_id.value != undefined) {
    params.project_id = search_project_id.value;
  }
  if (search_api_document_title.value != "") {
    params.doc_name = search_api_document_title.value;
  }
  if (search_version.value != "") {
    params.version = search_version.value
  }
  request.get(API_URLS.api_document.list, { params })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          api_document_data.value = res.data.data.results.map((item: any) => {
            return {
              ...item,
              api_document_id: item.id,
              project_id: item.project_id,
              api_document_title: item.doc_name,
              version: item.version,
              cos_access_url: item.cos_access_url,
              file_size: item.file_size,
              comment: item.comment,
              created_user: item.created_user,
              created_at: item.created_at,
              updated_at: item.updated_at,
            }
          });
          total.value = res.data.data.total_count;
          // 更新分页显示总数据
          // ts 要求处理可能出现的 undefined 问题
          if (pagination.value) {
            pagination.value.total = total.value;
          }
          console.log(api_document_data.value)
        }
      })
}

// 下载接口文档
const handle_download_api_document = (row: api_document_data) => {
  const url = row.cos_access_url;
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

// 解析接口文档
const handle_parse_api_document = (row: api_document_data) => {
  const api_document_id = row.api_document_id
  loading_row.value.add(api_document_id)
  if (!api_document_id) {
    MessagePlugin.error('未找到该id的接口文档');
    return;
  }
  request.post(API_URLS.api_document.parse, { api_document_id: api_document_id })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
        MessagePlugin.success(`成功导入 ${res.data.data.count} 个接口`);
        refresh_api_document_list();
      }
      else {
        MessagePlugin.error(`解析失败: ${res.data.message}`);
      }
    })
      .catch((e) => {
        MessagePlugin.error(`解析失败: ${e.response.data.message}`);
      })
      .finally(() => {
        loading_row.value.delete(api_document_id);
      });
}

// 删除接口文档
const handle_delete_api_document = (row: api_document_data) => {
  const api_document_id = row.api_document_id
  loading_row.value.add(api_document_id)
  if (!api_document_id) {
    MessagePlugin.error('未找到该id的接口文档');
    return ;
  }
  request.post(API_URLS.api_document.delete, { api_document_id: api_document_id })
      .then((res) => {
        if (res.status === 200 && res.data.code === "000000") {
          MessagePlugin.success(`删除接口文档`);
          refresh_api_document_list();
        }
        else {
          MessagePlugin.error(`删除失败: ${res.data.message}`);
        }
      })
      .catch((e) => {
        MessagePlugin.error(`删除失败: ${e.response.data.message}`);
      })
      .finally(() => {
        loading_row.value.delete(api_document_id);
      });
}



</script>

<style scoped>
.api-document-container{
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