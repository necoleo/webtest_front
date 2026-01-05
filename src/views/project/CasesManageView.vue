<template>
  <div class="container">
    <t-layout class="cases-container">
      <!-- 侧边栏区域 -->
      <t-aside>
        <div class="sidebar-section">
          <Sidebar :menu_items="default_menu"/>
        </div>
      </t-aside>
      <t-layout>
        <t-content>
          <!-- 顶部导航栏 -->
          <t-header>
            <t-head-menu>
              <div class="header-menu">
                <h2>测试用例管理</h2>
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
          <div class="current_page_path">
            <span> 功能测试 / 测试用例</span>
          </div>
          <!-- 主要内容 -->
          <div class="main-content">
            <div class="filter-actions-container">
              <t-input
                  class="search-input"
                  v-model="search_key_word"
                  placeholder="输入测试用例编号"
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
                  v-model="search_key_word"
                  placeholder="输入测试用例标题"
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
                  class="add_project_button"
                  theme="primary"
                  variant="outline"
              >
                新增测试用例
              </t-button>

            </div>
            <div class="cases_table_container">
              <t-table
                  class="cases-table"
                  row-key="cases_code"
                  :data="cases_data"
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
                  @row-click="handleRowClick"
              >
                <template #requirement_document="{ row }">
                  <t-link theme="primary" hover="color" @click="handleDownloadRequirementDoc(row)"
                          :disabled="!row.requirement_document_url">
                    {{ row.requirement_document_name }}
                  </t-link>
                </template>
                <template #operation="{ row }">
                  <div class="table-operation-buttons">
                    <t-link
                        class="edit_cases_button"
                        theme="primary"
                        hover="color"
                    >
                      编辑
                    </t-link>
                    <t-link
                        class="delete_cases_button"
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
          </div>

        </t-content>
        <div class="footer-content">
          <t-footer> Heypon AI 测试</t-footer>
        </div>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
  import Sidebar from "@/components/Sidebar.vue";
  import {cases_manage_menus} from "@/config/sidebar_menus";
  import {ref} from "vue";
  import type {TableProps} from "tdesign-vue-next";
  // 总页数
  const total = ref(0);
  const pagination = ref<TableProps['pagination']>({
    defaultCurrent: 1,
    defaultPageSize: 5,
    total: total.value,
  });

  const columns = ref<TableProps['columns']>([
    {
      colKey: 'cases_code',
      title: '编号',
    },
    {
      colKey: 'cases_name',
      title: '测试用例标题',
    },
    {
      colKey: 'description',
      title: '测试用例描述',
    },
    {
      colKey: 'priority',
      title: '优先级',
    },
    {
      colKey: 'preconditions',
      title: '前置条件',
    },
    {
      colKey: 'case_steps',
      title: '操作步骤',
    },
    {
      colKey: 'expected_result',
      title: '预期结果',
    },
    {
      colKey: 'cases_status',
      title: '测试状态',
    },
    {
      colKey: 'operation',
      title: '操作',
      width: 120,
    },
  ]);
</script>

<style scoped>
  .cases-container{
    height: 100vh;
  }

  .sidebar-section{
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #f0f0f0;
  }

  :deep(.t-layout__sider){
    height: 100%;
    width: 300px;
    border-radius: 20px;
    margin-right: 20px;
  }

  :deep(.t-layout__content){
    border-radius: 20px;
    overflow: hidden;
  }

  :deep(.t-layout__header){
    border-radius: 20px;
    overflow: hidden;
    height: 60px;
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

  :deep(.t-layout__content){
    display: flex;
    flex-direction: column;
  }

  .main-content{
    display: flex;
    flex-direction: column;
    flex: 1;
    border-radius: 24px;
    overflow: hidden;
    margin-top: 10px;
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
  /* 测试用例表单样式 */
  .cases_table_container{
    display: flex;
    flex: 1;
  }

  :deep(.t-table__content){
    padding: 20px;
  }

  :deep(.t-table thead td, .t-table th){
    font-size: 16px;
  }


</style>