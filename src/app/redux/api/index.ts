
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './../utils'

// Define a service using a base URL and expected endpoints
const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['POST'],
  endpoints: () => ({})
})

export default api
