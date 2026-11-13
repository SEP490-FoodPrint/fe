import React, { useState, useMemo } from "react"
import { Box } from "@mui/material"
import { MOCK_TRACKING_ORDERS } from "./mockTrackingData"

import TrackingHeader from "./component/TrackingHeader"
import TrackingFilterStrip from "./component/TrackingFilterStrip"
import TrackingTable from "./component/TrackingTable"
import TrackingDetailView from "./component/TrackingDetailView"

import styles from "./index.module.scss"

export default function OrderTracking() {
  const [orders] = useState(MOCK_TRACKING_ORDERS)

  // Sub-view: "list" (mặc định) | "detail" (xem chi tiết toàn màn hình có nút back)
  const [subView, setSubView] = useState("list")
  const [selectedItem, setSelectedItem] = useState(null)

  // Bộ lọc
  const [filters, setFilters] = useState({
    search: "",
    orderType: "all",
    status: "all",
  })

  // Lọc danh sách
  const filteredOrders = useMemo(() => {
    return orders.filter(item => {
      const kw = filters.search.trim().toLowerCase()
      const matchSearch =
        !kw ||
        item.orderNo.toLowerCase().includes(kw) ||
        item.deliveryNo.toLowerCase().includes(kw) ||
        item.supplierName.toLowerCase().includes(kw)

      const matchType =
        filters.orderType === "all" || item.orderType === filters.orderType

      const matchStatus =
        filters.status === "all" || item.status === filters.status

      return matchSearch && matchType && matchStatus
    })
  }, [orders, filters])

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      orderType: "all",
      status: "all",
    })
  }

  // Mở màn hình xem chi tiết hành trình
  const handleViewDetail = item => {
    setSelectedItem(item)
    setSubView("detail")
  }

  // Quay lại danh sách
  const handleBackToList = () => {
    setSubView("list")
    setSelectedItem(null)
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Sub-view 1: Danh sách Bảng theo dõi (Mặc định) */}
      {subView === "list" && (
        <>
          {/* Header */}
          <TrackingHeader />

          {/* Bộ lọc & Tìm kiếm */}
          <TrackingFilterStrip
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Bảng danh sách đơn theo dõi */}
          <TrackingTable
            orders={filteredOrders}
            onViewDetail={handleViewDetail}
          />
        </>
      )}

      {/* Sub-view 2: Màn hình Chi tiết hành trình toàn trang (Có nút Back) */}
      {subView === "detail" && selectedItem && (
        <TrackingDetailView
          item={selectedItem}
          onBack={handleBackToList}
        />
      )}
    </Box>
  )
}
