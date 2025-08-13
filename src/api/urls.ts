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