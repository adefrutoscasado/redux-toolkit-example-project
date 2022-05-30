import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import counterReducer from '../../features/counter/counterSlice'
import userReducer from './reducers/userReducer'
import api from './api/index'

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
  try {
    const serializedState = JSON.stringify({ session: state.session })
    localStorage.setItem(PERSISTED_STATE, serializedState)
  } catch (error) {
    // Ignore write errors
  }
}

const persistedState = loadState()

export const store = configureStore({
  preloadedState: persistedState,
  reducer: {
    counter: counterReducer,
    session: userReducer,
    [api.reducerPath]: api.reducer,
  },
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
