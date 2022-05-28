
export const API_HOST = 'http://localhost:8000'
export const POSTS = (): string => `${API_HOST}/posts/`
export const LOGIN = (): string => `${API_HOST}/auth/login/`
export const REFRESH = (): string => `${API_HOST}/auth/refresh/`
