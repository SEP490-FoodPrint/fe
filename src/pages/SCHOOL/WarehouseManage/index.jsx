import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Box } from "@mui/material"
import notice from "src/components/Notice"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import WarehouseService from "src/services/WarehouseService"

import WarehouseHeader from "./component/WarehouseHeader"
import WarehouseStatsRail from "./component/WarehouseStatsRail"
import WarehouseFilterStrip from "./component/WarehouseFilterStrip"
import WarehouseTable from "./component/WarehouseTable"
import WarehousePagination from "./component/WarehousePagination"
import CreateDryOrderView from "./component/CreateDryOrderView"
import WarehouseDetailView from "./component/WarehouseDetailView"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function WarehouseManage() {
  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  // Sub-view: "list" (mặc định) | "create" | "detail"
  const [subView, setSubView] = useState("list")
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemForOrder, setSelectedItemForOrder] = useState(null)

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
  })

  // Pagination state
  const [page, setPage] = useState(1)

  // Tải dữ liệu tồn kho thực tế từ Backend Database
  const loadInventory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await WarehouseService.getWarehouseInventory()
      setInventory(data.items || [])
      setSuppliers(data.suppliers || [])
    } catch (err) {
      console.warn("Lỗi tải dữ liệu tồn kho:", err)
      setInventory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Thống kê nhanh cho StatsRail (Tổng, Báo động < 30%, Cần nhập 30% - 50%, Đủ an toàn >= 50%)
  const stats = useMemo(() => {
    const total = inventory.length
    const criticalLowCount = inventory.filter(
      it => it.safetyStock > 0 && it.currentStock / it.safetyStock < 0.3
    ).length
    const warningCount = inventory.filter(
      it =>
        it.safetyStock > 0 &&
        it.currentStock / it.safetyStock >= 0.3 &&
        it.currentStock / it.safetyStock < 0.5
    ).length
    const safeStockCount = inventory.filter(
      it => it.safetyStock > 0 && it.currentStock / it.safetyStock >= 0.5
    ).length

    return {
      total,
      criticalLowCount,
      warningCount,
      safeStockCount,
    }
  }, [inventory])

  // Danh mục nhóm hàng độc nhất
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map(it => it.category).filter(Boolean)))
  }, [inventory])

  // Xác định active rail filter
  const activeRailFilter = useMemo(() => {
    if (filters.status === "CRITICAL_LOW") return "CRITICAL_LOW"
    if (filters.status === "WARNING") return "WARNING"
    if (filters.status === "SAFE") return "SAFE"
    return "all"
  }, [filters.status])

  // Lọc dữ liệu tồn kho gạo & gia vị
  const filteredInventory = useMemo(() => {
    return inventory.filter(it => {
      const kw = filters.search.trim().toLowerCase()
      const matchSearch =
        !kw ||
        it.name.toLowerCase().includes(kw) ||
        it.code.toLowerCase().includes(kw) ||
        it.supplierName.toLowerCase().includes(kw)

      const matchCategory =
        filters.category === "all" || it.category === filters.category

      const ratio = it.safetyStock > 0 ? it.currentStock / it.safetyStock : 1

      let matchStatus = true
      if (filters.status === "CRITICAL_LOW") {
        matchStatus = ratio < 0.3
      } else if (filters.status === "WARNING") {
        matchStatus = ratio >= 0.3 && ratio < 0.5
      } else if (filters.status === "SAFE") {
        matchStatus = ratio >= 0.5
      }

      return matchSearch && matchCategory && matchStatus
    })
  }, [inventory, filters])

  // Phân trang
  const currentTotal = filteredInventory.length
  const totalPages = Math.ceil(currentTotal / PAGE_SIZE) || 1

  const paginatedInventory = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredInventory.slice(start, start + PAGE_SIZE)
  }, [filteredInventory, page])

  // Handlers
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const handleFilterStat = statId => {
    setPage(1)
    setFilters(prev => ({
      ...prev,
      status: statId, // "all" | "CRITICAL_LOW" | "WARNING" | "SAFE"
    }))
  }

  // Mở màn hình tạo đơn nhập hàng (Sub-view "create")
  const handleOpenCreate = (targetItem = null) => {
    setSelectedItemForOrder(targetItem)
    setSubView("create")
  }

  // Xem chi tiết (Sub-view "detail")
  const handleViewDetail = item => {
    setSelectedItem(item)
    setSubView("detail")
  }

  // Quay lại danh sách
  const handleBackToList = () => {
    setSubView("list")
    setSelectedItem(null)
    setSelectedItemForOrder(null)
  }

  // Submit tạo đơn mới
  const handleCreateOrder = async newOrder => {
    setSubView("list")
    notice({
      msg: `Đã tạo Phiếu nhập hàng ${newOrder.orderNo} (${newOrder.deliverySchedule})! Bạn có thể theo dõi đơn hàng tại mục Theo dõi đơn hàng.`,
      isSuccess: true,
    })
    loadInventory()
  }

  return (
    <Box className={styles.pageContainer}>
      {/* Sub-view 1: Danh sách Quản lý kho (Mặc định) */}
      {subView === "list" && (
        <>
          {/* Header */}
          <WarehouseHeader />

          {/* Thẻ thống kê 4 nhóm: Tổng, Dưới an toàn, An toàn, Chờ giao */}
          <WarehouseStatsRail
            stats={stats}
            activeFilter={activeRailFilter}
            onFilterChange={handleFilterStat}
          />

          {/* Bộ lọc & Tìm kiếm + Nút Lập phiếu nhập đồ khô */}
          <WarehouseFilterStrip
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
            onOpenCreate={() => handleOpenCreate(null)}
          />

          {/* Bảng Dữ liệu Tồn kho hoặc Loading */}
          {loading ? (
            <FoodPrintLoading />
          ) : (
            <>
              <WarehouseTable
                items={paginatedInventory}
                onViewDetail={handleViewDetail}
              />

              {/* Phân trang */}
              <WarehousePagination
                page={page}
                count={totalPages}
                totalItems={currentTotal}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {/* Sub-view 2: Lập phiếu nhập hàng gạo & gia vị (Toàn màn hình sạch đẹp) */}
      {subView === "create" && (
        <CreateDryOrderView
          inventoryItems={inventory}
          suppliers={suppliers}
          initialSelectedItem={selectedItemForOrder}
          onBack={handleBackToList}
          onSubmit={handleCreateOrder}
        />
      )}

      {/* Sub-view 3: Xem chi tiết mặt hàng tồn kho */}
      {subView === "detail" && selectedItem && (
        <WarehouseDetailView
          item={selectedItem}
          onBack={handleBackToList}
          onQuickOrder={handleOpenCreate}
        />
      )}
    </Box>
  )
}
