import React from "react"
import { Box, CircularProgress } from "@mui/material"
import LoadingOverlay from "../LoadingOverlay"

const SpinCustom = ({ spinning = true, fullscreen, children, sx, ...props }) => {
  if (!children) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...(fullscreen && {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }),
          ...sx,
        }}
        {...props}
      >
        <LoadingOverlay isLoadingTable sizeSmall />
      </Box>
    )
  }

  return (
    <Box sx={{ position: "relative", ...sx }} {...props}>
      {children}
      {spinning && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255, 255, 255, 0.6)",
            zIndex: 10,
          }}
        >
          <CircularProgress size={32} color="primary" />
        </Box>
      )}
    </Box>
  )
}

export default SpinCustom
