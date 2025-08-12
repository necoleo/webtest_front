<template>
  <div class="container">
    <t-layout class="project-container">
      <t-aside>
        <div class="sidebar-content">
          <!-- 引入侧边栏 -->
          <Sidebar />
        </div>
      </t-aside>
      <t-layout>
        <t-content>

          <div class="main-content">
            <div class="table-header">
              <h2> 项目列表 </h2>
              <t-button
                  class="add_project_button"
                  theme="primary"
                  variant="outline"
              >
                新增项目
              </t-button>
            </div>
            <!-- 项目配置 -->
            <t-table
                class="project-table"
                row-key="index"
                :data="project_data"
                :columns="columns"
                :stripe="stripe"
                :bordered="bordered"
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
              <template #cell:operation="row">
                <div class="table-operation-buttons">
                  <t-button
                      class="edit_project_button"
                      size="small"
                      variant="text"
                      @click="handleRowClick(row)"
                  >
                    编辑
                  </t-button>
                  <t-button
                      class="delete_project_button"
                      size="small"
                      variant="text"
                      @click="handleRowClick(row)"
                  >
                    删除
                  </t-button>
                </div>
              </template>
            </t-table>
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
  import {ref} from "vue";
  import type {TableProps} from "tdesign-vue-next";

  const project_data = ref([]);
  const stripe = ref(true);
  const bordered = ref(true);
  const hover = ref(false);
  const tableLayout = ref(false);
  const size = ref<TableProps['size']>('medium');
  const showHeader = ref(true);
  const total = 28;
  const columns = ref<TableProps['columns']>([
    {
      colKey: 'project_id',
      title: '项目编号',
      width: '100',
    },
    {
      colKey: 'project_name',
      title: '项目名称',
      width: '100',
    },
    {
      colKey: 'project_cvm',
      title: '所属服务器',
    },
    {
      colKey: 'project_create_time',
      title: '项目创建时间',
      ellipsis: true,
    },
    {
      colKey: 'project_comment',
      title: '备注',
    },
    {
      colKey: 'operation', // 仅保留列定义，不写cell配置（用插槽替代）
      title: '操作',
      width: 120,
      foot: '-',
      // 如需固定到右侧，直接写死或定义fixedRightColumn变量
      fixed: 'right', // 简化：直接固定到右侧，或改为 fixedRightColumn ? 'right' : undefined（需先定义fixedRightColumn）
    },
  ]);
  const pagination: TableProps['pagination'] = {
    defaultCurrent: 1,
    defaultPageSize: 5,
    total,
  };
  const handleRowClick: TableProps['onRowClick'] = (e) => {
    console.log(e);
  };
</script>

<style scoped>
  .project-container {
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
    min-height: 796px;
    overflow: hidden;
  }

  .sidebar-content {
    flex: 1;
    height: 100%;
  }

  :deep(.t-layout__sider) {
    width: 232px;
    min-width: 232px;
    margin: 20px;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .main-content {
    border-radius: 20px;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    padding: 20px;
    background-color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(119, 182, 202, 0.2);
  }

  .table-header h2 {
    margin: 0;
    color: #3a8c9e;
    font-weight: 600;
  }

  .t-layout__content{
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  .main-content {
    border-radius: 20px;
    width: 100%;
    overflow: hidden;
  }


</style>