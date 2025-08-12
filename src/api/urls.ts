interface ApiUrls{
    users: {
        user_login: string;
        user_register: string;
    }
}

export const API_URLS: ApiUrls = {
    users: {
        user_login: '/api/user/login',
        user_register: '/api/user/register',
    }
}

export const BASE_URLS = "http://localhost:8000";