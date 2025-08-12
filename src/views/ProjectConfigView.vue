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
                row-key="project_code"
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
              <template #cell:operation="{row}">
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
import {h, ref} from "vue";
import type {TableProps} from "tdesign-vue-next";
import axios from "axios";
import {API_URLS, BASE_URLS} from "@/api/urls.ts";

const request = axios.create({
    baseURL: BASE_URLS,
  })

  interface project_data {
    project_code: number;
    project_name: string;
    description: string;
    project_type: string;
    project_status: string;
    start_date: string;
    end_date: string;
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

  const stripe = ref(true);
  const bordered = ref(true);
  const hover = ref(false);
  const tableLayout = ref(false);
  const size = ref<TableProps['size']>('medium');
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
      colKey: 'operation',
      title: '操作',
      width: 120,
      cell: ({ row }: any) => {
        return h('div', { class: 'table-operation-buttons' }, [
          h('button', {
            class: 'edit_project_button t-button t-button--size-s t-button--variant-text',
            onClick: () => handleRowClick(row)
          }, '编辑'),
          h('button', {
            class: 'delete_project_button t-button t-button--size-s t-button--variant-text',
            onClick: () => handleRowClick(row)
          }, '删除')
        ])
      }
    },
  ]);

  const pagination = ref<TableProps['pagination']>({
    defaultCurrent: 1,
    defaultPageSize: 5,
    total: total.value,
  });

  request.get(API_URLS.projects.get_projects_list)
    .then((res) => {
      if (res.status === 200 && res.data.code === "success") {
        project_data.value = res.data.data.map((item: any) => {
          return {
            ...item,
            project_code: item.code,
            project_name: item.name,
            description: item.description,
            project_type: item.type,
            project_status: status_map[item.status],
            start_date: item.start_date,
            end_date: item.end_date,
          }
        });
        total.value = project_data.value.length;
        // 更新分页显示总数据
        // ts 要求处理可能出现的 undefined 问题
        if (pagination.value) {
          pagination.value.total = total.value;
        }
        console.log( project_data.value);
      }
    })

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

  .table-operation-buttons {
    display: flex;
    gap: 8px;
  }
</style>