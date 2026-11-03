import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box, Typography } from "@mui/material"
import IngredientOrderService from "src/services/IngredientOrderService"

import OrderListHeader from "./component/OrderListHeader"
import OrderTabViews from "./component/OrderTabViews"
import CatalogStatsRail from "./component/CatalogStatsRail"
import OrderFilterStrip from "./component/OrderFilterStrip"
import CatalogTable from "./component/CatalogTable"
import OrderPagination from "./component/OrderPagination"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function IngredientOrders() {
  const [catalog, setCatalog] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)

  // Active tab: "catalog" (mặc định) | "orders" | "deliveries"
  const [activeTab, setActiveTab] = useState("catalog")

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    handlingType: "all",
    supplierId: "all",
  })

  // Pagination state
  const [page, setPage] = useState(1)

  // Tải dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [catalogRes, suppliersRes] = await Promise.all([
        IngredientOrderService.getMasterIngredientCatalog(filters),
        IngredientOrderService.getSuppliers(),
      ])
      if (Array.isArray(catalogRes?.items)) setCatalog(catalogRes.items)
      if (Array.isArray(suppliersRes?.items)) setSuppliers(suppliersRes.items)
    } catch (err) {
      console.warn("Lỗi tải danh mục nguyên liệu:", err)
    } finally {
      setLoading(false)
    }
  }, [filters])

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

  // Lọc dữ liệu danh mục
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

  // Phân trang
  const totalCount = filteredCatalog.length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredCatalog.slice(start, start + PAGE_SIZE)
  }, [filteredCatalog, page])

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
      />

      {/* Nội dung Tab: Ưu tiên phát triển hoàn thiện Tab Danh mục nguyên liệu */}
      {activeTab === "catalog" ? (
        <>
          {/* 3. Thẻ thống kê Danh mục nguyên liệu */}
          <CatalogStatsRail
            stats={stats}
            onFilterHandlingType={val => handleFilterChange("handlingType", val)}
          />

          {/* 4. Bộ lọc & Tìm kiếm */}
          <OrderFilterStrip
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            suppliers={suppliers}
          />

          {/* 5. Bảng Danh mục nguyên liệu chuẩn (Cách hiểu 1) */}
          <CatalogTable catalog={paginatedData} />

          {/* 6. Phân trang */}
          <OrderPagination
            page={page}
            count={totalPages}
            totalItems={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      ) : (
        <Box className={styles.placeholderCard}>
          <Typography variant="h6" gutterBottom>
            Tab {activeTab === "orders" ? "Đơn đặt hàng (Yêu cầu mua)" : "Phiếu giao nhận & Nhập hàng"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phần này sẽ được phát triển tiếp nối sau khi danh mục nguyên liệu đã được rà soát và chuẩn hóa.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
