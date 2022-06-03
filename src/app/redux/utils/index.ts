import * as ROUTES from './../api/routes'
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { logoutAction, refreshTokenAsyncThunk } from '../../../features/login/sessionSlice'
import { Mutex } from 'async-mutex'
// create a new mutex
const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: ROUTES.API_HOST,
  prepareHeaders: (headers, { getState }) => {
    // @ts-ignore
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
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock()

  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        // @ts-ignore: TODO: Type of api.getState()
        await api.dispatch(refreshTokenAsyncThunk({ refresh_token: api.getState().session?.data?.refresh_token })).unwrap()
        // Since we use 'unwrap', if 'refreshTokenAsyncThunk' doesnt throw an error, means we hace refreshed the token correctly.
        // So we can repeat the original request again
        result = await baseQuery(args, api, extraOptions)
      }
      catch (err) {
        console.log('Refresh token is expired too')
      }
      finally {
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
