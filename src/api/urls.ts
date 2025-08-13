import axios from "axios";
import {MessagePlugin} from "tdesign-vue-next";
import router from "@/router";

interface ApiUrls{
    users: {
        user_login: string;
        user_register: string;
    },
    projects: {
        get_projects_list: string;
        delete_project: string;
    }
}

export const API_URLS: ApiUrls = {
    users: {
        user_login: '/api/user/login',
        user_register: '/api/user/register',
    },
    projects: {
        get_projects_list: 'api/project/show',
        delete_project: 'api/project/delete',
    },
}

export const BASE_URLS = "http://localhost:8000";

export const request = axios.create({
    baseURL: BASE_URLS,
    withCredentials: true, // 添加这行，确保发送 cookies
})

request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            MessagePlugin.error("未登录")
            router.push({
                name: "Login",
                query: {
                    redirect: router.currentRoute.value.fullPath
                }
            });
        }
        return Promise.reject(error);
    }
)