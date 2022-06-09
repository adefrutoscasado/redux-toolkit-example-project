import * as ROUTES from './../api/routes'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import apiSlice from './../../redux/api'
import { logoutAction, refreshTokenAsyncThunk } from '../../../features/login/sessionSlice'
import { Mutex } from 'async-mutex'
// create a new mutex
const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: ROUTES.API_HOST,
  prepareHeaders: (headers, api) => {
    const getState = api.getState as () => RootState
    const accessToken = getState().session?.data?.access_token
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return headers
  },
})

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const getState = api.getState as () => RootState
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock()

  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refresh_token = getState().session?.data?.refresh_token
        if (refresh_token) {
          await api.dispatch(refreshTokenAsyncThunk({ refresh_token }))
          result = await baseQuery(args, api, extraOptions)
        }
        else {
          throw new Error('Refresh token not found')
        }
      }
      catch {
        // If refresh token not found logout
        api.dispatch(logoutAction())
      }
      finally {
        // Clean redux toolkit api cache on logout
        api.dispatch(apiSlice.util.resetApiState())
        // release must be called once the mutex should be released again.
        release()
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}
