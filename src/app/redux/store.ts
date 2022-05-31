import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import counterReducer from '../../features/counter/counterSlice'
import sessionReducer from './reducers/sessionSlice'
import api from './api/index'
import { StateFromReducersMapObject } from "@reduxjs/toolkit"


const PERSISTED_STATE = 'persisted-state'

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(PERSISTED_STATE)
    return JSON.parse(serializedState || '{}')
  } catch (error) {
    return undefined
  }
}

const saveState = (state: any) => {
  // REVIEW: Is there a better way to manage persistent session?
  try {
    if (state.session.data) {
      const serializedState = JSON.stringify({ session: state.session })
      localStorage.setItem(PERSISTED_STATE, serializedState)
    }
    if (state.session.isFetching || state.session.error || !state.session) {
      localStorage.removeItem(PERSISTED_STATE)
    }
  } catch (error) {
    // Ignore write errors
  }
}

const persistedState = loadState()

const reducer = {
  counter: counterReducer,
  session: sessionReducer,
  [api.reducerPath]: api.reducer,
}

type reducerType = StateFromReducersMapObject<typeof reducer>

export const store = configureStore({
  preloadedState: persistedState as reducerType,
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware)
})

setupListeners(store.dispatch)

store.subscribe(() => {
  saveState(store.getState())
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
