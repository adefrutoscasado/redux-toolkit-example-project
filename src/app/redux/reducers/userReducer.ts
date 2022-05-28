
import { createSlice } from '@reduxjs/toolkit'

const { reducer, actions } = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    setUserAccessDataAction: (state, action) => {
      return action.payload
    },
    logoutAction: () => {
      return {}
    },
  },
})

export const {
  setUserAccessDataAction,
  logoutAction
} = actions

export default reducer
