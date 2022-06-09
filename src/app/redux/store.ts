import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import counterReducer from '../../features/counter/counterSlice'
import sessionReducer, { sessionMiddleware } from '../../features/login/sessionSlice'
import todoReducer from '../../features/todo/todoSlice'
import api from './api/index'

const reducer = {
  counter: counterReducer,
  session: sessionReducer,
  todo:todoReducer,
  [api.reducerPath]: api.reducer,
}

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(sessionMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
