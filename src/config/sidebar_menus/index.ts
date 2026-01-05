// 菜单项
export interface menu_item {
    key: string
    title: string
    icon?: string
    path?: string
    disabled?: boolean
    children?: menu_item[]
}


// 导出测试用例管理页面的菜单配置
export { default_menu } from './default_menu_config.ts'
export { cases_manage_menus } from './cases_manage_menu_config.ts'
export { api_test_manage_menus } from './api_test_menu_config.ts'