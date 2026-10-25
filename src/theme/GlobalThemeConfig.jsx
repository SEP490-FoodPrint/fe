import React, { useContext, useMemo } from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { StoreContext } from "src/contexts"
import { getMuiTheme } from "./ThemeConfigMui"

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext) || {}
  const isDarkMode = themeStore?.isDarkMode || false

  const theme = useMemo(() => {
    return getMuiTheme(isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

export default GlobalThemeConfig
