import { createTheme } from "@mui/material/styles"

export const ColorPrimary = "#0A8066"
export const ColorSecondary = "#DED3CD"
export const ColorSuccess = "#168456"
export const ColorError = "#D64545"
export const ColorWarning = "#9B650A"
export const ColorInfo = "#286BBD"

export const getMuiTheme = (mode = "light") => {
  const isDark = mode === "dark"

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: ColorPrimary,
        light: "#30A387",
        dark: "#08604D",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: ColorSecondary,
        light: "#FAF7F5",
        dark: "#B4A096",
        contrastText: "#1D2B26",
      },
      background: {
        default: isDark ? "#121212" : "#F8FAF9",
        paper: isDark ? "#1E1E1E" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#FFFFFF" : "#1D2B26",
        secondary: isDark ? "#ADBBB3" : "#52635C",
      },
      success: {
        main: ColorSuccess,
        contrastText: "#FFFFFF",
      },
      error: {
        main: ColorError,
        contrastText: "#FFFFFF",
      },
      warning: {
        main: ColorWarning,
        contrastText: "#FFFFFF",
      },
      info: {
        main: ColorInfo,
        contrastText: "#FFFFFF",
      },
    },
    typography: {
      fontFamily: '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(10, 128, 102, 0.25)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(29, 43, 38, 0.08)",
            border: "1px solid var(--border-default, #DCE5E0)",
          },
        },
      },
    },
  })
}

export default getMuiTheme
