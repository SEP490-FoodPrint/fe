import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertTriangle, Info, Plus } from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import styles from "./index.module.scss"
import ROUTER from "src/router/ROUTER"
import MenuService from "src/services/MenuService"
import { SCHOOL_DAY_LABELS } from "src/services/MenuService/adapter"

import MenuListStatsRail from "./component/MenuListStatsRail"
import MenuListFilterStrip from "./component/MenuListFilterStrip"
import MenuDetailModal from "./component/MenuDetailModal"
import MenuListWeeklyVerticalView from "./component/MenuListWeeklyVerticalView"

export default function MenuPlanning() {
  const navigate = useNavigate()

  // Master data: Ban đầu rỗng, tải 100% từ API thật
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  // Danh sách năm học từ cấu hình toàn trường
  const [availableAcademicYears, setAvailableAcademicYears] = useState([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarError, setCalendarError] = useState("")

  // Năm học và số tuần đều do BE cung cấp từ cấu hình của trường.
  const [filters, setFilters] = useState({
    searchKeyword: "",
    academicYear: "",
    week: "",
    mealType: "all",
    status: "all",
  })

  // Cấu hình năm học hiện tại do BGH setup
  const currentAcademicYearConfig = useMemo(() => {
    return (
      availableAcademicYears.find((ay) => ay.academicYear === filters.academicYear)
    )
  }, [availableAcademicYears, filters.academicYear])

  // Danh sách các tuần học thực tế trong năm học
  const schoolWeeks = useMemo(() => {
    return currentAcademicYearConfig?.weeks || []
  }, [currentAcademicYearConfig])

  // Tuần đang được chọn
  const selectedWeekObj = useMemo(() => {
    return schoolWeeks.find((w) => w.weekStartDate === filters.week)
  }, [schoolWeeks, filters.week])

  const defaultYear = (years) =>
    years.find((year) => year.isCurrent) || years[0]
  const defaultWeek = (year) =>
    year?.weeks?.find((week) => week.isCurrentWeek) || year?.weeks?.[0]

  useEffect(() => {
    let active = true
    MenuService.getAcademicCalendar({ forceRefresh: true })
      .then(({ academicYears }) => {
        if (!active) return
        setAvailableAcademicYears(academicYears)
        const year = defaultYear(academicYears)
        setFilters((prev) => ({
          ...prev,
          academicYear: year?.academicYear || "",
          week: defaultWeek(year)?.weekStartDate || "",
        }))
      })
      .catch((error) => {
        if (active) setCalendarError(error.message || "Không tải được năm học.")
      })
      .finally(() => {
        if (active) setCalendarLoading(false)
      })
    return () => { active = false }
  }, [])

  // Tải dữ liệu thực tế từ backend API
  useEffect(() => {
    let isMounted = true
    if (!selectedWeekObj) {
      setMenus([])
      setLoading(false)
      return
    }
    const fetchMenus = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const res = await MenuService.getMenus({
          status: filters.status,
          weekStartDate: selectedWeekObj.weekStartDate,
        })
        if (isMounted && Array.isArray(res?.data)) {
          setMenus(res.data)
        }
      } catch (err) {
        console.warn("Lỗi tải thực đơn:", err)
        if (isMounted) {
          setMenus([])
          setLoadError(err.message || "Không tải được thực đơn tuần.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchMenus()
    return () => {
      isMounted = false
    }
  }, [filters.status, selectedWeekObj])

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
          availableAcademicYears.find((ay) => ay.academicYear === value)
        next.week = defaultWeek(targetConfig)?.weekStartDate || ""
      }
      return next
    })
  }

  const handleResetFilters = () => {
    const year = defaultYear(availableAcademicYears)
    setFilters({
      searchKeyword: "",
      academicYear: year?.academicYear || "",
      week: defaultWeek(year)?.weekStartDate || "",
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
    return list.filter((item) => {
      if (!selectedWeekObj || item.rawDate < selectedWeekObj.weekStartDate ||
        item.rawDate > selectedWeekObj.weekEndDate) return false

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
  }, [menus, filters, selectedWeekObj])

  // Danh sách các ngày trong tuần được chọn (Thứ 2 đến Thứ 6)
  const weekSchoolDays = useMemo(() => {
    if (!selectedWeekObj?.weekStartDate) return []
    const monday = new Date(`${selectedWeekObj.weekStartDate}T00:00:00Z`)
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
    return selectedWeekObj?.weekLabel || ""
  }, [selectedWeekObj])

  // Thông tin trạng thái của CẢ TUẦN dựa 100% trên dữ liệu thực tế
  const weekStatusInfo = useMemo(() => {
    const weekMenus = menus

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
  }, [menus])

  // Tiêu đề của thực đơn tuần được chọn
  const weeklyMenuTitle = useMemo(() => {
    return selectedWeekObj ? `Thực đơn tuần ${selectedWeekObj.weekNumber}` : "Thực đơn"
  }, [selectedWeekObj])

  // Đối tượng áp dụng của thực đơn tuần
  const weeklyTargetScope = useMemo(() => {
    return menus[0]?.targetScope || "Toàn trường"
  }, [menus])

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

    const weekMenus = menus
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
      const res = await MenuService.getMenus({ status: filters.status, weekStartDate: filters.week })
      if (Array.isArray(res?.data)) setMenus(res.data)
    } catch (err) {
      showToast(err.message || "Không thể gửi duyệt thực đơn.", "warning")
    }
  }

  // Xử lý gửi lại BGH duyệt (khi REVISION_REQUESTED)
  const handleResubmitWeeklyMenu = async () => {
    const weekMenus = menus
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
      const res = await MenuService.getMenus({ status: filters.status, weekStartDate: filters.week })
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
    navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", menu.id), {
      state: { menu, autoOpenEdit: true },
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
        year={filters.academicYear}
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
      {calendarLoading || loading ? (
        <div style={{ padding: "80px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <FoodPrintLoading />
        </div>
      ) : calendarError || loadError ? (
        <p role="alert">{calendarError || loadError}</p>
      ) : !selectedWeekObj ? (
        <p role="status">Trường chưa có cấu hình năm học. Vui lòng liên hệ Ban Giám Hiệu để thiết lập ngày bắt đầu và kết thúc năm học.</p>
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
