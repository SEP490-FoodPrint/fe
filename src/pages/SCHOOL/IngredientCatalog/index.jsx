import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import IngredientOrderService from "src/services/IngredientOrderService"
import { adaptCatalogItem } from "src/services/IngredientOrderService/adapter"
import {
  MOCK_MASTER_INGREDIENT_CATALOG,
  MOCK_SUPPLIERS,
} from "src/pages/SCHOOL/IngredientOrders/mockData"

import CatalogHeader from "./component/CatalogHeader"
import CatalogStatsRail from "./component/CatalogStatsRail"
import CatalogFilterStrip from "./component/CatalogFilterStrip"
import CatalogTable from "./component/CatalogTable"
import CatalogPagination from "./component/CatalogPagination"

import styles from "./index.module.scss"

const PAGE_SIZE = 10

export default function IngredientCatalog() {
  const [catalog, setCatalog] = useState(() => MOCK_MASTER_INGREDIENT_CATALOG.map(adaptCatalogItem))
  const [suppliers, setSuppliers] = useState(() => MOCK_SUPPLIERS)
  const [, setLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    handlingType: "all",
    supplierId: "all",
  })

  // Pagination state
  const [page, setPage] = useState(1)

  // Fetch dữ liệu từ service
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [catalogRes, suppliersRes] = await Promise.all([
        IngredientOrderService.getMasterIngredientCatalog(),
        IngredientOrderService.getSuppliers(),
      ])
      if (Array.isArray(catalogRes?.items)) setCatalog(catalogRes.items)
      if (Array.isArray(suppliersRes?.items)) setSuppliers(suppliersRes.items)
    } catch (err) {
      console.warn("Lỗi tải danh mục nguyên liệu:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Thống kê cho thẻ stats
  const stats = useMemo(() => {
    return {
      total: catalog.length,
      directUse: catalog.filter(it => it.handlingType === "DIRECT_USE").length,
      dryStock: catalog.filter(it => it.handlingType === "DRY_STOCK").length,
      suppliersCount: suppliers.length,
    }
  }, [catalog, suppliers])

  // Lọc dữ liệu
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
  const totalPages = Math.ceil(filteredCatalog.length / PAGE_SIZE) || 1
  const paginatedCatalog = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredCatalog.slice(start, start + PAGE_SIZE)
  }, [filteredCatalog, page])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  return (
    <Box className={styles.pageContainer}>
      {/* 1. Header */}
      <CatalogHeader />

      {/* 2. Thẻ thống kê 4 nhóm */}
      <CatalogStatsRail
        stats={stats}
        onFilterHandlingType={val => handleFilterChange("handlingType", val)}
      />

      {/* 3. Bộ lọc & Tìm kiếm */}
      <CatalogFilterStrip
        filters={filters}
        onFilterChange={handleFilterChange}
        suppliers={suppliers}
      />

      {/* 4. Bảng danh mục */}
      <CatalogTable catalog={paginatedCatalog} />

      {/* 5. Phân trang */}
      <CatalogPagination
        page={page}
        count={totalPages}
        totalItems={filteredCatalog.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </Box>
  )
}
