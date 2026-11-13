import React from "react"
import { Box } from "@mui/material"
import FoodPrintLoading from "../FoodPrintLoading"

const SpinCustom = ({ spinning = true, fullscreen, children, sx, ...props }) => {
  if (!children) {
    if (fullscreen) {
      return <FoodPrintLoading fullscreen background="white" />
    }
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...sx,
        }}
        {...props}
      >
        <FoodPrintLoading size="medium" />
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
            bgcolor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(2px)",
            zIndex: 10,
          }}
        >
          <FoodPrintLoading size="small" />
        </Box>
      )}
    </Box>
  )
}

export default SpinCustom
