import React, { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material"
import { ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react"
import BlockchainTraceabilityService from "src/services/BlockchainTraceabilityService"
import styles from "./VerifyPanel.module.scss"

export default function VerifyPanel({ anchors }) {
  const [selectedAnchorId, setSelectedAnchorId] = useState(
    () => (anchors && anchors.length > 0 ? anchors[0].id : null),
  )
  const [testPayload, setTestPayload] = useState("")
  const [useTamperedPayload, setUseTamperedPayload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verifyResult, setVerifyResult] = useState(null)

  const activeAnchor =
    anchors && anchors.find((a) => a.id === selectedAnchorId) || anchors?.[0]

  async function handleVerify() {
    if (!activeAnchor) return
    setLoading(true)
    setError("")
    setVerifyResult(null)
    try {
      const body = useTamperedPayload && testPayload ? { testModifiedPayload: testPayload } : {}
      const res = await BlockchainTraceabilityService.verify(activeAnchor.id, body)
      setVerifyResult(res)
    } catch (err) {
      setError(err?.message || "Lỗi khi gọi đối chiếu trên Blockchain.")
    } finally {
      setLoading(false)
    }
  }

  if (!anchors || anchors.length === 0) {
    return (
      <Box className={styles.verifyCard}>
        <Typography className={styles.panelTitle}>Đối chiếu Bằng chứng Blockchain</Typography>
        <Alert severity="info">
          Suất ăn này chưa có mốc bằng chứng (Traceability Anchor) nào được ghi nhận on-chain.
        </Alert>
      </Box>
    )
  }

  return (
    <Box className={styles.verifyCard}>
      <Typography className={styles.panelTitle}>Đối chiếu & Xác minh Tính toàn vẹn</Typography>
      <Typography className={styles.panelSubtitle}>
        Đọc giá trị băm từ smart contract FoodPrintHashRegistry và đối chiếu với dữ liệu off-chain để phát hiện mọi hành vi can thiệp dữ liệu trái phép.
      </Typography>

      {/* Anchor Selector */}
      {anchors.length > 1 && (
        <Stack direction="row" spacing="var(--space-1)" sx={{ mb: "var(--space-3)" }}>
          {anchors.map((a, idx) => (
            <Chip
              key={a.id}
              label={`Mốc ${idx + 1}: ${a.networkName || "Local"}`}
              color={a.id === activeAnchor?.id ? "primary" : "default"}
              onClick={() => {
                setSelectedAnchorId(a.id)
                setVerifyResult(null)
              }}
            />
          ))}
        </Stack>
      )}

      {activeAnchor && (
        <Box sx={{ mb: "var(--space-3)", p: "var(--space-2)", bgcolor: "var(--bg-muted)", borderRadius: "var(--radius-md)" }}>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            Anchor ID: <code>{activeAnchor.id}</code>
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
            Hash trong DB: <code>{activeAnchor.payloadHash}</code>
          </Typography>
          <Typography variant="body2">
            Giao dịch (Tx): <code>{activeAnchor.transactionHash || "N/A"}</code> · Block: <strong>{activeAnchor.blockNumber || "Pending"}</strong>
          </Typography>
        </Box>
      )}

      {/* Demo Tampering Feature */}
      <Box className={styles.tamperSection}>
        <Typography className={styles.tamperTitle}>Khu vực thử nghiệm can thiệp dữ liệu (Demo Tampering):</Typography>
        <Stack direction="row" spacing="var(--space-2)" alignItems="center" sx={{ mb: "var(--space-2)" }}>
          <Button
            size="small"
            variant={useTamperedPayload ? "contained" : "outlined"}
            color="warning"
            onClick={() => {
              setUseTamperedPayload(!useTamperedPayload)
              setVerifyResult(null)
              if (!testPayload) {
                setTestPayload(
                  activeAnchor?.snapshot
                    ? JSON.stringify(activeAnchor.snapshot) + " [ĐÃ CHỈNH SỬA]"
                    : "Dữ liệu mẫu đã bị sửa đổi trái phép!",
                )
              }
            }}
          >
            {useTamperedPayload ? "Đang bật chế độ giả mạo dữ liệu" : "Bật thử nghiệm sửa đổi dữ liệu"}
          </Button>
          {useTamperedPayload && (
            <Typography variant="caption" color="warning.main">
              Hệ thống sẽ băm chuỗi văn bản bị chỉnh sửa bên dưới để so sánh với Blockchain.
            </Typography>
          )}
        </Stack>

        {useTamperedPayload && (
          <TextField
            multiline
            rows={3}
            fullWidth
            size="small"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            placeholder="Nhập nội dung dữ liệu bị thay đổi..."
            sx={{ bgcolor: "var(--bg-surface)" }}
          />
        )}
      </Box>

      {/* Action Button */}
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handleVerify}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ShieldCheck size={18} />}
      >
        {loading ? "Đang đọc Smart Contract & đối chiếu…" : "Xác minh tính toàn vẹn (Verify On-Chain)"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: "var(--space-3)" }}>
          {error}
        </Alert>
      )}

      {/* Verification Result */}
      {verifyResult && (
        <Alert
          severity={verifyResult.matches ? "success" : "error"}
          icon={verifyResult.matches ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          sx={{ mt: "var(--space-3)" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {verifyResult.matches
              ? "HỢP LỆ — DỮ LIỆU TOÀN VẸN 100%"
              : "CẢNH BÁO — DỮ LIỆU BỊ SAI LỆCH SO VỚI BLOCKCHAIN!"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {verifyResult.matches
              ? "Giá trị băm tái tạo từ dữ liệu hoàn toàn trùng khớp với bằng chứng đã ghi nhận bất biến trên Smart Contract."
              : "Giá trị băm của dữ liệu hiện tại không khớp với giá trị đã được chốt on-chain. Dữ liệu đã bị can thiệp ngoài chuỗi!"}
          </Typography>
          <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed rgba(0,0,0,0.15)" }}>
            <Typography variant="caption" sx={{ display: "block", overflowWrap: "anywhere" }}>
              Hash thử nghiệm: <code>{verifyResult.testedHash}</code>
            </Typography>
            <Typography variant="caption" sx={{ display: "block", overflowWrap: "anywhere" }}>
              Hash trên Blockchain: <code>{verifyResult.onChainHash || "Chưa tìm thấy trên chain"}</code>
            </Typography>
          </Box>
        </Alert>
      )}
    </Box>
  )
}
