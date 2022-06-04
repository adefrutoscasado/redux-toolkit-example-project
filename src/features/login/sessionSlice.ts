import {
  createSlice,
  createAsyncThunk,
  isAsyncThunkAction,
  isPending,
  isRejected,
  isFulfilled,
  createAction,
  isAnyOf
} from '@reduxjs/toolkit'
import axios from 'axios'
import * as ROUTES from '../../app/redux/api/routes'
import type { RootState } from '../../app/redux/store'

type loginResponse = {
  access_token: string,
  refresh_token: string,
  user: {
    id: number
    name: string
    role: string
    username: string
  }
}

type loginArgs = {
  username : string,
  password : string
}

export const loginAsyncThunk = createAsyncThunk<loginResponse, loginArgs>(
  'session/login',
  async ({ username, password }) => {
    const response = await axios.post(
      ROUTES.LOGIN(),
      { username, password }
    )
    return response.data
  }
)

type refreshTokenArgs = {
  refresh_token : string,
}

export const refreshTokenAsyncThunk = createAsyncThunk<loginResponse, refreshTokenArgs>(
  'session/refresh',
  async ({ refresh_token }) => {
    const response = await axios.post(
      ROUTES.REFRESH(),
      { refresh_token }
    )
    return response.data
  }
)

const initialState = {
  data: null as null | loginResponse,
  isFetching: false,
  error: null as any,
}

export const logoutAction = createAction<void>('session/logout')

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // We could specify logoutAction reducer here, but using extraReducer we could reuse the logic for various actions (more scalability)
    // logoutAction: (state) => {
    //   return initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, (state, action) => {
        return initialState
      })
      // isFetching is associated to login, no refresh. Refreshing token is transparent to the user and doesnt need to be rendered
      .addMatcher(isPending(loginAsyncThunk), (state) => {
        state.data = null
        state.isFetching = true
        state.error = null
      })
      // Or same, using addCase function
      // .addCase(loginAsyncThunk.pending, (state) => {
      //   state.data = null
      //   state.isFetching = true
      //   state.error = null
      // })
      // Similar to use isAnyOf(loginAsyncThunk.fulfilled, refreshTokenAsyncThunk.fulfilled)
      .addMatcher(isAnyOf(isFulfilled(loginAsyncThunk), isFulfilled(refreshTokenAsyncThunk)), (state, action) => {
        state.data = action.payload
        state.isFetching = false
        state.error = null
      })
      // Similar to use isAnyOf(loginAsyncThunk.rejected, refreshTokenAsyncThunk.rejected)
      .addMatcher(isAnyOf(isRejected(loginAsyncThunk), isRejected(refreshTokenAsyncThunk)), (state, action) => {
        state.data = null
        state.isFetching = false
        state.error = action.error
      })
      .addMatcher(
        isAsyncThunkAction(loginAsyncThunk, refreshTokenAsyncThunk),
        (state, action) => {
          // I match on everything action dispatched by loginAsyncThunk or refreshTokenAsyncThunk regardless of the lifecycle
        }
      )
  }
  // Examples without builder syntax (Not recomended, see https://redux-toolkit.js.org/api/createReducer#usage-with-the-map-object-notation)
  // extraReducers: {
  //   // @ts-ignore
  //   [loginAction.pending]: (state, action) => {
  //     state.data = null
  //     state.isFetching = true
  //     state.error = null
  //   },
  //   // @ts-ignore
  //   [loginAction.rejected]: (state, action) => {
  //     state.data = null
  //     state.isFetching = false
  //     state.error = action.error
  //   },
  //   // @ts-ignore
  //   [loginAction.fulfilled]: (state, action) => {
  //     state.error = null
  //     state.isFetching = false
  //     state.data = action.payload
  //   }
  // }
})

const {
  actions,
  reducer
} = sessionSlice


export const selectSession = (state: RootState) => state.session

export default reducer
