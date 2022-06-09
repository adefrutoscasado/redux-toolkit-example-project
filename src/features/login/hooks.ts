
import { logoutAction, loginAsyncThunk, selectSession } from './sessionSlice'
import { useAppDispatch, useAppSelector } from './../../app/hooks'
import apiSlice from './../../app/redux/api'

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

  const logout = () => {
    dispatch(logoutAction())
    // Clean redux toolkit api cache on logout
    dispatch(apiSlice.util.resetApiState())
  }

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
