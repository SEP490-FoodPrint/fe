import React from "react"
import { createRoot } from "react-dom/client"
import { Alert, AlertTitle, Box } from "@mui/material"
import { getMsgClient } from "src/lib/stringsUtils"
import "./styles.scss"

let toastContainer = null

function getOrCreateToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById("foodprint-toast-container")
    if (!toastContainer) {
      toastContainer = document.createElement("div")
      toastContainer.id = "foodprint-toast-container"
      toastContainer.style.position = "fixed"
      toastContainer.style.bottom = "24px"
      toastContainer.style.right = "24px"
      toastContainer.style.zIndex = "9999"
      toastContainer.style.display = "flex"
      toastContainer.style.flexDirection = "column"
      toastContainer.style.gap = "8px"
      document.body.appendChild(toastContainer)
    }
  }
  return toastContainer
}

function notice({ msg = "", desc, isSuccess = true, duration = 3000 }) {
  const container = getOrCreateToastContainer()
  const toastItem = document.createElement("div")
  container.appendChild(toastItem)

  const root = createRoot(toastItem)

  const handleClose = () => {
    try {
      root.unmount()
      if (toastItem.parentNode) {
        toastItem.parentNode.removeChild(toastItem)
      }
    } catch {
      // Ignore
    }
  }

  root.render(
    <Alert
      severity={isSuccess ? "success" : "error"}
      onClose={handleClose}
      sx={{
        minWidth: "280px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "8px",
      }}
    >
      {msg && (
        <AlertTitle sx={{ fontWeight: 600 }}>
          <span dangerouslySetInnerHTML={{ __html: getMsgClient(msg || "") }} />
        </AlertTitle>
      )}
      {desc && (
        <Box fontSize="0.875rem">
          <span dangerouslySetInnerHTML={{ __html: getMsgClient(desc || "") }} />
        </Box>
      )}
    </Alert>
  )

  setTimeout(handleClose, duration)
}

export default notice
