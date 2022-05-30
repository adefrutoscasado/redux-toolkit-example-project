import React, { useEffect, useMemo } from 'react'
import Counter from './features/counter'
import Login from './features/login'
import Blog from './features/blog'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from 'react-router-dom'
import { useUserReducer } from './app/hooks'
import * as ROUTES from './routes'

const Main = () => {
  return (
    <>
      <Link to={ROUTES.COUNTER}>Counter</Link>
      <Link to={ROUTES.BLOG}>Blog</Link>
      <Switch>
        <>
          <Redirect from={'*'} to={ROUTES.COUNTER} />
          <Route path={ROUTES.COUNTER}>
            <Counter />
          </Route>
          <Route path={ROUTES.BLOG}>
            <Blog />
          </Route>
        </>
      </Switch>
    </>
  )
}

const App = () => {
  const { isLoggedIn } = useUserReducer()

  return (
    <Router>
      {!isLoggedIn &&
        <Switch>
          <>
            <Redirect from={'*'} to={'/login'} />
            <Route path={'/login'}>
              <Login />
            </Route>
          </>
        </Switch>
      }
      {isLoggedIn &&
        <Main />
      }
  </Router>
  )
}


export default App
