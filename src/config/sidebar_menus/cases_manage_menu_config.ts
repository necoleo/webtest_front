// 默认菜单配置
import type {menu_item} from "@/config/sidebar_menus/index.ts";

export const cases_manage_menus: menu_item[] = [
    {
        key: 'functional-test',
        title: '功能测试',
        icon: 'check-rectangle',
        children: [
            {
                key: 'functional-test-pm',
                title: '项目管理',
                path: '/project',
            },
            {
                key: 'functional-test-cases',
                title: '测试用例',
                path: '/cases-manage',
            }
        ]
    },
    {
        key: 'api-test',
        title: '接口测试',
        icon: 'api',
        children: [
            {
                key: 'api-test-interface-documentation',
                title: '接口文档',
                path: '',
            },
            {
                key: 'api-test-cases',
                title: '接口测试用例',
                path: '',
            },
            {
                key: 'api-test-reports',
                title: '接口测试报告',
                path: '',
            }
        ]
    },
    {
        key: 'web-auto-test',
        title: 'web 自动化测试',
        icon: 'logo-chrome',
        children: [
            {
                key: 'web-auto-test-cases',
                title: '自动化用例管理',
                path: '',
            },
            {
                key: 'web-auto-test-scripts',
                title: '脚本库',
                path: '',
            },
            {
                key: 'web-auto-test-plans',
                title: '执行计划',
                path: '',
            },
            {
                key: 'web-auto-test-reports',
                title: '自动化测试报告',
                path: '',
            }
        ]
    },
    {
        key: 'app-auto-test',
        title: 'APP 自动化测试',
        icon: 'application',
        children: [
            {
                key: 'app-auto-test-equipment-pool',
                title: '设备池管理',
                path: '',
            },
            {
                key: 'app-auto-test-config',
                title: '自动化环境配置',
                path: '',
            },
            {
                key: 'app-auto-test-cases',
                title: 'App 自动化用例',
                path: '',
            },
            {
                key: 'app-auto-test-log',
                title: '执行日志',
                path: '',
            },
            {
                key: 'app-auto-test-reports',
                title: 'App 测试报告',
                path: '',
            },
        ]
    },
    {
        key: 'project-config',
        title: '项目配置',
        icon: 'dashboard',
        children: [
            {
                key: 'project-config-info',
                title: '项目信息设置',
                path: '',
            },
            {
                key: 'project-config-permissions',
                title: '权限设置',
                path: '',
            },
            {
                key: 'project-config-plans',
                title: '流程配置',
                path: '',
            },
            {
                key: 'project-config-SOC',
                title: '系统集成配置',
                path: '',
            },
        ]
    }
]
