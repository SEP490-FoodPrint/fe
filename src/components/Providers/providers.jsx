import React from "react"
import { StoreProvider } from "src/contexts"
import { ThemeStyledComponent } from "src/theme/ThemeStyledComponent"
import { ThemeProvider } from "styled-components"

const Providers = ({ children }) => {
  return (
    <ThemeProvider theme={ThemeStyledComponent}>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  )
}

export default Providers
