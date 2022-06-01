
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import * as ROUTES from '../api/routes'
import type { RootState } from './../../redux/store'

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

export const loginAction = createAsyncThunk<loginResponse, loginArgs>(
  'session/login',
  async ({ username, password }) => {
    const response = await axios.post(
      ROUTES.LOGIN(),
      { username, password }
    )
    return response.data
  }
)

const initialState = {
  data: null as null | loginResponse,
  isFetching: false,
  error: null as any,
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionAction: (state, action) => {
      state.data = action.payload
      state.isFetching = false
      state.error = null
    },
    logoutAction: (state) => {
      state.data = null
      state.isFetching = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.pending, (state) => {
        state.data = null
        state.isFetching = true
        state.error = null
      })
      .addCase(loginAction.rejected, (state, action) => {
        state.data = null
        state.isFetching = false
        state.error = action.error
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.error = null
        state.isFetching = false
        state.data = action.payload
      })
  },
  // Or same, without builder syntax (Not recomended, see https://github.com/reduxjs/redux-toolkit/issues/478#issuecomment-792889946)
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

export const {
  logoutAction,
  setSessionAction,
} = actions

export const selectSession = (state: RootState) => state.session

export default reducer
