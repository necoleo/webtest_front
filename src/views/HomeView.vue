
<template>
  <div class="container">
    <t-layout class="home-container">
      <t-aside>
        <div class="sidebar-content">
          <!-- 引入侧边栏 -->
          <Sidebar />
        </div>
      </t-aside>
      <t-layout>
        <t-content>
          <div class="main-content">
            <!--  -->
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
</script>

<style scoped>
  .home-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    min-height: 796px;
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
  }

  .sidebar-content {
    height: 100vh;
  }

  :deep(.t-layout__sider) {
    overflow: hidden;
    border-radius: 20px;
  }
</style>