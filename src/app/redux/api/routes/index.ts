
export const API_HOST = 'http://localhost:8000'
export const LOGIN = (): string => `${API_HOST}/auth/login`
export const REFRESH = (): string => `${API_HOST}/auth/refresh`

export const POSTS = (): string => `${API_HOST}/posts`
export const POST = (id: number): string => `${POSTS()}/${id}`

export const PERSONS = (): string => `${API_HOST}/persons`
export const PERSON = (id: number): string => `${PERSONS()}/${id}`
export const PERSON_PETS = (id: number): string => `${PERSON(id)}/pets`
