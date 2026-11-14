import React, { useEffect, useState } from "react"
import { Box, TextField, Button, Stack, Typography, Chip } from "@mui/material"
import { Search } from "lucide-react"
import BlockchainTraceabilityService from "src/services/BlockchainTraceabilityService"
import styles from "./TraceSearch.module.scss"

export default function TraceSearch({ onSelectAllocation, selectedId }) {
  const [keyword, setKeyword] = useState("")
  const [recentList, setRecentList] = useState([])
  const [loading, setLoading] = useState(false)

  async function loadRecent() {
    setLoading(true)
    try {
      const data = await BlockchainTraceabilityService.search({ limit: 8 })
      setRecentList(data || [])
      if (!selectedId && data && data.length > 0) {
        onSelectAllocation(data[0].mealAllocationId)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecent()
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (keyword.trim()) {
      onSelectAllocation(keyword.trim())
    }
  }

  return (
    <Box className={styles.searchContainer}>
      <Typography className={styles.searchTitle}>Chọn hoặc nhập mã suất ăn để truy xuất</Typography>
      <Stack component="form" onSubmit={handleSearchSubmit} direction={{ xs: "column", sm: "row" }} spacing="var(--space-2)">
        <TextField
          size="small"
          fullWidth
          placeholder="Nhập mã MealAllocation UUID (VD: 3a2c-...)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" startIcon={<Search size={16} />}>
          Truy xuất
        </Button>
      </Stack>

      {recentList.length > 0 && (
        <Box>
          <Typography className={styles.quickSelectTitle}>Suất ăn gần đây:</Typography>
          <Stack direction="row" spacing="var(--space-1)" flexWrap="wrap" sx={{ gap: "var(--space-1)" }}>
            {recentList.map((item) => (
              <Chip
                key={item.mealAllocationId}
                label={`${item.className} · ${item.mealDate}`}
                size="small"
                clickable
                color={selectedId === item.mealAllocationId ? "primary" : "default"}
                onClick={() => onSelectAllocation(item.mealAllocationId)}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
