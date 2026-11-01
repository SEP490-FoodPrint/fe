import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import { MOCK_MENU_LIST } from "./mockMenuListData"

import MenuListHeader from "./component/MenuListHeader"
import MenuListStatsRail from "./component/MenuListStatsRail"
import MenuListFilterStrip from "./component/MenuListFilterStrip"
import MenuListTable from "./component/MenuListTable"
import MenuListPagination from "./component/MenuListPagination"
import MenuDetailModal from "./component/MenuDetailModal"

export default function MenuPlanning() {
  const navigate = useNavigate()

  // Master data
  const [menus] = useState(MOCK_MENU_LIST)

  // Filter state
  const [filters, setFilters] = useState({
    searchKeyword: "",
    dateFilter: "current",
    mealType: "all",
    status: "all"
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Detail Modal state
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Toast notification
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  // Filter changes
  const handleChangeFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setCurrentPage(1) // Reset to first page upon filter change
  }

  const handleResetFilters = () => {
    setFilters({
      searchKeyword: "",
      dateFilter: "all",
      mealType: "all",
      status: "all"
    })
    setCurrentPage(1)
    showToast("Đã đặt lại bộ lọc về mặc định", "info")
  }

  const handleFilterByStatus = (statusValue) => {
    setFilters(prev => ({ ...prev, status: statusValue }))
    setCurrentPage(1)
  }

  // Compute stats for Stats Rail (across all menus)
  const stats = useMemo(() => {
    const total = menus.length
    const needsAction = menus.filter(
      m => m.status === "DRAFT" || m.status === "REVISION_REQUESTED"
    ).length
    const pendingApproval = menus.filter(m => m.status === "PENDING_APPROVAL").length
    const approved = menus.filter(m => m.status === "APPROVED").length

    return { total, needsAction, pendingApproval, approved }
  }, [menus])

  // Filtered menus
  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      // 1. Search keyword (name or code)
      if (filters.searchKeyword.trim()) {
        const kw = filters.searchKeyword.trim().toLowerCase()
        const matchName = menu.name.toLowerCase().includes(kw)
        const matchCode = menu.code.toLowerCase().includes(kw)
        if (!matchName && !matchCode) return false
      }

      // 2. Date filter
      if (filters.dateFilter !== "all") {
        if (filters.dateFilter === "current" && menu.week !== "current") return false
        if (filters.dateFilter === "next" && menu.week !== "next") return false
        if (filters.dateFilter === "prev" && menu.week !== "prev") return false
      }

      // 3. Meal type filter
      if (filters.mealType !== "all") {
        if (menu.mealType !== filters.mealType) return false
      }

      // 4. Status filter
      if (filters.status !== "all") {
        if (filters.status === "needsAction") {
          if (menu.status !== "DRAFT" && menu.status !== "REVISION_REQUESTED") return false
        } else if (menu.status !== filters.status) {
          return false
        }
      }

      return true
    })
  }, [menus, filters])

  // Paginated menus
  const totalItems = filteredMenus.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMenus.slice(start, start + pageSize)
  }, [filteredMenus, currentPage, pageSize])

  // Navigation handlers
  const handleNavigateCreate = () => {
    navigate(ROUTER.SCHOOL_MENU_CREATE)
  }

  const handleEditMenu = (menu) => {
    navigate(ROUTER.SCHOOL_MENU_EDIT.replace(":id", menu.id), { state: { menu } })
  }

  const handleViewDetail = (menu) => {
    navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", menu.id), { state: { menu } })
  }

  return (
    <div className={styles.menuListPage}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === "success" ? "check_circle" : toast.type === "warning" ? "warning" : "info"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Section 1: Header Bar & Actions */}
      <MenuListHeader onNavigateCreate={handleNavigateCreate} />

      {/* Section 2: Compact Minimalist Stats Rail */}
      <MenuListStatsRail
        stats={stats}
        onFilterByStatus={handleFilterByStatus}
      />

      {/* Section 3: Flat Clean Filter Strip */}
      <MenuListFilterStrip
        filters={filters}
        onChangeFilter={handleChangeFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Section 4 & 5: Clean Flat Table with Pagination */}
      <div className={styles.tableCard}>
        <MenuListTable
          menus={paginatedMenus}
          onViewDetail={handleViewDetail}
          onEditMenu={handleEditMenu}
        />
        <MenuListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Detail Modal */}
      <MenuDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        menu={selectedMenu}
        onEditMenu={handleEditMenu}
      />
    </div>
  )
}
