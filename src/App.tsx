import React, { useEffect, useLayoutEffect, useMemo } from 'react'
import Counter from './features/counter'
import Login from './features/login'
import Blog from './features/blog'
import Todo from './features/todo'
import Pets from './features/pets'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from 'react-router-dom'
import { useUserReducer } from './features/login/hooks'
import * as ROUTES from './routes'
import { Nav } from './components/bootstrap'
import { useLocation, useHistory } from 'react-router-dom'

const NavLink = ({
  to = undefined as (undefined | string),
  children = '',
  onClick = () => {},
  ...props
}) =>
  <Nav.Link href={to} {...props} onClick={event => event.preventDefault()}>
    <Link to={to} onClick={onClick}>{children}</Link>
  </Nav.Link>


const Main = () => {
  const { logout } = useUserReducer()
  const { pathname } = useLocation()
  const history = useHistory()

  useLayoutEffect(() => {
    if (localStorage.getItem('last-route')) {
      history.push(localStorage.getItem('last-route'))
    }
  }, [history])

  useLayoutEffect(() => {
    localStorage.setItem('last-route', pathname)
    return () => localStorage.removeItem('last-route')
  }, [pathname])

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
          <NavLink to={ROUTES.PETS}>Pets</NavLink>
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
          <Route path={ROUTES.PETS}>
            <Pets />
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
