import React, { useEffect, useState } from "react"
import { Container, Box, Typography, Stack, CircularProgress, Alert, Button } from "@mui/material"
import { RefreshCw } from "lucide-react"
import BlockchainDistributionService from "src/services/BlockchainDistributionService"
import AnchorTrigger from "./component/AnchorTrigger"
import AnchorCard from "./component/AnchorCard"
import "./style.scss"

export default function BlockchainDistributionTest() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [anchors, setAnchors] = useState([])

  async function fetchAnchors() {
    setLoading(true)
    setError("")
    try {
      const res = await BlockchainDistributionService.list({ limit: 30 })
      setAnchors(res.items || [])
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách bằng chứng phân bổ.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnchors()
  }, [])

  return (
    <Container maxWidth="lg" className="pageContainer">
      <Box className="pageHeader">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1">
              Kiểm thử Bằng chứng Phân phối suất ăn (Blockchain)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mô phỏng dữ liệu phân phối được băm và ghi nhận bất biến lên hợp đồng FoodPrintHashRegistry.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={fetchAnchors}
            disabled={loading}
            startIcon={<RefreshCw size={16} />}
          >
            Làm mới
          </Button>
        </Stack>
      </Box>

      {/* Trigger Block */}
      <AnchorTrigger onSuccess={fetchAnchors} />

      {/* Anchors List */}
      <Box sx={{ mt: "var(--space-4)" }}>
        <Typography variant="h6" sx={{ mb: "var(--space-3)", color: "var(--text-primary)" }}>
          Danh sách mốc bằng chứng đã ghi nhận ({anchors.length})
        </Typography>

        {loading ? (
          <Stack alignItems="center" sx={{ py: "var(--space-8)" }}>
            <CircularProgress size={32} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : anchors.length === 0 ? (
          <Alert severity="info">Chưa có bản ghi bằng chứng phân bổ nào. Hãy kích hoạt ở khối phía trên.</Alert>
        ) : (
          <Stack spacing="var(--space-3)">
            {anchors.map((item) => (
              <AnchorCard key={item.id} item={item} />
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  )
}
