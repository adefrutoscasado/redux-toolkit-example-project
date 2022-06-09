import {
  createSlice,
  createAsyncThunk,
  isAsyncThunkAction,
  isPending,
  isRejected,
  isFulfilled,
  createAction,
  isAnyOf,
  createListenerMiddleware,
} from '@reduxjs/toolkit'
import axios from 'axios'
import type { AxiosError } from 'axios'
import * as ROUTES from '../../app/redux/api/routes'
import type { RootState } from '../../app/redux/store'
import api from './../../app/redux/api'

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
  ({ username, password }) => new Promise((resolve, reject) => {
    axios.post(
      ROUTES.LOGIN(),
      { username, password }
    )
      .then((response) => resolve(response.data))
      .catch((error: AxiosError | typeof Error) => {
        if (axios.isAxiosError(error)) {
          reject(error.response?.data)
        }
        reject(error)
      })
  })
)

type refreshTokenArgs = {
  refresh_token : string,
}

export const refreshTokenAsyncThunk = createAsyncThunk<loginResponse, refreshTokenArgs>(
  'session/refresh',
  async ({ refresh_token }) => new Promise((resolve, reject) => {
    axios.post(
      ROUTES.REFRESH(),
      { refresh_token }
    )
      .then((response) => resolve(response.data))
      .catch((error: AxiosError | typeof Error) => {
        if (axios.isAxiosError(error)) {
          reject(error.response?.data)
        }
        reject(error)
      })
  })
)

const emptyInitialState = {
  data: null as null | loginResponse,
  isFetching: false,
  error: null as any,
}

export const logoutAction = createAction<void>('session/logout')

const PERSISTED_SESSION = 'persisted-session'

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(PERSISTED_SESSION)
    if (!serializedState) return emptyInitialState
    return JSON.parse(serializedState)
  } catch (error) {
    return emptyInitialState
  }
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: loadState(),
  reducers: {
    // We could specify logoutAction reducer here, but using extraReducer we could reuse the logic for various actions (more scalability)
    // logoutAction: (state) => {
    //   return initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, (state, action) => {
        return emptyInitialState
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


const removePersistedSession = () => {
  localStorage.removeItem(PERSISTED_SESSION)
}

const savePersistedSession = (reducerState: typeof emptyInitialState) => {
  const serializedState = JSON.stringify(reducerState)
  localStorage.setItem(PERSISTED_SESSION, serializedState)
}

const sessionListenerMiddleware = createListenerMiddleware()

sessionListenerMiddleware.startListening({
  matcher: isAnyOf(logoutAction, isAsyncThunkAction(loginAsyncThunk, refreshTokenAsyncThunk)),
  effect: async (action, listenerApi) => {
    const getState = listenerApi.getState as () => RootState

    const shouldSaveSession = isFulfilled(loginAsyncThunk, refreshTokenAsyncThunk)
    const shouldRemoveSession = isAnyOf(isRejected(loginAsyncThunk, refreshTokenAsyncThunk), logoutAction)

    if (shouldSaveSession(action)) {
      savePersistedSession(getState().session)
    }
    if (shouldRemoveSession(action)) {
      removePersistedSession()
      // clean api cache
      listenerApi.dispatch(api.util.resetApiState())
    }
  },
})

export const sessionMiddleware = sessionListenerMiddleware.middleware

const {
  actions,
  reducer
} = sessionSlice

export const selectSession = (state: RootState) => state.session

export default reducer
