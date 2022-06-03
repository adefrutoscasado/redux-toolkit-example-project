import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './redux/store'
import { logoutAction, loginAsyncThunk, selectSession } from '../features/login/sessionSlice'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export const useUserReducer = () => {
  const dispatch = useAppDispatch()
  const {
    error: loginError,
    isFetching: isLoggingIn,
    data: session,
  } = useAppSelector(selectSession)

  const access_token = session?.access_token
  const refresh_token = session?.refresh_token
  const user = session?.user

  const isLoggedIn = !!session

  const logout = () => dispatch(logoutAction())

  const login = ({ username, password }) => dispatch(loginAsyncThunk({ username, password }))

  const isAdmin = user?.role === 'admin'
  const isUser = user?.role === 'user'

  const defaultRoute = '/'

  return {
    login,
    logout,
    access_token,
    refresh_token,
    user,
    isAdmin,
    isUser,
    isLoggedIn,
    defaultRoute,
    loginError,
    isLoggingIn,
  }
}
