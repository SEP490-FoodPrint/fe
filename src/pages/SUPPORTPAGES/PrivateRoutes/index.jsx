import React, { useContext, useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"

function PrivateRoutes() {
  const { loginStore, routerBeforeStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const setRouterBeforeLogin = routerBeforeStore?.setRouterBeforeLogin
  const location = useLocation()

  useEffect(() => {
    if (!isLoginContext && setRouterBeforeLogin) {
      setRouterBeforeLogin(`${location.pathname}${location.search}`)
    }
  }, [isLoginContext, location, setRouterBeforeLogin])

  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <Outlet />
}

export default PrivateRoutes
