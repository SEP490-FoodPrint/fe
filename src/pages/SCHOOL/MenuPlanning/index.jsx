import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertTriangle, Info, Plus } from "lucide-react"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import MenuService from "src/services/MenuService"
import {
  getDateOfISOWeek,
  getWeeksOfYear,
  getMenuYear,
  getMenuISOWeek,
  getISOWeekNumber,
  SCHOOL_DAY_LABELS,
  MOCK_SCHOOL_ACADEMIC_YEARS,
  getWeeksOfAcademicYear,
} from "src/services/MenuService/adapter"

import MenuListStatsRail from "./component/MenuListStatsRail"
import MenuListFilterStrip from "./component/MenuListFilterStrip"
import MenuDetailModal from "./component/MenuDetailModal"
import MenuListWeeklyVerticalView from "./component/MenuListWeeklyVerticalView"

export default function MenuPlanning() {
  const navigate = useNavigate()

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const currentWeek = useMemo(() => getISOWeekNumber(new Date()), [])

  // Master data: Ban đầu rỗng, tải 100% từ API thật
  const [menus, setMenus] = useState([])
  const [menusAreMock, setMenusAreMock] = useState(false)
  const [loading, setLoading] = useState(true)

  // Danh sách năm học từ cấu hình toàn trường
  const availableAcademicYears = MOCK_SCHOOL_ACADEMIC_YEARS

  // Filter state: Mặc định lọc Năm học 2026 - 2027 và Tuần này
  const [filters, setFilters] = useState({
    searchKeyword: "",
    academicYear: "2026-2027",
    week: currentWeek,
    mealType: "all",
    status: "all",
  })

  // Cấu hình năm học hiện tại do BGH setup
  const currentAcademicYearConfig = useMemo(() => {
    return (
      availableAcademicYears.find((ay) => ay.academicYear === filters.academicYear) ||
      availableAcademicYears[0]
    )
  }, [availableAcademicYears, filters.academicYear])

  // Danh sách các tuần học thực tế trong năm học
  const schoolWeeks = useMemo(() => {
    return getWeeksOfAcademicYear(currentAcademicYearConfig)
  }, [currentAcademicYearConfig])

  // Tuần đang được chọn
  const selectedWeekObj = useMemo(() => {
    const found = schoolWeeks.find((w) => w.isoWeek === Number(filters.week))
    if (found) return found
    const currentW = schoolWeeks.find((w) => w.isCurrentWeek)
    return currentW || schoolWeeks[0]
  }, [schoolWeeks, filters.week])

  // Tải dữ liệu thực tế từ backend API
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
          setMenusAreMock(false)
        }
      } catch (err) {
        console.warn("Lỗi tải thực đơn:", err)
        if (isMounted) setMenus([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchMenus()
    return () => {
      isMounted = false
    }
  }, [filters.status])

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
      if (field === "academicYear") {
        const targetConfig =
          availableAcademicYears.find((ay) => ay.academicYear === value) ||
          availableAcademicYears[0]
        const nextWeeks = getWeeksOfAcademicYear(targetConfig)
        const defaultWeek = nextWeeks.find((w) => w.isCurrentWeek) || nextWeeks[0]
        next.week = defaultWeek ? defaultWeek.isoWeek : currentWeek
      }
      return next
    })
  }

  const handleResetFilters = () => {
    setFilters({
      searchKeyword: "",
      academicYear: "2026-2027",
      week: currentWeek,
      mealType: "all",
      status: "all",
    })
  }

  const handleFilterByStatus = (statusKey) => {
    handleChangeFilter("status", statusKey)
  }

  // Thống kê nhanh theo trạng thái tuần
  const stats = useMemo(() => {
    const list = Array.isArray(menus) ? menus : []
    const total = list.length
    const draft = list.filter((m) => m.status === "DRAFT").length
    const pending = list.filter((m) => m.status === "PENDING_APPROVAL").length
    const revision = list.filter((m) => m.status === "REVISION_REQUESTED").length
    const approved = list.filter((m) => m.status === "APPROVED").length

    return { total, draft, pending, revision, approved }
  }, [menus])

  // Lọc thực đơn theo các tiêu chí
  const filteredMenus = useMemo(() => {
    const list = Array.isArray(menus) ? menus : []
    const search = filters.searchKeyword.trim().toLowerCase()
    const targetWeek = Number(filters.week)
    const targetYear = selectedWeekObj?.year || currentYear

    return list.filter((item) => {
      const itemWeek = getMenuISOWeek(item)
      const itemYear = getMenuYear(item)

      if (filters.week !== "all") {
        if (itemWeek !== targetWeek || itemYear !== targetYear) {
          return false
        }
      }

      if (filters.mealType !== "all") {
        if (item.mealType !== filters.mealType) {
          return false
        }
      }

      if (filters.status !== "all") {
        if (item.status !== filters.status) {
          return false
        }
      }

      if (search) {
        const nameMatch = item.name?.toLowerCase().includes(search)
        const dishMatch = item.dishes?.some((d) =>
          d.name?.toLowerCase().includes(search)
        )
        if (!nameMatch && !dishMatch) {
          return false
        }
      }

      return true
    })
  }, [menus, filters, selectedWeekObj, currentYear])

  // Danh sách các ngày trong tuần được chọn (Thứ 2 đến Thứ 6)
  const weekSchoolDays = useMemo(() => {
    if (!selectedWeekObj?.startDate) return []
    const monday = selectedWeekObj.startDate
    const pad = (n) => String(n).padStart(2, "0")
    const now = new Date()
    const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`

    const holidays = currentAcademicYearConfig?.holidays || []

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

      const holidayMatch = holidays.find((h) => h.date === dateISO)

      days.push({
        dayOfWeek: i + 1,
        dayLabel: SCHOOL_DAY_LABELS[i + 1] || `Thứ ${i + 2}`,
        dateVN,
        dateISO,
        isToday: dateISO === todayISO,
        isHoliday: Boolean(holidayMatch),
        holidayReason: holidayMatch ? holidayMatch.reason : null,
      })
    }
    return days
  }, [selectedWeekObj, currentAcademicYearConfig])

  // Nhãn tuần được chọn
  const selectedWeekLabel = useMemo(() => {
    return selectedWeekObj?.label || `Tuần ${filters.week}`
  }, [selectedWeekObj, filters.week])

  // Thông tin trạng thái của CẢ TUẦN dựa 100% trên dữ liệu thực tế
  const weekStatusInfo = useMemo(() => {
    const targetWeek = Number(filters.week)
    const yearOfSelectedWeek = selectedWeekObj?.year || currentYear
    const weekMenus = (Array.isArray(menus) ? menus : []).filter((m) => {
      const w = getMenuISOWeek(m)
      const y = getMenuYear(m)
      return w === targetWeek && y === yearOfSelectedWeek
    })

    if (weekMenus.length === 0) {
      return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" }
    }
    if (weekMenus.some((m) => m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED")) {
      const rev = weekMenus.find((m) => m.status === "REVISION_REQUESTED" || m.status === "REVISION_REQUIRED")
      return {
        status: "REVISION_REQUESTED",
        statusLabel: "Yêu cầu chỉnh sửa",
        feedback: rev?.feedback || "Ban Giám Hiệu yêu cầu chỉnh sửa thực đơn tuần này.",
      }
    }
    if (weekMenus.some((m) => m.status === "PENDING_APPROVAL")) {
      return { status: "PENDING_APPROVAL", statusLabel: "Chờ BGH duyệt", feedback: "" }
    }
    if (weekMenus.some((m) => m.status === "DRAFT")) {
      return { status: "DRAFT", statusLabel: "Bản nháp", feedback: "" }
    }
    return { status: "APPROVED", statusLabel: "Đã duyệt BGH", feedback: "" }
  }, [filters.week, selectedWeekObj, currentYear, menus])

  // Tiêu đề của thực đơn tuần được chọn
  const weeklyMenuTitle = useMemo(() => {
    const weekNum = Number(filters.week)
    const weekMenus = menus.filter((m) => {
      const w = getMenuISOWeek(m)
      return w === weekNum
    })

    if (weekMenus.length > 0 && weekMenus[0]?.name) {
      const fullName = weekMenus[0].name
      const prefix = fullName.split(" — ")[0]
      if (prefix && prefix.trim().length > 0) {
        return prefix.trim()
      }
    }

    return `Thực đơn Dinh dưỡng Tuần ${selectedWeekObj?.weekIndex || weekNum}`
  }, [menus, filters.week, selectedWeekObj])

  // Đối tượng áp dụng của thực đơn tuần
  const weeklyTargetScope = useMemo(() => {
    const weekNum = Number(filters.week)
    const weekMenus = menus.filter((m) => getMenuISOWeek(m) === weekNum)
    return weekMenus[0]?.targetScope || "Toàn trường"
  }, [menus, filters.week])

  const isCurrentWeek = useMemo(() => {
    return Boolean(selectedWeekObj?.isCurrentWeek)
  }, [selectedWeekObj])

  // Xử lý gửi BGH duyệt tuần (khi DRAFT)
  const handleSubmitWeeklyMenu = async () => {
    let missingDays = []
    weekSchoolDays.forEach((sd) => {
      if (sd.isHoliday) return

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
        `Chưa thể gửi duyệt: Còn ${missingDays.join(", ")} chưa đủ 2 ca (trưa & xế). Vui lòng hoàn tất trước khi gửi!`,
        "warning"
      )
      return
    }

    const targetWeek = Number(filters.week)
    const weekMenus = menus.filter((m) => getMenuISOWeek(m) === targetWeek)
    const weeklyId = weekMenus[0]?.weeklyMenuId || weekMenus[0]?.id

    if (!weeklyId) {
      showToast("Chưa xác định được mã tuần thực đơn để gửi duyệt.", "warning")
      return
    }

    try {
      await MenuService.submitMenu(weeklyId)
      showToast(
        `Đã gửi thực đơn ${selectedWeekLabel} cho Ban Giám Hiệu phê duyệt thành công!`,
        "success"
      )
      // Tải lại danh sách từ API
      const res = await MenuService.getMenus({ status: filters.status })
      if (Array.isArray(res?.data)) setMenus(res.data)
    } catch (err) {
      showToast(err.message || "Không thể gửi duyệt thực đơn.", "warning")
    }
  }

  // Xử lý gửi lại BGH duyệt (khi REVISION_REQUESTED)
  const handleResubmitWeeklyMenu = async () => {
    const targetWeek = Number(filters.week)
    const weekMenus = menus.filter((m) => getMenuISOWeek(m) === targetWeek)
    const weeklyId = weekMenus[0]?.weeklyMenuId || weekMenus[0]?.id

    if (!weeklyId) {
      showToast("Chưa xác định được mã tuần thực đơn để gửi duyệt lại.", "warning")
      return
    }

    try {
      await MenuService.submitMenu(weeklyId)
      showToast(
        `Đã gửi lại thực đơn ${selectedWeekLabel} đã chỉnh sửa cho Ban Giám Hiệu!`,
        "success"
      )
      const res = await MenuService.getMenus({ status: filters.status })
      if (Array.isArray(res?.data)) setMenus(res.data)
    } catch (err) {
      showToast(err.message || "Không thể gửi lại thực đơn.", "warning")
    }
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

      {/* 1. Tiêu đề màn hình chuẩn mực (Clean, tối giản) */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Danh sách thực đơn</h1>
        <button
          type="button"
          className={styles.createBtn}
          onClick={handleNavigateCreate}
          title="Tạo thực đơn mới"
        >
          <Plus size={16} />
          <span>Tạo thực đơn</span>
        </button>
      </div>

      {/* 2. Dải Quick Status Pills */}
      <MenuListStatsRail
        stats={stats}
        year={selectedWeekObj?.year || currentYear}
        activeStatus={filters.status}
        onFilterByStatus={handleFilterByStatus}
      />

      {/* Section 3: Bộ lọc (Năm học, Tuần học theo BGH, Ca ăn) */}
      <MenuListFilterStrip
        filters={filters}
        academicYearOptions={availableAcademicYears}
        weeks={schoolWeeks}
        onChangeFilter={handleChangeFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Section 4: HIỂN THỊ DUY NHẤT KIỂU TUẦN DỌC CHUẨN MỰC CHO Y TẾ */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-medium">
          Đang tải dữ liệu thực đơn tuần...
        </div>
      ) : (
        <MenuListWeeklyVerticalView
          schoolDays={weekSchoolDays}
          menus={filteredMenus}
          mealTypeFilter={filters.mealType}
          onViewDetail={handleViewDetail}
          onEditMenu={handleEditMenu}
          onNavigateCreate={handleNavigateCreateWithDate}
          selectedWeekLabel={selectedWeekLabel}
          weeklyMenuTitle={weeklyMenuTitle}
          targetScope={weeklyTargetScope}
          isCurrentWeek={isCurrentWeek}
          weekStatus={weekStatusInfo.status}
          weekFeedback={weekStatusInfo.feedback}
          onSubmitWeeklyMenu={handleSubmitWeeklyMenu}
          onResubmitWeeklyMenu={handleResubmitWeeklyMenu}
        />
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
