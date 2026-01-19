// 默认菜单配置
import type {menu_item} from "@/config/sidebar_menus/index.ts";

export const default_menu: menu_item[] = [
    {
        key: 'project-management',
        title: '项目管理',
        icon: 'folder',
        children: [
            {
                key: 'project-list',
                title: '项目列表',
                path: '/project',
            }
        ]
    },
    {
        key: 'requirement-management',
        title: '需求文档管理',
        icon: 'document',
        children: [
            {
                key: 'requirement-doc-list',
                title: '需求文档列表',
                path: '/requirements/documents',
            },
            {
                key: 'requirement-list',
                title: '需求项管理',
                path: '',
            },
            {
                key: 'requirement-relations',
                title: '需求关联分析',
                path: '',
            }
        ]
    },
    {
        key: 'api-test',
        title: '接口测试',
        icon: 'api',
        children: [
            {
                key: 'api-test-management',
                title: '接口管理',
                path: '/api-document',
            },
            {
                key: 'api-test-cases',
                title: '接口用例',
                path: '/api-test-case',
            },
            {
                key: 'api-test-environment',
                title: '环境配置',
                path: '/api-test-environment',
            },
            {
                key: 'api-test-execution',
                title: '执行历史',
                path: '/api-test-execution',
            },
            {
                key: 'api-test-reports',
                title: '测试报告',
                path: '/api-test-report',
            },
            {
                key: 'api-test-schedule',
                title: '定时任务',
                path: '/api-test-schedule',
            }
        ]
    },
    {
        key: 'test-case-management',
        title: '测试用例管理',
        icon: 'check-rectangle',
        children: [
            {
                key: 'test-case-list',
                title: '测试用例列表',
                path: '/cases-manage',
            },
            {
                key: 'ai-generate-cases',
                title: 'AI生成测试用例',
                path: '',
            },
            {
                key: 'case-requirement-link',
                title: '用例关联需求',
                path: '',
            },
            {
                key: 'case-api-link',
                title: '用例关联接口',
                path: '',
            }
        ]
    },
    {
        key: 'system-settings',
        title: '系统设置',
        icon: 'setting',
        children: [
            {
                key: 'project-config',
                title: '项目配置',
                path: '',
            },
            {
                key: 'permission-config',
                title: '权限设置',
                path: '',
            }
        ]
    }
]