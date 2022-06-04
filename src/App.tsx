import React, { useEffect, useMemo } from 'react'
import Counter from './features/counter'
import Login from './features/login'
import Blog from './features/blog'
import Todo from './features/todo'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from 'react-router-dom'
import { useUserReducer } from './app/hooks'
import * as ROUTES from './routes'
import { Nav } from './components/bootstrap'
import { useLocation } from 'react-router-dom'

const NavLink = ({
  to = undefined as (undefined | string),
  children = '',
  onClick = () => {},
  ...props
}) =>
  <Nav.Link href={to} {...props}>
    <Link to={to} onClick={onClick}>{children}</Link>
  </Nav.Link>


const Main = () => {
  const { logout } = useUserReducer()
  const { pathname } = useLocation()

  return (
    <>
      <div className='nav-container'>
        <Nav
          variant='tabs'
          activeKey={pathname}
          className='main-nav'
        >
          <NavLink to={ROUTES.COUNTER}>Counter</NavLink>
          <NavLink to={ROUTES.TODO}>Todo</NavLink>
          <NavLink to={ROUTES.BLOG}>Blog</NavLink>
        </Nav>
        <Nav
          variant='tabs'
          activeKey={pathname}
        >
          <NavLink variant={'button'} onClick={logout}>Logout</NavLink>
        </Nav>
      </div>
      <Switch>
        <>
          <Redirect from={'*'} to={ROUTES.COUNTER} />
          <Route path={ROUTES.COUNTER}>
            <Counter />
          </Route>
          <Route path={ROUTES.BLOG}>
            <Blog />
          </Route>
          <Route path={ROUTES.TODO}>
            <Todo />
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
            <Redirect from={'*'} to={ROUTES.LOGIN} />
            <Route path={ROUTES.LOGIN}>
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
