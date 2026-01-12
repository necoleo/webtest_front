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