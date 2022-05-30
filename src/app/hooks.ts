import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './redux/store'
import { logoutAction, loginAction } from './redux/reducers/userReducer'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export const useUserReducer = () => {
  const dispatch = useAppDispatch()
  const {
    error: loginError,
    isFetching: isLoggingIn,
    data: session,
  } = useAppSelector(state => state?.session) || {}

  const {
    access_token,
    refresh_token,
    user,
  } = session || {} as any

  const isLoggedIn = !!session

  const logout = () => dispatch(logoutAction())
  // @ts-ignore
  const login = ({ username, password }) => dispatch(loginAction({ username, password }))

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
