import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './redux/store'
import { logoutAction, loginAction } from './redux/reducers/sessionSlice'

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
    // By default, dispatching asyncThunks never results in errors (errors are just saved at redux)
    // Using 'unwrap', the dispatch action will throw an error if the asyncThunk fails. Useful if we want to create then and catch logic (instead of using isError, error, data, isFetching states...).
    .unwrap()
    .then((result) => {
      // Here you can access the result of the asyncThunk
      console.log(`Logged in successfully as ${JSON.stringify(result.user.username)}`)
    })
    .catch((err) => {
      // Here you can access the error of the asyncThunk. If you don't use 'unwrap', this part will never be reached.
      console.log(err)
    })

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
