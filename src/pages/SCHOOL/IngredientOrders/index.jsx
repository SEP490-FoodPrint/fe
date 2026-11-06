import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box, Typography } from "@mui/material"
import IngredientOrderService from "src/services/IngredientOrderService"

import OrderListHeader from "./component/OrderListHeader"
import OrderTabViews from "./component/OrderTabViews"
import CatalogStatsRail from "./component/CatalogStatsRail"
import OrderFilterStrip from "./component/OrderFilterStrip"
import CatalogTable from "./component/CatalogTable"
import OrderPagination from "./component/OrderPagination"

// Các component cho Tab Phiếu giao nhận & Nhập hàng (Chỉ danh sách, thống kê, bộ lọc)
import DeliveryStatsRail from "./component/DeliveryStatsRail"
import DeliveryFilterStrip from "./component/DeliveryFilterStrip"
import DeliveryTable from "./component/DeliveryTable"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function IngredientOrders() {
  // Tab 1: Danh mục nguyên liệu
  const [catalog, setCatalog] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)

  // Tab 2: Phiếu giao nhận & Nhập hàng
  const [deliveries, setDeliveries] = useState([])

  // Active tab: "catalog" (mặc định) | "deliveries" | "orders"
  const [activeTab, setActiveTab] = useState("catalog")

  // Filter state cho Danh mục nguyên liệu
  const [filters, setFilters] = useState({
    search: "",
    handlingType: "all",
    supplierId: "all",
  })

  // Filter state cho Phiếu giao nhận
  const [deliveryFilters, setDeliveryFilters] = useState({
    search: "",
    batchType: "all",
    status: "all",
  })

  // Pagination state
  const [page, setPage] = useState(1)

  // Tải dữ liệu ban đầu 1 lần duy nhất khi mount
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [catalogRes, suppliersRes, deliveriesRes] = await Promise.all([
        IngredientOrderService.getMasterIngredientCatalog(),
        IngredientOrderService.getSuppliers(),
        IngredientOrderService.getDeliveries(),
      ])
      if (Array.isArray(catalogRes?.items)) setCatalog(catalogRes.items)
      if (Array.isArray(suppliersRes?.items)) setSuppliers(suppliersRes.items)
      if (Array.isArray(deliveriesRes?.items)) setDeliveries(deliveriesRes.items)
    } catch (err) {
      console.warn("Lỗi tải dữ liệu:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Thống kê cho Danh mục nguyên liệu
  const stats = useMemo(() => {
    return {
      total: catalog.length,
      directUse: catalog.filter(it => it.handlingType === "DIRECT_USE").length,
      dryStock: catalog.filter(it => it.handlingType === "DRY_STOCK").length,
      suppliersCount: suppliers.length,
    }
  }, [catalog, suppliers])

  // Thống kê cho Phiếu giao nhận
  const deliveryStats = useMemo(() => {
    return {
      total: deliveries.length,
      batch1Count: deliveries.filter(d => d.batchType === "BATCH_1").length,
      waitingAttendanceCount: deliveries.filter(d => d.status === "WAITING_ATTENDANCE").length,
      completedCount: deliveries.filter(d => d.status === "COMPLETED").length,
    }
  }, [deliveries])

  // Lọc dữ liệu danh mục ngay tại Client
  const filteredCatalog = useMemo(() => {
    return catalog.filter(it => {
      const matchSearch =
        !filters.search ||
        it.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        it.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        it.supplierName.toLowerCase().includes(filters.search.toLowerCase())

      const matchHandling =
        filters.handlingType === "all" || it.handlingType === filters.handlingType

      const matchSupplier =
        filters.supplierId === "all" || it.supplierId === filters.supplierId

      return matchSearch && matchHandling && matchSupplier
    })
  }, [catalog, filters])

  // Lọc dữ liệu Phiếu giao nhận ngay tại Client
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

  // Phân trang cho Tab hiện tại
  const currentTotalCount =
    activeTab === "catalog" ? filteredCatalog.length : filteredDeliveries.length
  const totalPages = Math.ceil(currentTotalCount / PAGE_SIZE) || 1

  const paginatedCatalog = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredCatalog.slice(start, start + PAGE_SIZE)
  }, [filteredCatalog, page])

  const paginatedDeliveries = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredDeliveries.slice(start, start + PAGE_SIZE)
  }, [filteredDeliveries, page])

  // Handlers cho Tab 1
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      search: "",
      handlingType: "all",
      supplierId: "all",
    })
    setPage(1)
  }

  // Handlers cho Tab 2 (Phiếu giao nhận)
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

  return (
    <Box className={styles.pageContainer}>
      {/* 1. Header */}
      <OrderListHeader />

      {/* 2. Tabs */}
      <OrderTabViews
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab)
          setPage(1)
        }}
        catalogCount={catalog.length}
        deliveriesCount={deliveries.length}
      />

      {/* Nội dung Tab 1: Danh mục nguyên liệu */}
      {activeTab === "catalog" && (
        <>
          {/* Thẻ thống kê Danh mục nguyên liệu */}
          <CatalogStatsRail
            stats={stats}
            onFilterHandlingType={val => handleFilterChange("handlingType", val)}
          />

          {/* Bộ lọc & Tìm kiếm */}
          <OrderFilterStrip
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            suppliers={suppliers}
          />

          {/* Bảng Danh mục nguyên liệu chuẩn (Cách hiểu 1) */}
          <CatalogTable catalog={paginatedCatalog} />

          {/* Phân trang */}
          <OrderPagination
            page={page}
            count={totalPages}
            totalItems={currentTotalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Nội dung Tab 2: Phiếu giao nhận & Nhập hàng (Chỉ danh sách, thống kê, bộ lọc) */}
      {activeTab === "deliveries" && (
        <>
          {/* Thẻ thống kê Phiếu giao nhận (Chia 2 đợt & Nghiệm thu 4 bên) */}
          <DeliveryStatsRail
            stats={deliveryStats}
            activeBatchFilter={deliveryFilters.batchType}
            onFilterBatchType={val => handleDeliveryFilterChange("batchType", val)}
          />

          {/* Bộ lọc & Tìm kiếm */}
          <DeliveryFilterStrip
            filters={deliveryFilters}
            onFilterChange={handleDeliveryFilterChange}
            onResetFilters={handleResetDeliveryFilters}
          />

          {/* Bảng Phiếu giao nhận */}
          <DeliveryTable deliveries={paginatedDeliveries} />

          {/* Phân trang */}
          <OrderPagination
            page={page}
            count={totalPages}
            totalItems={currentTotalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Nội dung Tab 3: Theo dõi đơn hàng (Làm sau cùng với Mục 1) */}
      {activeTab === "orders" && (
        <Box className={styles.placeholderCard}>
          <Typography variant="h6" gutterBottom>
            Tab Theo Dõi Đơn Hàng (Order Tracking)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tab này sẽ được phát triển kết nối sau khi hoàn thiện phân hệ Quản lý Kho đồ khô (Mục 2), để theo dõi liên kết giữa tồn kho và tiến độ cung ứng của NCC.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
