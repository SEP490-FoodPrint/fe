import React from "react"
import { BrowserRouter } from "react-router-dom"
import ErrorBoundary from "./components/Boundary"
import DefaultAction from "./components/Layout/DefaultAction/DefaultAction"
import Providers from "./components/Providers/providers"
import AppRouter from "./router/AppRouter"
import GlobalThemeConfig from "./theme/GlobalThemeConfig"

function App() {
  return (
    <Providers>
      <GlobalThemeConfig>
        <BrowserRouter>
          <ErrorBoundary>
            <DefaultAction>
              <AppRouter />
            </DefaultAction>
          </ErrorBoundary>
        </BrowserRouter>
      </GlobalThemeConfig>
    </Providers>
  )
}

export default App
