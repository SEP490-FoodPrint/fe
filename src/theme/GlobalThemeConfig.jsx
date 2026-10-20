import { ConfigProvider, theme as antdTheme } from "antd"
import { useContext } from "react"
import { StoreContext } from "src/contexts"
import ThemeConfigAntd, { ColorPrimary } from "./ThemeConfigAntd"

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext)
  const isDarkMode = themeStore?.isDarkMode || false

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          ...ThemeConfigAntd.token,
          colorPrimary: ColorPrimary,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default GlobalThemeConfig
