import axios from "axios";
import {MessagePlugin} from "tdesign-vue-next";
import router from "@/router";

interface ApiUrls{
    users: {
        user_login: string;
        user_register: string;
    },
    project: {
        list: string;
        delete: string;
        update: string;
        create: string;
    },
    requirements_document: {
        upload: string;
    },
    api_document: {
        upload: string;
        list: string;
        delete: string;
        parse: string;
        update: string;
    },
    api_test_case: {
        upload: string;
        list: string;
        detail: string;
        yaml: string;
        delete: string;
    },
    api_test_environment: {
        create: string;
        list: string;
        update: string;
        delete: string;
    },
    api_test_execution: {
        execute: string;
        status: string;
        history: string;
        detail: string;
    },
    api_test_schedule: {
        create: string;
        list: string;
        update: string;
        toggle: string;
        delete: string;
        trigger: string;
    }
}

export const API_URLS: ApiUrls = {
    users: {
        user_login: 'api/user/login/',
        user_register: 'api/user/register',
    },
    project: {
        create: 'api/project/create/',
        update: 'api/project/update/',
        delete: 'api/project/delete/',
        list:   'api/project/list/',
    },
    requirements_document: {
        upload: 'api/requirements_document/upload',
    },
    api_document: {
        upload: 'api/api_document/upload/',
        list: 'api/api_document/list/',
        delete: 'api/api_document/delete/',
        parse: 'api/api_document/parse/',
        update: 'api/api_document/update/',
    },
    api_test_case: {
        upload: 'api/api_test_case/upload/',
        list: 'api/api_test_case/list/',
        detail: 'api/api_test_case/detail/',
        yaml: 'api/api_test_case/yaml/',
        delete: 'api/api_test_case/delete/',
    },
    api_test_environment: {
        create: 'api/api_test_environment/create/',
        list: 'api/api_test_environment/list/',
        update: 'api/api_test_environment/update/',
        delete: 'api/api_test_environment/delete/',
    },
    api_test_execution: {
        execute: 'api/api_test_execution/execute/',
        status: 'api/api_test_execution/status/',
        history: 'api/api_test_execution/history/',
        detail: 'api/api_test_execution/detail/',
    },
    api_test_schedule: {
        create: 'api/api_test_schedule/create/',
        list: 'api/api_test_schedule/list/',
        update: 'api/api_test_schedule/update/',
        toggle: 'api/api_test_schedule/toggle/',
        delete: 'api/api_test_schedule/delete/',
        trigger: 'api/api_test_schedule/trigger/',
    }
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
