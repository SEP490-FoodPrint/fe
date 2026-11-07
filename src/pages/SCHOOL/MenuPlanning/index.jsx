import React, { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, AlertTriangle, Info, Plus } from "lucide-react"
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

  // Master data
  const [menus, setMenus] = useState(MOCK_MENU_LIST)
  const [menusAreMock, setMenusAreMock] = useState(true)
  const [loading, setLoading] = useState(false)

  // Danh sách năm học từ cấu hình toàn trường
  const availableAcademicYears = MOCK_SCHOOL_ACADEMIC_YEARS

  // Filter state: Mặc định lọc Năm học 2026 - 2027 và Tuần này!
  const [filters, setFilters] = useState({
    searchKeyword: "",
    academicYear: "2026-2027",
    week: currentWeek, // Mặc định luôn là tuần này!
    mealType: "all",
    status: "all",
  })

  // Cấu hình năm học hiện tại do BGH setup (chứa startDate, endDate và ngày nghỉ)
  const currentAcademicYearConfig = useMemo(() => {
    return (
      availableAcademicYears.find((ay) => ay.academicYear === filters.academicYear) ||
      availableAcademicYears[0]
    )
  }, [availableAcademicYears, filters.academicYear])

  // Danh sách các tuần học thực tế trong năm học (chạy từ lúc bắt đầu học đến kết thúc)
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
      // Khi lọc trạng thái: chuyển sang tuần tương ứng minh họa
      if (field === "status") {
        if (value === "REVISION_REQUESTED") next.week = 44
        else if (value === "PENDING_APPROVAL") next.week = 46
        else if (value === "DRAFT") next.week = 47
        else if (value === "APPROVED" && next.week !== 45 && next.week !== 43 && next.week !== 42) next.week = 45
      }
      // Khi đổi tuần: nếu bộ lọc trạng thái không khớp với tuần mới, tự động bỏ lọc trạng thái
      if (field === "week") {
        const yearOfSelectedWeek = selectedWeekObj?.year || currentYear
        const info = getWeeklyMenuStatus(value, yearOfSelectedWeek, menus)
        if (next.status !== "all" && next.status !== info.status) {
          next.status = "all"
        }
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
    showToast("Đã đặt lại bộ lọc về Năm học 2026 - 2027 (Tuần này)", "info")
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
  }

  // Thống kê cho Quick Status Pills
  const stats = useMemo(() => {
    if (filters.academicYear === "2026-2027") {
      return {
        total: 6,
        draft: 1,
        pendingApproval: 1,
        approved: 3,
        revisionRequested: 1,
      }
    }
    const yearMenus = menus.filter((m) => getMenuYear(m) === 2025)
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
  }, [menus, filters.academicYear])

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

      // 2. Lọc theo Tuần trong năm học
      if (selectedWeekObj) {
        if (menu.rawDate) {
          if (
            menu.rawDate < selectedWeekObj.startDateISO ||
            menu.rawDate > selectedWeekObj.endDateISO
          ) {
            return false
          }
        } else {
          const mWeek = getMenuISOWeek(menu)
          if (mWeek !== selectedWeekObj.isoWeek) return false
        }
      }

      // 3. Lọc theo Ca ăn
      if (filters.mealType !== "all") {
        if (menu.mealType !== filters.mealType) return false
      }

      // 4. Lọc theo Trạng thái
      if (filters.status !== "all") {
        if (menu.status !== filters.status) return false
      }

      return true
    })
  }, [menus, filters, selectedWeekObj])

  // Danh sách các ngày trong tuần được chọn (Thứ 2 đến Thứ 6)
  // Tích hợp ngày nghỉ do BGH setup
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

      // Kiểm tra ngày nghỉ do BGH cấu hình
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

  // Thông tin trạng thái của CẢ TUẦN
  const weekStatusInfo = useMemo(() => {
    const yearOfSelectedWeek = selectedWeekObj?.year || currentYear
    return getWeeklyMenuStatus(filters.week, yearOfSelectedWeek, menus)
  }, [filters.week, selectedWeekObj, currentYear, menus])

  // Tiêu đề của thực đơn tuần được chọn
  const weeklyMenuTitle = useMemo(() => {
    const weekNum = Number(filters.week)
    // 1. Tìm menu trong tuần này có trường name
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

    // 2. Tra cứu theo bản đồ tuần chuẩn
    const titlesByWeek = {
      42: "Thực đơn Năng lượng Thể chất Tuần 42",
      43: "Thực đơn Dinh dưỡng Tăng trưởng Tuần 43",
      44: "Thực đơn Cân bằng Khẩu phần Tuần 44",
      45: "Thực đơn Tiêu chuẩn Tuần 45",
      46: "Thực đơn Cải thiện Năng lượng Tuần 46",
      47: "Thực đơn Soạn thảo Tuần 47",
    }

    if (titlesByWeek[weekNum]) {
      return titlesByWeek[weekNum]
    }

    return `Thực đơn Dinh dưỡng Tuần ${selectedWeekObj?.weekIndex || weekNum}`
  }, [menus, filters.week, selectedWeekObj])

  // Đối tượng áp dụng của thực đơn tuần
  const weeklyTargetScope = useMemo(() => {
    const weekNum = Number(filters.week)
    const weekMenus = menus.filter((m) => getMenuISOWeek(m) === weekNum)
    return weekMenus[0]?.targetScope || "Toàn trường (Khối 6 – 9)"
  }, [menus, filters.week])

  const isCurrentWeek = useMemo(() => {
    return Boolean(selectedWeekObj?.isCurrentWeek)
  }, [selectedWeekObj])

  // Xử lý gửi BGH duyệt tuần (khi DRAFT)
  const handleSubmitWeeklyMenu = () => {
    let missingDays = []
    weekSchoolDays.forEach((sd) => {
      // Ngày nghỉ theo lịch BGH không tính là thiếu ca
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
