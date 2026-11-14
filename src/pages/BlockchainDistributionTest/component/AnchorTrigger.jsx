import React, { useState } from "react"
import { Box, Button, TextField, Stack, Typography, Alert, CircularProgress } from "@mui/material"
import { Send, CheckCircle2 } from "lucide-react"
import BlockchainDistributionService from "src/services/BlockchainDistributionService"
import styles from "./AnchorTrigger.module.scss"

export default function AnchorTrigger({ onSuccess }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastResult, setLastResult] = useState(null)

  async function handleTrigger() {
    setLoading(true)
    setError("")
    setLastResult(null)
    try {
      const res = await BlockchainDistributionService.triggerAnchor({ date })
      setLastResult(res)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err?.message || "Không thể kích hoạt ghi bằng chứng lên Blockchain.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={styles.triggerCard}>
      <Typography className={styles.triggerTitle}>Mô phỏng kích hoạt ghi bằng chứng Blockchain</Typography>
      <Typography className={styles.triggerDesc}>
        Gửi yêu cầu băm dữ liệu phân phối của ngày đã chọn và gọi contract FoodPrintHashRegistry.confirmHash() trên node Blockchain.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing="var(--space-3)" alignItems="center">
        <TextField
          type="date"
          size="small"
          label="Ngày phân bổ"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          disabled={loading}
          sx={{ width: { xs: "100%", sm: 200 }, bgcolor: "var(--bg-surface)" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleTrigger}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
        >
          {loading ? "Đang ghi on-chain…" : "Kích hoạt ghi Blockchain"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: "var(--space-3)" }}>
          {error}
        </Alert>
      )}

      {lastResult && (
        <Alert severity="success" icon={<CheckCircle2 size={20} />} sx={{ mt: "var(--space-3)" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Ghi nhận on-chain thành công! ({lastResult.anchoredAllocationsCount} suất ăn)
          </Typography>
          <Typography variant="caption" sx={{ display: "block", overflowWrap: "anywhere" }}>
            Tx Hash: <code>{lastResult.txHash}</code> · Block: <strong>{lastResult.blockNumber}</strong>
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
