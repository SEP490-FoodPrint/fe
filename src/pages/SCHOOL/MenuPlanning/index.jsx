import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertTriangle, Info, Table, Columns3 } from "lucide-react"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import { MOCK_MENU_LIST, getWeeklyMenuStatus } from "./mockMenuListData"
import MenuService from "src/services/MenuService"
import {
  getDateOfISOWeek,
  getWeeksOfYear,
  getMenuYear,
  getMenuISOWeek,
  getISOWeekNumber,
  SCHOOL_DAY_LABELS,
} from "src/services/MenuService/adapter"

import MenuListHeader from "./component/MenuListHeader"
import MenuListStatsRail from "./component/MenuListStatsRail"
import MenuListFilterStrip from "./component/MenuListFilterStrip"
import MenuListTable from "./component/MenuListTable"
import MenuListPagination from "./component/MenuListPagination"
import MenuDetailModal from "./component/MenuDetailModal"
import MenuListWeeklyVerticalView from "./component/MenuListWeeklyVerticalView"

export default function MenuPlanning() {
  const navigate = useNavigate()

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const currentWeek = useMemo(() => getISOWeekNumber(new Date()), [])

  // Master data
  const [menus, setMenus] = useState(MOCK_MENU_LIST)
  const [menusAreMock, setMenusAreMock] = useState(true)
  const [loading, setLoading] = useState(false)

  // Chế độ xem: "vertical" (Kiểu dọc theo tuần - Mặc định) hoặc "table" (Kiểu bảng)
  const [viewMode, setViewMode] = useState("vertical")

  // Filter state: Mặc định lọc năm hiện tại và Tuần này!
  const [filters, setFilters] = useState({
    searchKeyword: "",
    year: currentYear,
    week: currentWeek, // Mặc định luôn là tuần này!
    mealType: "all",
    status: "all",
  })

  // Tải dữ liệu thực tế từ backend hoặc fallback mock
  useEffect(() => {
    let isMounted = true
    const fetchMenus = async () => {
      setLoading(true)
      try {
        const res = await MenuService.getMenus({
          status: filters.status,
        })
        if (isMounted && Array.isArray(res?.data)) {
          setMenus(res.data)
          setMenusAreMock(Boolean(res.isMock))
        }
      } catch (err) {
        console.warn("Lỗi tải thực đơn:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchMenus()
    return () => {
      isMounted = false
    }
  }, [filters.status])

  // Pagination state (dành cho chế độ bảng)
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
    }, 3500)
  }

  // Filter changes
  const handleChangeFilter = (field, value) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "year" && next.week !== "all") {
        if (Number(value) === currentYear) {
          next.week = currentWeek
        }
      }
      // Khi lọc trạng thái: chuyển sang tuần tương ứng minh họa
      if (field === "status") {
        if (value === "REVISION_REQUESTED") next.week = 44
        else if (value === "PENDING_APPROVAL") next.week = 46
        else if (value === "DRAFT") next.week = 47
        else if (value === "APPROVED" && next.week !== 45 && next.week !== 43 && next.week !== 42) next.week = 45
      }
      // Khi đổi tuần: nếu bộ lọc trạng thái không khớp với tuần mới, tự động bỏ lọc trạng thái
      if (field === "week" && value !== "all") {
        const info = getWeeklyMenuStatus(value, next.year, menus)
        if (next.status !== "all" && next.status !== info.status) {
          next.status = "all"
        }
      }
      return next
    })
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      searchKeyword: "",
      year: currentYear,
      week: currentWeek,
      mealType: "all",
      status: "all",
    })
    setViewMode("vertical")
    setCurrentPage(1)
    showToast("Đã đặt lại bộ lọc về Tuần này", "info")
  }

  const handleFilterByStatus = (statusValue) => {
    setFilters((prev) => {
      const next = { ...prev, status: statusValue }
      if (statusValue === "REVISION_REQUESTED") {
        next.week = 44
      } else if (statusValue === "PENDING_APPROVAL") {
        next.week = 46
      } else if (statusValue === "DRAFT") {
        next.week = 47
      } else if (statusValue === "APPROVED") {
        next.week = 45
      } else if (statusValue === "all") {
        next.week = currentWeek
      }
      return next
    })
    setCurrentPage(1)
  }

  // Thống kê cho Quick Status Pills
  const stats = useMemo(() => {
    const targetYear = Number(filters.year) || currentYear
    if (targetYear === 2026) {
      return {
        total: 6,
        draft: 1,
        pendingApproval: 1,
        approved: 3,
        revisionRequested: 1,
      }
    }
    const yearMenus = menus.filter((m) => getMenuYear(m) === targetYear)
    const total = yearMenus.length
    const draft = yearMenus.filter((m) => m.status === "DRAFT").length
    const pendingApproval = yearMenus.filter(
      (m) => m.status === "PENDING_APPROVAL"
    ).length
    const approved = yearMenus.filter((m) => m.status === "APPROVED").length
    const revisionRequested = yearMenus.filter(
      (m) => m.status === "REVISION_REQUESTED"
    ).length

    return { total, draft, pendingApproval, approved, revisionRequested }
  }, [menus, filters.year, currentYear])

  // Lọc danh sách thực đơn
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      // 1. Tìm kiếm tên món, tên thực đơn hoặc mã
      if (filters.searchKeyword.trim()) {
        const kw = filters.searchKeyword.trim().toLowerCase()
        const matchName = menu.name.toLowerCase().includes(kw)
        const matchCode = menu.code.toLowerCase().includes(kw)
        const matchDish = menu.dishes?.some((d) => d.name?.toLowerCase().includes(kw))
        if (!matchName && !matchCode && !matchDish) return false
      }

      // 2. Lọc theo Năm
      const mYear = getMenuYear(menu)
      if (filters.year && mYear !== Number(filters.year)) {
        return false
      }

      // 3. Lọc theo Tuần
      if (filters.week !== "all") {
        const targetWeek = Number(filters.week)
        const mWeek = getMenuISOWeek(menu)
        if (mWeek !== targetWeek) {
          const isMatchRelative =
            (targetWeek === currentWeek && menu.week === "current") ||
            (targetWeek === currentWeek - 1 && menu.week === "prev") ||
            (targetWeek === currentWeek + 1 && menu.week === "next")
          if (!isMatchRelative) return false
        }
      }

      // 4. Lọc theo Ca ăn
      if (filters.mealType !== "all") {
        if (menu.mealType !== filters.mealType) return false
      }

      // 5. Lọc theo Trạng thái
      if (filters.status !== "all") {
        if (menu.status !== filters.status) return false
      }

      return true
    })
  }, [menus, filters, currentWeek])

  // Danh sách các ngày trong tuần được chọn
  const weekSchoolDays = useMemo(() => {
    if (filters.week === "all") return []
    const monday = getDateOfISOWeek(
      Number(filters.week),
      Number(filters.year) || currentYear
    )
    const pad = (n) => String(n).padStart(2, "0")
    const now = new Date()
    const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`

    const days = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday)
      d.setUTCDate(monday.getUTCDate() + i)
      const dateVN = `${pad(d.getUTCDate())}/${pad(
        d.getUTCMonth() + 1
      )}/${d.getUTCFullYear()}`
      const dateISO = `${d.getUTCFullYear()}-${pad(
        d.getUTCMonth() + 1
      )}-${pad(d.getUTCDate())}`
      days.push({
        dayOfWeek: i + 1,
        dayLabel: SCHOOL_DAY_LABELS[i + 1] || `Thứ ${i + 2}`,
        dateVN,
        dateISO,
        isToday: dateISO === todayISO,
      })
    }
    return days
  }, [filters.week, filters.year, currentYear])

  // Nhãn tuần được chọn
  const selectedWeekLabel = useMemo(() => {
    if (filters.week === "all") {
      return `Tất cả các tuần năm ${filters.year}`
    }
    const weeks = getWeeksOfYear(Number(filters.year) || currentYear)
    const found = weeks.find((w) => w.weekNumber === Number(filters.week))
    return found ? found.label : `Tuần ${filters.week}/${filters.year}`
  }, [filters.week, filters.year, currentYear])

  // Thông tin trạng thái của CẢ TUẦN
  const weekStatusInfo = useMemo(() => {
    return getWeeklyMenuStatus(filters.week, filters.year, menus)
  }, [filters.week, filters.year, menus])

  const isCurrentWeek = useMemo(() => {
    return (
      Number(filters.year) === currentYear &&
      Number(filters.week) === currentWeek
    )
  }, [filters.year, filters.week, currentYear, currentWeek])

  // Paginated menus (dành cho chế độ bảng)
  const totalItems = filteredMenus.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMenus.slice(start, start + pageSize)
  }, [filteredMenus, currentPage, pageSize])

  // Xử lý gửi BGH duyệt tuần (khi DRAFT)
  const handleSubmitWeeklyMenu = () => {
    let missingDays = []
    weekSchoolDays.forEach((sd) => {
      const dayMenus = filteredMenus.filter(
        (m) => m.rawDate === sd.dateISO || m.date === sd.dateVN
      )
      const hasLunch = dayMenus.some((m) => m.mealType === "LUNCH")
      const hasAfternoon = dayMenus.some((m) => m.mealType === "AFTERNOON")
      if (!hasLunch || !hasAfternoon) {
        missingDays.push(sd.dayLabel)
      }
    })

    if (missingDays.length > 0) {
      showToast(
        `Chưa thể gửi duyệt: Còn ${missingDays.join(", ")} chưa đủ 2 ca (trưa & xế). Vui lòng hoàn tất 5 ngày trước khi gửi!`,
        "warning"
      )
      return
    }

    const targetWeek = Number(filters.week)
    setMenus((prev) =>
      prev.map((m) => {
        const mWeek = getMenuISOWeek(m)
        if (mWeek === targetWeek) {
          return {
            ...m,
            status: "PENDING_APPROVAL",
            statusLabel: "Chờ BGH duyệt",
          }
        }
        return m
      })
    )
    showToast(
      `Đã gửi thực đơn ${selectedWeekLabel} cho Ban Giám Hiệu phê duyệt thành công!`,
      "success"
    )
  }

  // Xử lý gửi lại BGH duyệt (khi REVISION_REQUESTED)
  const handleResubmitWeeklyMenu = () => {
    const targetWeek = Number(filters.week)
    setMenus((prev) =>
      prev.map((m) => {
        const mWeek = getMenuISOWeek(m)
        if (mWeek === targetWeek) {
          return {
            ...m,
            status: "PENDING_APPROVAL",
            statusLabel: "Chờ BGH duyệt",
          }
        }
        return m
      })
    )
    showToast(
      `Đã gửi lại thực đơn ${selectedWeekLabel} đã chỉnh sửa cho Ban Giám Hiệu!`,
      "success"
    )
  }

  // Navigation handlers
  const handleNavigateCreate = () => {
    navigate(ROUTER.SCHOOL_MENU_CREATE)
  }

  const handleNavigateCreateWithDate = (dateISO, mealType) => {
    navigate(ROUTER.SCHOOL_MENU_CREATE, {
      state: { initialDate: dateISO, initialMealType: mealType },
    })
  }

  const handleEditMenu = (menu) => {
    navigate(ROUTER.SCHOOL_MENU_EDIT.replace(":id", menu.id), {
      state: { menu },
    })
  }

  const handleViewDetail = (menu) => {
    navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", menu.id), {
      state: { menu },
    })
  }

  return (
    <div className={styles.menuListPage}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.type === "warning" && <AlertTriangle size={16} />}
          {toast.type === "info" && <Info size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Section 1: Header Bar & Actions Clean */}
      <MenuListHeader onNavigateCreate={handleNavigateCreate} />

      {/* Section 2: Quick Status Filter Pills (Tối giản, icon trực quan) */}
      <MenuListStatsRail
        stats={stats}
        year={filters.year}
        activeStatus={filters.status}
        onFilterByStatus={handleFilterByStatus}
      />

      {/* Section 3: Bộ lọc Phẳng (Năm, Tuần, Ca ăn) */}
      <MenuListFilterStrip
        filters={filters}
        onChangeFilter={handleChangeFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Section 4: Hiển thị Danh sách thực đơn kiểu dọc tuần (Mặc định) hoặc Kiểu bảng */}
      {viewMode === "vertical" && filters.week !== "all" ? (
        <MenuListWeeklyVerticalView
          schoolDays={weekSchoolDays}
          menus={filteredMenus}
          mealTypeFilter={filters.mealType}
          onViewDetail={handleViewDetail}
          onEditMenu={handleEditMenu}
          onNavigateCreate={handleNavigateCreateWithDate}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          selectedWeekLabel={selectedWeekLabel}
          isCurrentWeek={isCurrentWeek}
          weekStatus={weekStatusInfo.status}
          weekFeedback={weekStatusInfo.feedback}
          onSubmitWeeklyMenu={handleSubmitWeeklyMenu}
          onResubmitWeeklyMenu={handleResubmitWeeklyMenu}
        />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableTopBar}>
            <div className={styles.tableModeLabel}>
              <Table size={16} />
              <span>
                Bảng danh sách thực đơn ({filteredMenus.length} thực đơn)
              </span>
            </div>
            <div className={styles.tableModeActions}>
              {filters.week !== "all" && (
                <button
                  type="button"
                  className={styles.switchModeBtn}
                  onClick={() => setViewMode("vertical")}
                  title="Chuyển sang kiểu dọc theo tuần"
                >
                  <Columns3 size={14} />
                  <span>Xem kiểu dọc</span>
                </button>
              )}
            </div>
          </div>
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
      )}

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
