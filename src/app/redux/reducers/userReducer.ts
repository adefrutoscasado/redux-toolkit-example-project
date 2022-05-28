
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import * as ROUTES from './../api/routes'

export const loginAction = createAsyncThunk(
  'user/login',
  // @ts-ignore
  async ({ username, password }) => {
    const response = await axios.post(
      ROUTES.LOGIN(),
      { username, password }
    )
    return response.data
  }
)

const initialState = {
  data: null,
  isFetching: false,
  error: null,
}

const { reducer, actions } = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSessionAction: (state, action) => {
      state.data = action.payload
      state.isFetching = true
      state.error = null
    },
    logoutAction: (state) => {
      state.data = null
      state.isFetching = true
      state.error = null
    },
  },
  extraReducers: {
    // Add reducers for additional action types here, and handle loading state as needed
    // @ts-ignore
    [loginAction.pending]: (state, action) => {
      state.data = null
      state.isFetching = true
      state.error = null
    },
    // @ts-ignore
    [loginAction.rejected]: (state, action) => {
      state.data = null
      state.isFetching = false
      state.error = action.error
    },
    // @ts-ignore
    [loginAction.fulfilled]: (state, action) => {
      state.error = null
      state.isFetching = false
      state.data = action.payload
    }
  }
})


export const {
  logoutAction,
  setSessionAction,
} = actions

export default reducer
