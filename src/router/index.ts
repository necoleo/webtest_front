import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from "@/views/RegisterView.vue";
import HomeView from "@/views/HomeView.vue";
import ProjectManageView from "@/views/ProjectManageView.vue";
import LoginView from "@/views/LoginView.vue";

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
        component: ProjectManageView
    }
];

// 2. 创建路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 History 模式（无 # 号）
    routes // 注入路由规则
});

export default router;