import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import TrackingService from "../../../services/TrackingService"

import TrackingHeader from "./component/TrackingHeader"
import TrackingFilterStrip from "./component/TrackingFilterStrip"
import TrackingTable from "./component/TrackingTable"
import TrackingDetailView from "./component/TrackingDetailView"

import styles from "./index.module.scss"

export default function OrderTracking() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Sub-view: "list" (mặc định) | "detail" (xem chi tiết toàn màn hình có nút back)
  const [subView, setSubView] = useState("list")
  const [selectedItem, setSelectedItem] = useState(null)

  // Bộ lọc
  const [filters, setFilters] = useState({
    search: "",
    orderType: "all",
    status: "all",
  })

  // Tải danh sách đơn hàng từ live Database API
  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await TrackingService.getTrackingOrders()
      setOrders(data)
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu theo dõi đơn hàng:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Lọc danh sách đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter(item => {
      const kw = filters.search.trim().toLowerCase()
      const matchSearch =
        !kw ||
        item.orderNo?.toLowerCase().includes(kw) ||
        item.deliveryNo?.toLowerCase().includes(kw) ||
        item.supplierName?.toLowerCase().includes(kw)

      const matchType =
        filters.orderType === "all" || item.orderType === filters.orderType

      const matchStatus =
        filters.status === "all" ||
        item.status === filters.status ||
        item.rawStatus === filters.status ||
        (filters.status === "COMPLETED" &&
          (item.status === "COMPLETED" ||
            item.status === "RECEIVED" ||
            item.rawStatus === "RECEIVED")) ||
        (filters.status === "ACCEPTED" &&
          (item.status === "ACCEPTED" ||
            item.status === "CREATED" ||
            item.rawStatus === "CREATED"))

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
  const handleViewDetail = async item => {
    setSelectedItem(item)
    setSubView("detail")

    // Nếu đơn hàng chưa có danh sách items chi tiết, tải thêm từ API inspection detail
    if (!item.items || item.items.length === 0) {
      try {
        const fullDetail = await TrackingService.getDeliveryDetail(item.id)
        if (fullDetail) {
          setSelectedItem(prev => ({
            ...prev,
            ...fullDetail,
            items: fullDetail.items?.length > 0 ? fullDetail.items : prev.items,
          }))
        }
      } catch (err) {
        console.warn("Không thể tải bổ sung chi tiết đợt giao:", err)
      }
    }
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
          <TrackingHeader onRefresh={loadOrders} loading={loading} />

          {/* Bộ lọc & Tìm kiếm */}
          <TrackingFilterStrip
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Bảng danh sách đơn theo dõi */}
          <TrackingTable
            orders={filteredOrders}
            loading={loading}
            onViewDetail={handleViewDetail}
          />
        </>
      )}

      {/* Sub-view 2: Màn hình Chi tiết hành trình toàn trang (Có nút Back) */}
      {subView === "detail" && selectedItem && (
        <TrackingDetailView item={selectedItem} onBack={handleBackToList} />
      )}
    </Box>
  )
}
