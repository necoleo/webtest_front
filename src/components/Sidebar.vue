<template>
  <div class="sidebar-container">
    <!-- 侧边栏标题 -->
    <div class="sidebar-header">
      <t-icon name="grid-view" size="large"></t-icon>
      <h2>测试管理系统</h2>
    </div>

    <div class="sidebar-menu">
      <t-menu
          v-model:value="active_menu"
          v-model:expanded="expanded_menus"
          theme="light"
          :collapsed="collapsed"
          width="100%"
          @change="handle_menu_click"
      >
        <template
          v-for="menu_item in menu_items"
          :key="menu_item.key"
        >
          <!-- 有子菜单 -->
          <t-submenu
              v-if="menu_item.children && menu_item.children.length > 0"
              :value="menu_item.key"
              :disabled="menu_item.disabled"
          >
            <template #icon>
              <t-icon :name="menu_item.icon"/>
            </template>
            <template #title>
              <span>{{ menu_item.title }}</span>
            </template>

            <!-- 选项 -->
            <t-menu-item
                v-for="child in menu_item.children"
                :key="child.key"
                :value="child.key"
            >
              {{ child.title }}
            </t-menu-item>
          </t-submenu>

          <!-- 没有子菜单的选项 -->
          <t-menu-item
              v-else
              :value="menu_item.key"
              :disabled="menu_item.disabled"
          >
            <template #icon>
              <t-icon :name="menu_item.icon"/>
            </template>
          </t-menu-item>
        </template>
      </t-menu>
    </div>

  </div>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import {type menu_item} from "@/config/sidebar_menus";
  import {useRoute, useRouter} from "vue-router";
  const collapsed = ref(false);
  const active_menu = ref<string>('')
  // 初始展开
  const expanded_menus = ref(['functional-test']);
  const router = useRouter()
  const current_route = useRoute()

  // 接收页面输入数据
  const props = defineProps<{
    menu_items: menu_item[]
  }>()

  // 递归查找菜单项
  const find_menu_item = (target_key: string, items: menu_item[]): menu_item | null => {
    for (const item of items) {
      if (item.key === target_key){
        return item
      }
      if (item.children){
        const children_menus = find_menu_item(target_key, item.children)
        if (children_menus){
          return children_menus
        }
      }
    }
    return null
  }

  // 根据 path 找到当前的菜单项（支持子路由匹配）
  const find_menu_item_by_path = (path: string, items: menu_item[]): menu_item | null => {
    let best_match: menu_item | null = null
    let best_match_length = 0

    const search = (items: menu_item[]) => {
      for (const item of items) {
        // 精确匹配或前缀匹配（当前路径以菜单路径开头）
        if (item.path && (path === item.path || path.startsWith(item.path + '/'))) {
          // 选择匹配长度最长的（最精确的匹配）
          if (item.path.length > best_match_length) {
            best_match = item
            best_match_length = item.path.length
          }
        }
        if (item.children) {
          search(item.children)
        }
      }
    }

    search(items)
    return best_match
  }

  // 根据当前子菜单找到其对应的父菜单
  const find_menu_item_parent = (current_item: string, items: menu_item[]): string | null => {
    for (const item of items){
      if (item.children){
        for (const child of item.children){
          if (child.key === current_item){
            return item.key
          }
        }
      }
    }
    return null;
  }

  // 根据当前路由设置激活菜单
  if (current_route.path){
    const current_active_menu = find_menu_item_by_path(current_route.path, props.menu_items)?.key
    if (current_active_menu) {
      active_menu.value = current_active_menu
      const parent_key =  find_menu_item_parent(active_menu.value, props.menu_items)
      if (parent_key){
        expanded_menus.value = [parent_key]
      }
    }
  }

  const handle_menu_click = (value: string) => {
    const menu_item = find_menu_item(value, props.menu_items)
    if (menu_item?.path){
      router.push(menu_item.path)
    }
  }
</script>

<style scoped>
  .sidebar-container{
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    height: 100%;
    width: 300px;
    overflow: hidden;
    background-color: #ffffff;
  }

 .sidebar-header{
   display: flex;
   justify-content: left;
   align-items: center;
   padding: 5% 10% 5% 10%;
   height: 80px;
   flex-shrink: 0;
   background-color: #ffffff;
 }

  .sidebar-header h2 {
    font-size: 24px;
    padding-left: 10px;
  }

  /* 菜单样式 */
  .sidebar-menu{
    flex: 1;
    overflow-y: auto;
  }

  :deep(.t-submenu),
  :deep(.t-menu-item){
    border-radius: 6px;
    overflow: hidden;
  }

  :deep(.t-menu__content){
    font-size: 18px;
    line-height: 40px;
    height: 40px;
    padding: 0 16px;
  }

  :deep(.t-default-menu .t-menu__item){
    height: 60px;
  }
  :deep(.t-default-menu .t-menu__item.t-is-active:not(.t-is-opened)) {
    background-color: #E6F4FF;
  }

  :deep(.t-default-menu .t-menu__sub){
    background-color: #FAFAFA;
  }

  :deep(.t-default-menu > .t-submenu.t-is-opened) {
    height: auto;
  }


</style>