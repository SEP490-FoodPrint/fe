import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box, Typography } from "@mui/material"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import notice from "src/components/Notice"
import IngredientOrderService from "src/services/IngredientOrderService"

import DeliveryHeader from "./component/DeliveryHeader"
import DeliveryStatsRail from "./component/DeliveryStatsRail"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTable from "./component/DeliveryTable"
import DeliveryDetailView from "./component/DeliveryDetailView"
import CreateDeliveryView from "./component/CreateDeliveryView"
import OrderPagination from "./component/OrderPagination"

import StockAlertPanel from "src/components/StockAlertPanel"
import styles from "./index.module.scss"

const PAGE_SIZE = 10

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

export default function IngredientOrders() {
  const todayStr = useMemo(() => getTodayStr(), [])

  // Dữ liệu Phiếu giao nhận & Thực đơn duyệt
  const [deliveries, setDeliveries] = useState([])
  const [approvedMenus, setApprovedMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  // Sub-view: "list" (mặc định) | "create" | "detail"
  const [deliverySubView, setDeliverySubView] = useState("list")
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  // Ngày được chọn khi mở màn hình Tạo đơn (để tự động nhận diện Đợt 1 / Đợt 2)
  const [createTargetDate, setCreateTargetDate] = useState(() => getTodayStr())

  // Filter state cho Phiếu giao nhận - MẶC ĐỊNH LỌC TỪ HÔM NAY ĐI TIẾP ĐẾN TƯƠNG LAI
  const [deliveryFilters, setDeliveryFilters] = useState({
    search: "",
    batchType: "all",
    status: "all",
    timeScope: "today_forward",
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
      if (Array.isArray(deliveriesRes?.items))
        setDeliveries(deliveriesRes.items)
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

  // Thống kê cho Phiếu giao nhận (chỉ tính đồ tươi 2 đợt theo bộ lọc thời gian)
  const deliveryStats = useMemo(() => {
    const freshOnly = deliveries.filter(d => {
      if (d.batchType === "DRY_STOCK" || d.orderType === "DRY_STOCK")
        return false
      const delivDate = String(d.deliveryDate || "").slice(0, 10)
      if (deliveryFilters.timeScope === "today_forward") {
        if (delivDate && delivDate < todayStr) return false
      } else if (deliveryFilters.timeScope === "past") {
        if (delivDate && delivDate >= todayStr) return false
      }
      return true
    })
    return {
      total: freshOnly.length,
      batch1Count: freshOnly.filter(d => d.batchType === "BATCH_1").length,
      batch2Count: freshOnly.filter(d => d.batchType === "BATCH_2").length,
      completedCount: freshOnly.filter(
        d =>
          d.status === "COMPLETED" ||
          d.status === "RECEIVED" ||
          d.status === "APPROVED",
      ).length,
    }
  }, [deliveries, deliveryFilters.timeScope, todayStr])

  // Lọc dữ liệu Phiếu giao nhận tại Client
  const filteredDeliveries = useMemo(() => {
    const list = deliveries.filter(d => {
      // Phiếu nhập hàng chỉ hiển thị đồ tươi 2 đợt, không hiển thị đồ lưu kho
      if (d.batchType === "DRY_STOCK" || d.orderType === "DRY_STOCK")
        return false

      // Lọc theo mốc thời gian: Mặc định là từ hôm nay đi tiếp đến tương lai
      const delivDate = String(d.deliveryDate || "").slice(0, 10)
      if (deliveryFilters.timeScope === "today_forward") {
        if (delivDate && delivDate < todayStr) return false
      } else if (deliveryFilters.timeScope === "past") {
        if (delivDate && delivDate >= todayStr) return false
      }

      const kw = deliveryFilters.search.toLowerCase()
      const matchSearch =
        !kw ||
        d.deliveryNo?.toLowerCase().includes(kw) ||
        d.orderNo?.toLowerCase().includes(kw) ||
        d.supplierName?.toLowerCase().includes(kw) ||
        d.menuName?.toLowerCase().includes(kw)

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

    // Sắp xếp:
    // Nếu là từ hôm nay trở đi: Sắp xếp tăng dần theo ngày (từ hôm nay -> tương lai)
    // Cùng ngày: Đợt 1 (05:30) trước Đợt 2 (07:45)
    return list.sort((a, b) => {
      const dateA = String(a.deliveryDate || "")
      const dateB = String(b.deliveryDate || "")
      if (deliveryFilters.timeScope === "today_forward") {
        const dDiff = dateA.localeCompare(dateB)
        if (dDiff !== 0) return dDiff
        const timeA =
          a.deliveryTime || (a.batchType === "BATCH_1" ? "05:30" : "07:45")
        const timeB =
          b.deliveryTime || (b.batchType === "BATCH_1" ? "05:30" : "07:45")
        return timeA.localeCompare(timeB)
      }
      // Ngược lại (tất cả hoặc quá khứ): ngày mới nhất lên đầu (desc)
      const dDiff = dateB.localeCompare(dateA)
      if (dDiff !== 0) return dDiff
      const timeA =
        a.deliveryTime || (a.batchType === "BATCH_1" ? "05:30" : "07:45")
      const timeB =
        b.deliveryTime || (b.batchType === "BATCH_1" ? "05:30" : "07:45")
      return timeB.localeCompare(timeA)
    })
  }, [deliveries, deliveryFilters, todayStr])

  // Phân trang
  const totalPages = Math.ceil(filteredDeliveries.length / PAGE_SIZE) || 1
  const paginatedDeliveries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredDeliveries.slice(start, start + PAGE_SIZE)
  }, [filteredDeliveries, page])

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages))
    }
  }, [page, totalPages])

  // Handlers cho bộ lọc
  const handleDeliveryFilterChange = (field, value) => {
    setDeliveryFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleResetDeliveryFilters = () => {
    setDeliveryFilters({
      search: "",
      batchType: "all",
      status: "all",
      timeScope: "today_forward",
    })
    setPage(1)
  }

  // Xem chi tiết phiếu giao nhận
  const handleViewDetail = async deliveryItem => {
    setSelectedDelivery(deliveryItem)
    setDeliverySubView("detail")

    if (!deliveryItem?.items || deliveryItem.items.length === 0) {
      setDetailLoading(true)
      try {
        const fullDetail = await IngredientOrderService.getDeliveryDetail(
          deliveryItem.id,
          deliveryItem,
        )
        if (fullDetail) {
          setSelectedDelivery(fullDetail)
        }
      } catch (err) {
        console.warn("Lỗi tải chi tiết đơn hàng:", err)
      } finally {
        setDetailLoading(false)
      }
    }
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
        msg: "Đã tạo đơn Đợt 1. Đợt 2 tạo sau khi chốt sĩ số.",
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
        msg: `Đã tạo đơn Đợt 2: giao bù ${res.remainingPortions} suất`,
        isSuccess: true,
      })
    }
  }

  // Cập nhật sĩ số GVCN cho Đợt 2 (trong màn xem chi tiết)
  // Chưa có API sửa sĩ số từ màn này: không được báo đã chốt khi chưa lưu.
  const handleConfirmAttendance = () => {
    notice({
      msg: "Chưa hỗ trợ sửa sĩ số tại đây. GVCN chốt sĩ số của lớp.",
      isSuccess: false,
    })
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Sub-view 1: Bảng Danh sách Phiếu giao nhận (Mặc định) */}
      {deliverySubView === "list" && (
        <>
          {/* Header */}
          <DeliveryHeader />

          {/* Đồ lưu kho thiếu từ hôm nay / ngày mai */}
          <StockAlertPanel levels={["URGENT"]} />

          {/* Thẻ thống kê Phiếu giao nhận (Chia 2 đợt & Nghiệm thu 4 bên) */}
          <DeliveryStatsRail
            stats={deliveryStats}
            activeBatchFilter={deliveryFilters.batchType}
            onFilterBatchType={val =>
              handleDeliveryFilterChange("batchType", val)
            }
          />

          {/* Bộ lọc & Tìm kiếm + Nút Tạo yêu cầu mua hàng */}
          <DeliveryFilterStrip
            filters={deliveryFilters}
            onFilterChange={handleDeliveryFilterChange}
            onResetFilters={handleResetDeliveryFilters}
            onOpenCreate={() => {
              setCreateTargetDate(todayStr)
              setDeliverySubView("create")
            }}
          />

          {/* Bảng Phiếu giao nhận hoặc Loading Spinner */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 10,
                gap: 2,
                bgcolor: "#ffffff",
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                my: 2,
              }}
            >
              <FoodPrintLoading size="large" />
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 500 }}
              >
                Đang tải danh sách phiếu nhập thực phẩm tươi sống...
              </Typography>
            </Box>
          ) : (
            <>
              <DeliveryTable
                deliveries={paginatedDeliveries}
                onViewDetail={handleViewDetail}
                onAddBatch2={item => {
                  setCreateTargetDate(
                    String(item.deliveryDate || "").slice(0, 10),
                  )
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
        </>
      )}

      {/* Sub-view 2: Tạo Đơn Mua Hàng Từ Thực Đơn (Tự động nhận diện Đợt 1 / Đợt 2 theo Ngày) */}
      {deliverySubView === "create" && (
        <CreateDeliveryView
          loading={loading}
          menus={approvedMenus}
          deliveries={deliveries}
          initialDate={createTargetDate}
          onBack={handleBackToList}
          onSubmitBatch1={handleCreateBatch1Order}
          onSubmitBatch2={handleCreateBatch2Order}
        />
      )}

      {/* Sub-view 3: Chi tiết Phiếu giao nhận & Nghiệm thu 4 bên */}
      {deliverySubView === "detail" &&
        selectedDelivery &&
        (detailLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 12,
              gap: 2,
              bgcolor: "#ffffff",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              my: 2,
            }}
          >
            <FoodPrintLoading size="large" />
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontWeight: 500 }}
            >
              Đang tải chi tiết phiếu nhập hàng và danh sách nguyên liệu...
            </Typography>
          </Box>
        ) : (
          <DeliveryDetailView
            delivery={selectedDelivery}
            onBack={handleBackToList}
            onConfirmAttendance={handleConfirmAttendance}
          />
        ))}
    </Box>
  )
}
