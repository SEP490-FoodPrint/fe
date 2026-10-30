import React from "react"
import { Box, CircularProgress } from "@mui/material"
import LoadingOverlay from "../LoadingOverlay"

const SpinCustom = ({ spinning = true, children, ...props }) => {
  if (!children) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }} {...props}>
        <LoadingOverlay isLoadingTable sizeSmall />
      </Box>
    )
  }

  return (
    <Box sx={{ position: "relative" }} {...props}>
      {children}
      {spinning && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
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
