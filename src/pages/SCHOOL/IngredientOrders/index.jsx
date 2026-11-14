import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import notice from "src/components/Notice"
import IngredientOrderService from "src/services/IngredientOrderService"

import DeliveryHeader from "./component/DeliveryHeader"
import DeliveryStatsRail from "./component/DeliveryStatsRail"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTable from "./component/DeliveryTable"
import DeliveryDetailView from "./component/DeliveryDetailView"
import CreateDeliveryView from "./component/CreateDeliveryView"
import OrderPagination from "./component/OrderPagination"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function IngredientOrders() {
  // Dữ liệu Phiếu giao nhận & Thực đơn duyệt
  const [deliveries, setDeliveries] = useState([])
  const [approvedMenus, setApprovedMenus] = useState([])
  const [, setLoading] = useState(false)

  // Sub-view: "list" (mặc định) | "create" | "detail"
  const [deliverySubView, setDeliverySubView] = useState("list")
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  // Ngày được chọn khi mở màn hình Tạo đơn (để tự động nhận diện Đợt 1 / Đợt 2)
  const [createTargetDate, setCreateTargetDate] = useState("2026-10-27")

  // Filter state cho Phiếu giao nhận
  const [deliveryFilters, setDeliveryFilters] = useState({
    search: "",
    batchType: "all",
    status: "all",
  })

  // Pagination state
  const [page, setPage] = useState(1)

  // Tải dữ liệu ban đầu khi mount
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [deliveriesRes, menusRes] = await Promise.all([
        IngredientOrderService.getDeliveries(),
        IngredientOrderService.getApprovedMenus(),
      ])
      if (Array.isArray(deliveriesRes?.items)) setDeliveries(deliveriesRes.items)
      if (Array.isArray(menusRes?.items)) setApprovedMenus(menusRes.items)
    } catch (err) {
      console.warn("Lỗi tải dữ liệu phiếu giao nhận:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Thống kê cho Phiếu giao nhận
  const deliveryStats = useMemo(() => {
    return {
      total: deliveries.length,
      batch1Count: deliveries.filter(d => d.batchType === "BATCH_1").length,
      batch2Count: deliveries.filter(d => d.batchType === "BATCH_2").length,
      completedCount: deliveries.filter(
        d =>
          d.status === "COMPLETED" ||
          d.status === "RECEIVED" ||
          d.status === "APPROVED"
      ).length,
    }
  }, [deliveries])

  // Lọc dữ liệu Phiếu giao nhận tại Client
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const kw = deliveryFilters.search.toLowerCase()
      const matchSearch =
        !kw ||
        d.deliveryNo.toLowerCase().includes(kw) ||
        d.orderNo.toLowerCase().includes(kw) ||
        d.supplierName.toLowerCase().includes(kw) ||
        d.menuName.toLowerCase().includes(kw)

      let matchBatch = true
      if (deliveryFilters.batchType === "BATCH_1") {
        matchBatch = d.batchType === "BATCH_1"
      } else if (deliveryFilters.batchType === "BATCH_2") {
        matchBatch = d.batchType === "BATCH_2"
      } else if (deliveryFilters.batchType === "WAITING_ATTENDANCE") {
        matchBatch = d.status === "WAITING_ATTENDANCE"
      } else if (deliveryFilters.batchType === "COMPLETED") {
        matchBatch = d.status === "COMPLETED"
      }

      const matchStatus =
        deliveryFilters.status === "all" || d.status === deliveryFilters.status

      return matchSearch && matchBatch && matchStatus
    })
  }, [deliveries, deliveryFilters])

  // Phân trang
  const totalPages = Math.ceil(filteredDeliveries.length / PAGE_SIZE) || 1
  const paginatedDeliveries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredDeliveries.slice(start, start + PAGE_SIZE)
  }, [filteredDeliveries, page])

  // Handlers cho bộ lọc
  const handleDeliveryFilterChange = (field, value) => {
    setDeliveryFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const handleResetDeliveryFilters = () => {
    setDeliveryFilters({
      search: "",
      batchType: "all",
      status: "all",
    })
    setPage(1)
  }

  // Xem chi tiết phiếu giao nhận
  const handleViewDetail = deliveryItem => {
    setSelectedDelivery(deliveryItem)
    setDeliverySubView("detail")
  }

  // Quay lại danh sách phiếu giao nhận
  const handleBackToList = () => {
    setDeliverySubView("list")
    setSelectedDelivery(null)
  }

  // 1. TẠO ĐƠN MUA HÀNG ĐỢT 1
  const handleCreateBatch1Order = async orderData => {
    const res = await IngredientOrderService.createBatch1Order(orderData)
    if (res?.success) {
      const refreshed = await IngredientOrderService.getDeliveries()
      if (Array.isArray(refreshed?.items)) setDeliveries(refreshed.items)
      setDeliverySubView("list")

      notice({
        msg: `Đã tạo Đơn mua hàng Đợt 1 ${res.orderNo} (Thực phẩm tươi sống ca sáng)! Bạn có thể tiếp tục tạo Đợt 2 khi GVCN chốt sĩ số sáng.`,
        isSuccess: true,
      })
    }
  }

  // 2. TẠO ĐƠN GIAO HÀNG ĐỢT 2 (THEO SĨ SỐ GVCN)
  const handleCreateBatch2Order = async orderData => {
    const res = await IngredientOrderService.createBatch2Order(orderData)
    if (res?.success) {
      const refreshed = await IngredientOrderService.getDeliveries()
      if (Array.isArray(refreshed?.items)) setDeliveries(refreshed.items)
      setDeliverySubView("list")

      notice({
        msg: `Đã chốt và tạo Đơn giao hàng Đợt 2 theo sĩ số (${res.actualAttendance} HS) — Giao bù ${res.remainingPortions} suất!`,
        isSuccess: true,
      })
    }
  }

  // Cập nhật sĩ số GVCN cho Đợt 2 (trong màn xem chi tiết)
  const handleConfirmAttendance = async (deliveryId, actualCount) => {
    const res = await IngredientOrderService.updateBatch2Attendance(deliveryId, actualCount)
    if (res?.success) {
      const refreshed = await IngredientOrderService.getDeliveries()
      if (Array.isArray(refreshed?.items)) setDeliveries(refreshed.items)
      if (res.delivery) setSelectedDelivery(res.delivery)
      notice({
        msg: `Đã chốt sĩ số Đợt 2 (${actualCount} học sinh). Số lượng nguyên liệu đã được tính lại và gửi sang NCC!`,
        isSuccess: true,
      })
    } else {
      notice({
        msg: "Không thể cập nhật sĩ số. Vui lòng thử lại.",
        isSuccess: false,
      })
    }
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Sub-view 1: Bảng Danh sách Phiếu giao nhận (Mặc định) */}
      {deliverySubView === "list" && (
        <>
          {/* Header */}
          <DeliveryHeader />

          {/* Thẻ thống kê Phiếu giao nhận (Chia 2 đợt & Nghiệm thu 4 bên) */}
          <DeliveryStatsRail
            stats={deliveryStats}
            activeBatchFilter={deliveryFilters.batchType}
            onFilterBatchType={val => handleDeliveryFilterChange("batchType", val)}
          />

          {/* Bộ lọc & Tìm kiếm + Nút Tạo yêu cầu mua hàng */}
          <DeliveryFilterStrip
            filters={deliveryFilters}
            onFilterChange={handleDeliveryFilterChange}
            onResetFilters={handleResetDeliveryFilters}
            onOpenCreate={() => {
              setCreateTargetDate("2026-10-27")
              setDeliverySubView("create")
            }}
          />

          {/* Bảng Phiếu giao nhận */}
          <DeliveryTable
            deliveries={paginatedDeliveries}
            onViewDetail={handleViewDetail}
            onAddBatch2={item => {
              setCreateTargetDate(item.deliveryDate)
              setDeliverySubView("create")
            }}
          />

          {/* Phân trang */}
          <OrderPagination
            page={page}
            count={totalPages}
            totalItems={filteredDeliveries.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Sub-view 2: Tạo Đơn Mua Hàng Từ Thực Đơn (Tự động nhận diện Đợt 1 / Đợt 2 theo Ngày) */}
      {deliverySubView === "create" && (
        <CreateDeliveryView
          menus={approvedMenus}
          deliveries={deliveries}
          initialDate={createTargetDate}
          onBack={handleBackToList}
          onSubmitBatch1={handleCreateBatch1Order}
          onSubmitBatch2={handleCreateBatch2Order}
        />
      )}

      {/* Sub-view 3: Chi tiết Phiếu giao nhận & Nghiệm thu 4 bên */}
      {deliverySubView === "detail" && selectedDelivery && (
        <DeliveryDetailView
          delivery={selectedDelivery}
          onBack={handleBackToList}
          onConfirmAttendance={handleConfirmAttendance}
        />
      )}
    </Box>
  )
}
