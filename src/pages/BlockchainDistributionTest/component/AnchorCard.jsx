import React, { useState } from "react"
import { Box, Card, Chip, Typography, Button, Stack } from "@mui/material"
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import PayloadViewer from "./PayloadViewer"
import styles from "./AnchorCard.module.scss"

export default function AnchorCard({ item }) {
  const [showPayload, setShowPayload] = useState(false)

  const isConfirmed = item.anchorStatus === "CONFIRMED"
  const alloc = item.allocation

  return (
    <Card className={styles.anchorCard}>
      <Box className={styles.headerRow}>
        <Stack direction="row" spacing="var(--space-2)" alignItems="center">
          <ShieldCheck size={20} color={isConfirmed ? "var(--color-success)" : "var(--color-warning)"} />
          <Typography className={styles.classTitle}>
            {alloc ? `${alloc.className} · ${alloc.mealType === "LUNCH" ? "Bữa trưa" : "Bữa xế"}` : "Suất ăn"}
          </Typography>
        </Stack>
        <Chip
          label={isConfirmed ? "Đã xác nhận on-chain" : "Chờ xác nhận"}
          size="small"
          color={isConfirmed ? "success" : "warning"}
          variant="outlined"
        />
      </Box>

      <Typography className={styles.metaItem}>
        Mã suất ăn (Allocation ID): <code>{item.mealAllocationId}</code>
      </Typography>

      <Typography className={styles.metaItem}>
        Payload Hash: <code>{item.payloadHash}</code>
      </Typography>

      <Typography className={styles.metaItem}>
        Giao dịch (Tx Hash):{" "}
        {item.transactionHash ? (
          <code>{item.transactionHash}</code>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>Chưa gửi tx</span>
        )}
      </Typography>

      <Typography className={styles.metaItem}>
        Mạng: <strong>{item.networkName || "Hardhat Local"}</strong> · Block:{" "}
        <strong>{item.blockNumber || "Pending"}</strong> · Thời gian:{" "}
        {new Date(item.createdAt).toLocaleString("vi-VN")}
      </Typography>

      {item.snapshot && (
        <Box sx={{ mt: "var(--space-2)" }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowPayload(!showPayload)}
            startIcon={showPayload ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            sx={{ color: "var(--color-primary)" }}
          >
            {showPayload ? "Thu gọn Snapshot Payload" : "Xem Snapshot Payload (JSON gốc)"}
          </Button>
          {showPayload && <PayloadViewer payload={item.snapshot} />}
        </Box>
      )}
    </Card>
  )
}
