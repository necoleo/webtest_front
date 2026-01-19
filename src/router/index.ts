import { createRouter, createWebHistory } from 'vue-router';
import HomeView from "@/views/HomeView.vue";
import RegisterView from "@/views/user/RegisterView.vue";
import CasesManageView from "@/views/project/CasesManageView.vue";
import ProjectDemoView from "@/views/project/ProjectManageView.vue";
import LoginView from "@/views/user/LoginView.vue";
import ApiDocumentManageView from "@/views/api_test/ApiDocumentManageView.vue";

// 接口测试相关页面
import ApiTestCaseManageView from "@/views/api_test/ApiTestCaseManageView.vue";
import ApiTestCaseDetailView from "@/views/api_test/ApiTestCaseDetailView.vue";
import EnvironmentConfigView from "@/views/api_test/EnvironmentConfigView.vue";
import ExecutionHistoryView from "@/views/api_test/ExecutionHistoryView.vue";
import ExecutionDetailView from "@/views/api_test/ExecutionDetailView.vue";
import TestReportView from "@/views/api_test/TestReportView.vue";
import ScheduledTaskView from "@/views/api_test/ScheduledTaskView.vue";



// 1. 定义路由规则（每个路由对应一个组件）
const routes = [
    {
        path: '/home', // 首页路径
        name: 'Home',
        component: HomeView
    },
    {
        path: '/login', // 登录页面路径
        name: 'Login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView
    },
    {
        path: '/project',
        name: 'Project',
        component: ProjectDemoView
    },
    {
        path: '/cases-manage',
        name: 'CasesManage',
        component: CasesManageView
    },
    {
        path: '/api-document',
        name: 'ApiDocument',
        component: ApiDocumentManageView
    },
    // 接口测试用例管理
    {
        path: '/api-test-case',
        name: 'ApiTestCase',
        component: ApiTestCaseManageView
    },
    // 接口测试用例详情
    {
        path: '/api-test-case/detail/:id',
        name: 'ApiTestCaseDetail',
        component: ApiTestCaseDetailView
    },
    // 环境配置管理
    {
        path: '/api-test-environment',
        name: 'ApiTestEnvironment',
        component: EnvironmentConfigView
    },
    // 执行历史列表
    {
        path: '/api-test-execution',
        name: 'ApiTestExecution',
        component: ExecutionHistoryView
    },
    // 执行详情
    {
        path: '/api-test-execution/detail/:id',
        name: 'ApiTestExecutionDetail',
        component: ExecutionDetailView
    },
    // 测试报告
    {
        path: '/api-test-report',
        name: 'ApiTestReport',
        component: TestReportView
    },
    // 定时任务管理
    {
        path: '/api-test-schedule',
        name: 'ApiTestSchedule',
        component: ScheduledTaskView
    }
];

// 2. 创建路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 History 模式（无 # 号）
    routes // 注入路由规则
});

export default router;
