import React from "react"
import { createRoot } from "react-dom/client"
import { Alert, AlertTitle, Box } from "@mui/material"
import { getMsgClient } from "src/lib/stringsUtils"
import "./styles.scss"

const SEVERITIES = ["success", "error", "warning", "info"]

// Nội dung dài chỉ hiện tối đa 3 dòng; xem đủ bằng cách rê chuột (title).
const clampSx = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
  overflowWrap: "anywhere",
}

let toastContainer = null
const openToasts = new Map()

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
      toastContainer.style.width = "360px"
      toastContainer.style.maxWidth = "calc(100vw - 48px)"
      document.body.appendChild(toastContainer)
    }
  }
  return toastContainer
}

const toText = value =>
  value === null || value === undefined ? "" : getMsgClient(String(value))

/**
 * Hiện thông báo góc màn hình.
 * `type` (success | error | warning | info) được ưu tiên hơn `isSuccess`.
 */
function notice({ msg = "", desc, isSuccess = true, type, duration }) {
  const severity = SEVERITIES.includes(type)
    ? type
    : isSuccess
      ? "success"
      : "error"
  const title = toText(msg)
  const detail = toText(desc)
  const time = duration ?? (severity === "success" ? 3000 : 6000)

  // Cùng một nội dung đang hiện thì chỉ gia hạn, không hiện thêm bản trùng.
  const key = JSON.stringify([severity, title, detail])
  const existing = openToasts.get(key)
  if (existing) {
    existing.restart(time)
    return
  }

  const container = getOrCreateToastContainer()
  const toastItem = document.createElement("div")
  container.appendChild(toastItem)

  const root = createRoot(toastItem)
  let timer = null

  const handleClose = () => {
    clearTimeout(timer)
    openToasts.delete(key)
    try {
      root.unmount()
      if (toastItem.parentNode) {
        toastItem.parentNode.removeChild(toastItem)
      }
    } catch {
      // Ignore
    }
  }

  const restart = ms => {
    clearTimeout(timer)
    timer = setTimeout(handleClose, ms)
  }

  root.render(
    <Alert
      severity={severity}
      onClose={handleClose}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "8px",
        "& .MuiAlert-message": { minWidth: 0, flex: 1 },
      }}
    >
      {title && (
        <AlertTitle
          title={title}
          sx={{ ...clampSx, fontWeight: 600, mb: detail ? undefined : 0 }}
        >
          {title}
        </AlertTitle>
      )}
      {detail && (
        <Box title={detail} fontSize="0.875rem" sx={clampSx}>
          {detail}
        </Box>
      )}
    </Alert>
  )

  openToasts.set(key, { restart })
  restart(time)
}

export default notice
