import React, { useEffect, useState } from "react"
import { Container, Box, Typography, CircularProgress, Alert, Grid } from "@mui/material"
import BlockchainTraceabilityService from "src/services/BlockchainTraceabilityService"
import TraceSearch from "./component/TraceSearch"
import TraceTimeline from "./component/TraceTimeline"
import VerifyPanel from "./component/VerifyPanel"
import "./style.scss"

export default function BlockchainTraceabilityTest() {
  const [selectedAllocationId, setSelectedAllocationId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [traceData, setTraceData] = useState(null)

  async function loadTrace(allocationId) {
    if (!allocationId) return
    setLoading(true)
    setError("")
    setTraceData(null)
    try {
      const data = await BlockchainTraceabilityService.trace(allocationId)
      setTraceData(data)
    } catch (err) {
      setError(err?.message || "Không thể tải chuỗi truy xuất nguồn gốc.")
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(id) {
    setSelectedAllocationId(id)
    loadTrace(id)
  }

  return (
    <Container maxWidth="lg" className="pageContainer">
      <Box className="pageHeader">
        <Typography variant="h4" component="h1">
          Kiểm thử Truy xuất Nguồn gốc Suất ăn & Đối chiếu Blockchain
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Truy vết ngược toàn bộ chuỗi cung ứng: Nhà cung cấp → Lô nguyên liệu → Bếp nấu → Suất ăn lớp học, đồng thời đối soát hash on-chain.
        </Typography>
      </Box>

      {/* Search & Selector */}
      <TraceSearch
        selectedId={selectedAllocationId}
        onSelectAllocation={handleSelect}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: "var(--space-8)" }}>
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : traceData ? (
        <Box sx={{ mt: "var(--space-3)" }}>
          <Grid container spacing={3}>
            {/* Timeline Column */}
            <Grid item xs={12} md={7}>
              <TraceTimeline traceData={traceData} />
            </Grid>

            {/* Verification Panel Column */}
            <Grid item xs={12} md={5}>
              <VerifyPanel anchors={traceData.anchors} />
            </Grid>
          </Grid>
        </Box>
      ) : null}
    </Container>
  )
}
