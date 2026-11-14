import React from "react"
import { Box } from "@mui/material"
import styles from "./PayloadViewer.module.scss"

export default function PayloadViewer({ payload }) {
  return (
    <Box className={styles.payloadContainer}>
      <pre className={styles.payloadPre}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </Box>
  )
}
