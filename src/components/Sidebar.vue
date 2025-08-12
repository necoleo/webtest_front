
<template>
  <div class="sidebar-container" >
    <!-- logo区域 -->
    <div class="logo-container">
      <img
          class="logo-img"
          src="@/assets/logo/logo.png"
          alt="Logo"
      />
    </div>
    <!-- 侧边栏内容 -->
    <div class="sidebar">
      <t-menu
          v-model:expanded="expanded"
          theme="light"
          default-value="1"
          expand-mutex
          :collapsed="collapsed"
      >
        <t-submenu value="functional-test">
          <template #icon>
            <t-icon name="check-rectangle" />
          </template>
          <template #title>
            <span>功能测试</span>
          </template>
          <t-menu-item value="functional-test-pm"> 项目管理 </t-menu-item>
          <t-menu-item value="functional-test-cases"> 测试用例 </t-menu-item>
        </t-submenu>
        <t-submenu value="api-test">
          <template #icon>
            <t-icon name="api" />
          </template>
          <template #title>
            <span>接口测试</span>
          </template>
          <t-menu-item value="api-test-interface-documentation"> 接口文档 </t-menu-item>
          <t-menu-item value="api-test-cases"> 接口测试用例 </t-menu-item>
          <t-menu-item value="api-test-reports"> 接口测试报告 </t-menu-item>
        </t-submenu>
        <t-submenu value="web-auto-test">
          <template #icon>
            <t-icon name="logo-chrome" />
          </template>
          <template #title>
            <span> web 自动化测试</span>
          </template>
          <t-menu-item value="web-auto-test-cases"> 自动化用例管理 </t-menu-item>
          <t-menu-item value="web-auto-test-scripts"> 脚本库 </t-menu-item>
          <t-menu-item value="web-auto-test-plans"> 执行计划 </t-menu-item>
          <t-menu-item value="web-auto-test-reports"> 自动化测试报告 </t-menu-item>
        </t-submenu>
        <t-submenu value="app-auto-test">
          <template #icon>
            <t-icon name="application" />
          </template>
          <template #title>
            <span> APP 自动化测试</span>
          </template>
          <t-menu-item value="app-auto-test-equipment-pool"> 设备池管理 </t-menu-item>
          <t-menu-item value="app-auto-test-config"> 自动化环境配置 </t-menu-item>
          <t-menu-item value="app-auto-test-cases"> App 自动化用例 </t-menu-item>
          <t-menu-item value="app-auto-test-log"> 执行日志 </t-menu-item>
          <t-menu-item value="app-auto-test-reports"> App 测试报告 </t-menu-item>
        </t-submenu>
        <t-submenu value="project-config">
          <template #icon>
            <t-icon name="dashboard"/>
          </template>
          <template #title>
            项目配置
          </template>
          <t-menu-item value="project-config-info"> 项目信息设置 </t-menu-item>
          <t-menu-item value="project-config-permissions"> 权限设置 </t-menu-item>
          <t-menu-item value="project-config-plans"> 流程配置 </t-menu-item>
          <t-menu-item value="project-config-SOC"> 系统集成配置 </t-menu-item>
        </t-submenu>
      </t-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const collapsed = ref(false);

// 初始展开
const expanded = ref(['functional-test']);
</script>


<style scoped>
  .sidebar-container {
    position: relative;
    flex-direction: column;
    display: flex;
    border-radius: 20px;
    height: 100%;
    background: linear-gradient(135deg, #7db2c5 0%, #62bfd4 100%);
    overflow: hidden;
  }

  :deep(.t-default-menu__inner .t-menu--scroll) {
    background: linear-gradient(135deg, #7db2c5 0%, #62bfd4 100%);
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: 20px;
    padding: 30px 0;

  }

  .logo-img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter:  blur(10px);
    padding: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
  }

  /* logo 动态效果 */
  .logo-img:hover {
    transform: scale(1.05);
  }

  :deep(.t-menu__content) {
    color: white;
  }
  :deep(.t-default-menu .t-menu__item .t-fake-arrow) {
    color: white;
  }

  :deep(.t-default-menu .t-menu__item .t-icon) {
    color: white;
  }

  :deep(.t-default-menu .t-menu__item.t-is-active:not(.t-is-opened)) {
    background-color: #90cfe6;
  }
</style>