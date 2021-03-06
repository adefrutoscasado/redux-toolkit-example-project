
import { logoutAction, loginAsyncThunk, selectSession } from './sessionSlice'
import { useAppDispatch, useAppSelector } from './../../app/hooks'

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

  const logout = () =>
    dispatch(logoutAction())

  const login = ({ username, password }) =>
    dispatch(loginAsyncThunk({ username, password }))

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
