
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './../utils'

export const POST_TAG = 'Post'

// Define a service using a base URL and expected endpoints
const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [POST_TAG],
  endpoints: () => ({})
})

export default api
