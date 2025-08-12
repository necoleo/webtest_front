/**
 * 解析 cookie
 */


export const getCookieFromHttpHeaders = (
    cookies: string | string[] | undefined,
    key: string
): string => {
    if (!cookies){
        return '';
    }
    // cookies转化为数组，方便处理
    const cookiesList = Array.isArray(cookies) ? cookies : [cookies];

    // 获取对应 key 的值
    for (const cookie of cookiesList) {
        // 根据 ; 分割
        const parts = cookie.split(';').map(item => item.trim());
        for (const part of parts) {
            const [cookieKey, cookieValue] = part.split('=');
            if (cookieKey === key) {
                return cookieValue;
            }
        }
    }
    return '';
}