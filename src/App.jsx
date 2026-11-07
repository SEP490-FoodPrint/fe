import React from "react"
import { BrowserRouter } from "react-router-dom"
import ErrorBoundary from "./components/Boundary"
import DefaultAction from "./components/Layout/DefaultAction/DefaultAction"
import Providers from "./components/Providers/providers"
import AppRouter from "./router/AppRouter"
import GlobalThemeConfig from "./theme/GlobalThemeConfig"
import CompleteRegistrationDialog from "./components/Auth/CompleteRegistrationDialog"

function App() {
  return (
    <Providers>
      <GlobalThemeConfig>
        <BrowserRouter>
          <ErrorBoundary>
            <DefaultAction>
              <AppRouter />
              <CompleteRegistrationDialog />
            </DefaultAction>
          </ErrorBoundary>
        </BrowserRouter>
      </GlobalThemeConfig>
    </Providers>
  )
}

export default App
