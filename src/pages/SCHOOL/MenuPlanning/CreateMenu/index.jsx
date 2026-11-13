import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Loader2,
  RotateCcw,
} from "lucide-react"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import http from "src/services/01_axios"
import MenuService from "src/services/MenuService"
import {
  parseDateVNToISO,
  formatDateVN,
  getSchoolWeekScheduleFromDate,
  menuWeekMeals,
  menuDayWrite,
} from "src/services/MenuService/adapter"

import CreateMenuHeader from "../component/CreateMenuHeader"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"

import CreateMenuWeeklyGrid from "./CreateMenuWeeklyGrid"
import CreateMenuDayModal from "./CreateMenuDayModal"
import MenuAllergyReport from "../component/MenuAllergyReport"

export default function CreateMenu() {
  const [allergyReport, setAllergyReport] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const initialDate = location.state?.initialDate
  const initialMealType = location.state?.initialMealType

  // Hàm lấy ngày hôm nay theo định dạng DD/MM/YYYY (bỏ qua T7, CN)
  const getTodayFormatted = () => {
    if (initialDate) {
      if (initialDate.includes("-")) {
        const parts = initialDate.split("-")
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return initialDate
    }
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const currentDay = now.getDay()
    const daysSinceMonday = (currentDay + 6) % 7
    const weekendOffset = currentDay === 0 || currentDay === 6 ? 7 : 0
    now.setDate(now.getDate() - daysSinceMonday + weekendOffset)
    const d = String(now.getDate()).padStart(2, "0")
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const y = now.getFullYear()
    return `${d}/${m}/${y}`
  }

  // 1. Quản lý ngày xem xét & thông tin tuần
  const [currentDateVN, setCurrentDateVN] = useState(getTodayFormatted())
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(currentDateVN)
  }, [currentDateVN])
  const [academicWeek, setAcademicWeek] = useState(null)
  const schoolDays = useMemo(() => (weekInfo?.schoolDays || []).map(day => {
    const stored = academicWeek?.days?.find(d => d.date === day.dateISO)
    return {...day, isHoliday: stored?.isHoliday || false, holidayReason: stored?.holidayReason || null}
  }), [weekInfo, academicWeek])

  // 2. Thông tin thực đơn tuần
  const [menuTitle, setMenuTitle] = useState("")

  // Danh mục 5 khối lớp chuẩn tiểu học
  const GRADE_OPTIONS = useMemo(
    () => [
      { id: "school", label: "Toàn trường" },
    ],
    []
  )

  // Mặc định chọn tất cả các khối
  const [selectedGrades, setSelectedGrades] = useState([
    "school",
  ])
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false)
  const gradeDropdownRef = useRef(null)

  // Tính toán nhãn hiển thị cho Đối tượng áp dụng
  const targetScopeText = useMemo(() => {
    if (selectedGrades.length === 0) return ""
    if (selectedGrades.length === GRADE_OPTIONS.length) {
      return "Toàn trường"
    }
    return GRADE_OPTIONS.filter((g) => selectedGrades.includes(g.id))
      .map((g) => g.label)
      .join(", ")
  }, [selectedGrades, GRADE_OPTIONS])

  const [targetScope, setTargetScope] = useState(targetScopeText)

  // Luôn đồng bộ targetScope theo các khối đã chọn
  useEffect(() => {
    setTargetScope(targetScopeText)
  }, [targetScopeText])

  // Click outside để tự động đóng dropdown khối lớp
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        gradeDropdownRef.current &&
        !gradeDropdownRef.current.contains(event.target)
      ) {
        setIsGradeDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleToggleGrade = (gradeId) => {
    setSelectedGrades((prev) => {
      if (prev.includes(gradeId)) {
        return prev.filter((id) => id !== gradeId)
      } else {
        return [...prev, gradeId]
      }
    })
  }

  const handleToggleAllGrades = () => {
    if (selectedGrades.length === GRADE_OPTIONS.length) {
      setSelectedGrades([])
    } else {
      setSelectedGrades(GRADE_OPTIONS.map((g) => g.id))
    }
  }

  // Chỉ dùng số tuần và năm học được API tính từ cấu hình của trường.
  useEffect(() => {
    if (!menuTitle && academicWeek?.weekNumber != null) {
      setMenuTitle(
        `Thực đơn tuần ${academicWeek.weekNumber}`
      )
    }
  }, [academicWeek, menuTitle])

  // 3. Dữ liệu thực đơn của cả tuần (5 ngày x 2 ca + gia vị của ngày)
  const [weeklyMeals, setWeeklyMeals] = useState({})
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [scheduleError, setScheduleError] = useState("")
  const [saving, setSaving] = useState(false)
  const saveLock = useRef(false)

  // 4. Modal Chi tiết Ngày (50/50: Nửa trái Preview ngày, Nửa phải Chọn món & Nhập gia vị)
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dayData: null,
    mealType: initialMealType || "LUNCH",
    tab: "DISHES",
  })

  // 5. Modal Xác nhận gửi duyệt, Modal Sao chép tuần trước & Toast
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [showCopyConfirmModal, setShowCopyConfirmModal] = useState(false)
  const [preCopyMealsSnapshot, setPreCopyMealsSnapshot] = useState(null)
  const [hasCopiedPreviousWeek, setHasCopiedPreviousWeek] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  // Nạp lịch tuần từ backend API
  useEffect(() => {
    let active = true
    const weekStart = schoolDays[0]?.dateISO
    if (!weekStart) return

    setLoadingSchedule(true)
    setScheduleError("")
    setWeeklyMeals({})
    setDayModalState(prev => ({ ...prev, isOpen: false }))
    setAcademicWeek(null)
    setHasCopiedPreviousWeek(false)
    setPreCopyMealsSnapshot(null)
    MenuService.getWeekSchedule(weekStart)
      .then((res) => {
        if (!active) return
        setAcademicWeek(res.data)
        if (res.data.weeklyMenuTitle) setMenuTitle(res.data.weeklyMenuTitle)
        const days = res?.data?.days || []
        const mapped = {}
        days.forEach((day) => {
          if (day.date) {
            mapped[day.date] = {
              ...day,
              LUNCH: day.meals?.LUNCH?.dishes || [],
              AFTERNOON: day.meals?.AFTERNOON?.dishes || [],
              seasonings: Array.isArray(day.seasonings) ? day.seasonings : [],
              seasoningsByMeal: day.seasoningsByMeal || { LUNCH: [], AFTERNOON: [] },
              portionGroupsByMeal: day.portionGroupsByMeal || {},
              substituteDish: day.substituteDish || null,
              substitutesByMeal: day.substitutesByMeal || { LUNCH: {}, AFTERNOON: {} },
            }
          }
        })

        schoolDays.forEach((sd) => {
          if (!mapped[sd.dateISO]) {
            mapped[sd.dateISO] = {
              LUNCH: [],
              AFTERNOON: [],
              seasonings: [],
            }
          }
        })

        setWeeklyMeals(mapped)
      })
      .catch((err) => {
        if (active) setScheduleError(err.message)
        console.warn("Lỗi tải lịch thực đơn tuần:", err)
      })
      .finally(() => {
        if (active) setLoadingSchedule(false)
      })

    return () => {
      active = false
    }
  }, [schoolDays[0]?.dateISO])

  // Điều hướng tuần (Tuần trước / Tuần sau)
  const handleShiftWeek = useCallback((offset) => {
    if (!currentDateVN) return
    const currentISO = parseDateVNToISO(currentDateVN)
    if (!currentISO) return
    const curDate = new Date(currentISO)
    curDate.setDate(curDate.getDate() + offset * 7)
    const newDateVN = formatDateVN(curDate.toISOString().slice(0, 10))
    setCurrentDateVN(newDateVN)
    setAcademicWeek(null)
    setMenuTitle("")
    setHasCopiedPreviousWeek(false)
    setPreCopyMealsSnapshot(null)
  }, [currentDateVN])

  // Mở Popup Modal Chi tiết ngày (50/50)
  const handleOpenDayModal = useCallback((dayData, mealType = "LUNCH", tab = "DISHES") => {
    const stored = weeklyMeals[dayData.dateISO]
    if (loadingSchedule || scheduleError || saving || dayData.isHoliday || academicWeek?.weeklyMenuStatus === "APPROVED" || stored?.canEdit === false || stored?.approvalStatus === "APPROVED") return
    setDayModalState({
      isOpen: true,
      dayData,
      mealType,
      tab,
    })
  }, [weeklyMeals, loadingSchedule, scheduleError, academicWeek, saving])

  const handleCloseDayModal = useCallback(() => {
    setDayModalState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  // Cập nhật dữ liệu từ DayModal vào weeklyMeals
  const handleSaveDayFromModal = useCallback(
    async ({
      dateISO,
      LUNCH,
      AFTERNOON,
      seasonings,
      seasoningsByMeal,
      useDishRecipes,
      portionGroupsByMeal,
      substituteDish,
      substitutesByMeal,
    }) => {
      const stored = weeklyMeals[dateISO]
      if (stored?.canEdit === false || stored?.approvalStatus === "APPROVED" || academicWeek?.weeklyMenuStatus === "APPROVED") throw new Error("Thực đơn đã duyệt chỉ được xem.")
      if (academicWeek?.weeklyMenuId && academicWeek.weeklyMenuStatus === "PENDING_APPROVAL") {
        await MenuService.saveMenuDay(academicWeek.weeklyMenuId, { dateISO, LUNCH, AFTERNOON, seasonings, seasoningsByMeal, useDishRecipes, portionGroupsByMeal, substituteDish, substitutesByMeal }, { submit: true })
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
        return
      }
      setWeeklyMeals((prev) => ({
        ...prev,
        [dateISO]: {
          ...prev[dateISO],
          LUNCH,
          AFTERNOON,
          seasonings,
          seasoningsByMeal,
          useDishRecipes,
          portionGroupsByMeal,
          substituteDish,
          substitutesByMeal,
        },
      }))
      showToast("Đã cập nhật ngày trong bản soạn thảo. Bấm Lưu hoặc Gửi BGH để ghi nhận.", "success")
    },
    [weeklyMeals, academicWeek, navigate]
  )

  // Thống kê tổng số món của cả tuần
  const totalWeeklyDishesCount = useMemo(() => {
    let count = 0
    Object.values(weeklyMeals).forEach((day) => {
      if (Array.isArray(day?.LUNCH)) count += day.LUNCH.length
      if (Array.isArray(day?.AFTERNOON)) count += day.AFTERNOON.length
    })
    return count
  }, [weeklyMeals])

  // Tính số ngày đã hoàn thành đủ 2 ca
  const completedDaysCount = useMemo(() => {
    let count = 0
    schoolDays.forEach((sd) => {
      if (sd.isHoliday) return
      const dayData = weeklyMeals[sd.dateISO] || {}
      const hasLunch = Array.isArray(dayData.LUNCH) && dayData.LUNCH.length > 0
      const hasAfternoon =
        Array.isArray(dayData.AFTERNOON) && dayData.AFTERNOON.length > 0
      if (hasLunch && hasAfternoon) count += 1
    })
    return count
  }, [schoolDays, weeklyMeals])

  // 6. Xử lý Sao chép từ thực đơn tuần trước
  const handleTriggerCopyPreviousWeek = async () => {
    const currentMondayISO = schoolDays[0]?.dateISO
    if (!currentMondayISO) {
      showToast("Chưa xác định được tuần học hiện tại", "warning")
      return
    }

    // Nếu tuần này đã có món ăn, hỏi xác nhận để tránh mất dữ liệu dở dang
    if (totalWeeklyDishesCount > 0) {
      setShowCopyConfirmModal(true)
      return
    }

    // Nếu tuần hiện tại đang trống, thực hiện sao chép ngay
    await executeCopyPreviousWeek()
  }

  const executeCopyPreviousWeek = async () => {
    setIsCopying(true)
    setShowCopyConfirmModal(false)

    try {
      const currentMondayISO = schoolDays[0]?.dateISO
      if (!currentMondayISO) throw new Error("Chưa có ngày bắt đầu tuần")

      // Lưu snapshot của thực đơn hiện tại trước khi thực hiện sao chép
      const currentSnapshot = JSON.parse(JSON.stringify(weeklyMeals))

      // Tính ngày Thứ Hai tuần trước (-7 ngày)
      const prevDate = new Date(`${currentMondayISO}T00:00:00Z`)
      prevDate.setUTCDate(prevDate.getUTCDate() - 7)
      const prevMondayISO = prevDate.toISOString().slice(0, 10)

      let sourceDays = []
      let sourceLabel = "tuần trước"

      // Bước 1: Thử lấy lịch thực đơn tuần trước qua MenuService.getWeekSchedule
      try {
        const prevScheduleRes = await MenuService.getWeekSchedule(prevMondayISO)
        const days = prevScheduleRes?.data?.days || []
        const hasAnyDishes = days.some(
          (d) =>
            (d.meals?.LUNCH?.dishes?.length || 0) > 0 ||
            (d.meals?.AFTERNOON?.dishes?.length || 0) > 0
        )
        if (hasAnyDishes) {
          sourceDays = days
          sourceLabel = prevScheduleRes?.data?.weekLabel || "tuần trước"
        }
      } catch (err) {
        console.warn("Không tải được schedule tuần trước:", err)
      }

      // Bước 2: Nếu tuần trước rỗng, tìm thực đơn đã có gần nhất
      if (!sourceDays.length) {
        try {
          const menusRes = await MenuService.getMenus({ limit: 10 })
          const menuList = Array.isArray(menusRes?.data)
            ? menusRes.data
            : Array.isArray(menusRes)
            ? menusRes
            : []
          const prevMenu =
            menuList.find(
              (m) => m.weekStartDate && m.weekStartDate < currentMondayISO
            ) || menuList.find((m) => m.weekStartDate !== currentMondayISO)

          if (prevMenu?.id) {
            const detailRes = await http.get(`/v1/menus/${prevMenu.id}`, {
              notifyOnError: false,
            })
            if (detailRes?.data) {
              sourceDays = menuWeekMeals(detailRes.data)
              sourceLabel = prevMenu.title || `thực đơn ${prevMenu.weekStartDate}`
            }
          }
        } catch (err) {
          console.warn("Không tìm thấy thực đơn gần nhất:", err)
        }
      }

      // Nếu không tìm thấy thực đơn nào trước đó trên hệ thống
      if (!sourceDays.length) {
        showToast(
          "Không tìm thấy dữ liệu thực đơn của tuần trước để sao chép",
          "warning"
        )
        return
      }

      // Bước 3: Ánh xạ thực đơn theo các thứ trong tuần (Thứ Hai -> Thứ Sáu)
      const newWeeklyMeals = { ...weeklyMeals }
      let copiedCount = 0

      schoolDays.forEach((sd, index) => {
        if (sd.isHoliday || weeklyMeals[sd.dateISO]?.canEdit === false || weeklyMeals[sd.dateISO]?.approvalStatus === "APPROVED") return

        const srcDay =
          sourceDays[index] ||
          sourceDays.find((d, dIdx) => dIdx === index) ||
          sourceDays.find((d) => d.targetDayOfWeek === (index + 2))
        if (!srcDay) return

        const lunchDishes = (srcDay.meals?.LUNCH?.dishes || []).map((d) => ({
          ...d,
        }))
        const afternoonDishes = (
          srcDay.meals?.AFTERNOON?.dishes || []
        ).map((d) => ({ ...d }))

        const seasonings = Array.isArray(srcDay.seasonings)
          ? srcDay.seasonings.map((s) => ({ ...s }))
          : []

        const seasoningsByMeal = srcDay.seasoningsByMeal
          ? {
              LUNCH: (srcDay.seasoningsByMeal.LUNCH || []).map((s) => ({
                ...s,
              })),
              AFTERNOON: (srcDay.seasoningsByMeal.AFTERNOON || []).map((s) => ({
                ...s,
              })),
            }
          : { LUNCH: [], AFTERNOON: [] }

        newWeeklyMeals[sd.dateISO] = {
          ...weeklyMeals[sd.dateISO],
          LUNCH: lunchDishes,
          AFTERNOON: afternoonDishes,
          seasonings,
          seasoningsByMeal,
          portionGroupsByMeal: Object.fromEntries(Object.entries(srcDay.portionGroupsByMeal || {}).map(([mealType, groups]) => [mealType, groups.map(({ id, ...group }) => group)])),
          persistedMeals: undefined,
          useDishRecipes: true,
          substitutesByMeal: srcDay.substitutesByMeal || { LUNCH: {}, AFTERNOON: {} },
          substituteDish: srcDay.substituteDish || null,
        }

        copiedCount += lunchDishes.length + afternoonDishes.length
      })

      setWeeklyMeals(newWeeklyMeals)
      setPreCopyMealsSnapshot(currentSnapshot)
      setHasCopiedPreviousWeek(true)
      showToast(
        `Đã sao chép thành công ${copiedCount} món ăn từ ${sourceLabel}!`,
        "success"
      )
    } catch (error) {
      console.error("Lỗi khi sao chép thực đơn tuần trước:", error)
      showToast(
        "Không thể sao chép thực đơn: " + (error.message || "Lỗi xử lý"),
        "warning"
      )
    } finally {
      setIsCopying(false)
    }
  }

  // 7. Xử lý Bỏ sao chép (Undo khôi phục thực đơn trước khi sao chép)
  const handleUndoCopyPreviousWeek = () => {
    if (!preCopyMealsSnapshot) return
    setWeeklyMeals(preCopyMealsSnapshot)
    setHasCopiedPreviousWeek(false)
    setPreCopyMealsSnapshot(null)
    showToast("Đã bỏ sao chép và khôi phục thực đơn trước đó!", "info")
  }

  // Chuẩn hóa payload theo đúng schema MenuWrite của Backend
  const buildWeeklyMenuPayload = () => ({
    weekStartDate: schoolDays[0]?.dateISO,
    title: menuTitle.trim(),
    days: schoolDays.flatMap(sd => {
      const day = weeklyMeals[sd.dateISO]
      if (!day) return []
      const payload = menuDayWrite({ ...day, dateISO: sd.dateISO })
      return payload.meals.length ? [payload] : []
    }),
  })

  const handleSaveDraft = async () => {
    if (!menuTitle.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi lưu", "warning")
      return
    }

    if (!targetScope.trim()) {
      showToast("Vui lòng nhập đối tượng áp dụng cho thực đơn", "warning")
      return
    }

    const payload = buildWeeklyMenuPayload()
    if (!payload.days.length) {
      showToast("Vui lòng thêm ít nhất một món ăn vào thực đơn tuần trước khi lưu", "warning")
      return
    }

    if (saveLock.current || loadingSchedule || scheduleError) return
    saveLock.current = true
    setSaving(true)
    try {
      const response = await http.post("/v1/menus", payload, { notifyOnError: false })
      MenuService.invalidateMenuCache()
      if (!Array.isArray(response?.data?.allergyChecks)) {
        showToast("Đã lưu bản nháp nhưng chưa nhận được kết quả đối soát dị ứng từ máy chủ.", "warning")
        return
      }
      setAllergyReport(response.data)
      if (response.data.hasUnresolvedAllergies) {
        showToast("Đã lưu nháp. Cần hoàn thiện nhóm suất riêng trước khi gửi duyệt.", "warning")
        return
      }
      showToast("Đã lưu bản nháp thực đơn tuần thành công trên hệ thống!", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1000)
    } catch (err) {
      showToast("Không thể lưu bản nháp: " + (err.message || "Lỗi máy chủ"), "warning")
    } finally {
      saveLock.current = false
      setSaving(false)
    }
  }

  // Mở modal xác nhận gửi duyệt
  const handleOpenConfirmSubmit = () => {
    if (!menuTitle.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi gửi duyệt", "warning")
      return
    }
    if (!targetScope.trim()) {
      showToast("Vui lòng nhập đối tượng áp dụng trước khi gửi duyệt", "warning")
      return
    }
    if (totalWeeklyDishesCount === 0) {
      showToast("Vui lòng thêm ít nhất một món ăn vào thực đơn tuần", "warning")
      return
    }
    setIsConfirmModalOpen(true)
  }

  // Xác nhận gửi Ban Giám Hiệu duyệt (gọi API thực tế)
  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    const payload = buildWeeklyMenuPayload()
    if (!payload.days.length) {
      showToast("Vui lòng thêm ít nhất một món ăn trước khi gửi duyệt", "warning")
      return
    }

    if (saveLock.current || loadingSchedule || scheduleError) return
    saveLock.current = true
    setSaving(true)
    try {
      if (academicWeek?.weeklyMenuId && academicWeek.weeklyMenuStatus === "PENDING_APPROVAL") {
        await http.post(`/v1/menus/${academicWeek.weeklyMenuId}/revise-and-submit`, payload, { notifyOnError: false })
        MenuService.invalidateMenuCache()
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
        return
      }
      const createRes = await http.post("/v1/menus", payload, { notifyOnError: false })
      MenuService.invalidateMenuCache()
      if (!Array.isArray(createRes?.data?.allergyChecks)) {
        showToast("Đã lưu bản nháp nhưng chưa nhận được kết quả đối soát dị ứng; chưa gửi duyệt.", "warning")
        return
      }
      setAllergyReport(createRes.data)
      if (createRes.data.hasUnresolvedAllergies) {
        showToast("Đã lưu nháp. Cần hoàn thiện nhóm suất riêng trước khi gửi duyệt.", "warning")
        return
      }
      const menuId = createRes?.data?.id || createRes?.id
      if (!menuId) throw new Error("Đã gửi yêu cầu lưu nhưng phản hồi thiếu mã thực đơn; chưa thể gửi duyệt.")
      await MenuService.submitMenu(menuId)
      MenuService.invalidateMenuCache()
      showToast(
        "Đã gửi thực đơn tuần lên Ban Giám hiệu phê duyệt thành công!",
        "success"
      )
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1200)
    } catch (err) {
      showToast("Lỗi gửi duyệt: " + (err.message || "Không thể gửi thực đơn"), "warning")
    } finally {
      saveLock.current = false
      setSaving(false)
    }
  }

  const weekRangeText =
    schoolDays.length >= 5
      ? `${schoolDays[0].dateVN.slice(0, 5)} – ${schoolDays[4].dateVN}`
      : ""

  return (
    <div className={styles.pageContainer}>
      {/* Toast thông báo */}
      {toast && (
        <div className={`${styles.toastNotice} ${styles[toast.type]}`}>
          {toast.type === "success" && <CheckCircle2 size={16} />}
          {toast.type === "warning" && <AlertTriangle size={16} />}
          {toast.type === "info" && <Info size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Header trang chuẩn mực */}
        <MenuAllergyReport report={allergyReport}/>
        <CreateMenuHeader
          onBack={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
          statusLabel="Bản nháp mới"
        />

        {/* 1. THANH ĐIỀU KHIỂN ĐẦU TRANG: CHỌN TUẦN & THÔNG TIN THỰC ĐƠN */}
        <div className={styles.topControlsCard}>
          <div className={styles.controlsTopRow}>
            {/* Bộ chọn tuần */}
            <div className={styles.weekStepper}>
              <button
                type="button"
                className={styles.weekNavBtn}
                onClick={() => handleShiftWeek(-1)}
                title="Chuyển sang tuần trước"
                aria-label="Tuần trước"
              >
                <ChevronLeft size={16} />
              </button>
              <span className={styles.weekRangeText}>
                {academicWeek?.weekLabel ? `${academicWeek.weekLabel} • ` : ""}{weekRangeText}
              </span>
              <button
                type="button"
                className={styles.weekNavBtn}
                onClick={() => handleShiftWeek(1)}
                title="Chuyển sang tuần sau"
                aria-label="Tuần sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Thống kê tiến độ tuần */}
            <div className={styles.weekQuickStats}>
              <span className={styles.statPill}>
                Tiến độ: <strong>{completedDaysCount}/{schoolDays.filter(d=>!d.isHoliday).length}</strong> ngày học đủ 2 ca
              </span>
              <span className={styles.statPill}>
                Tổng số món: <strong>{totalWeeklyDishesCount}</strong> món
              </span>
            </div>
          </div>

          {/* Dòng nhập Tên thực đơn & Đối tượng áp dụng (Đã bỏ gợi ý thừa, bố cục cân đối) */}
          <div className={styles.controlsInputsRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Tên thực đơn tuần <span className={styles.inputRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.textInput}
                value={menuTitle}
                disabled={loadingSchedule || saving || Boolean(scheduleError) || Object.values(weeklyMeals).some(day => day.approvalStatus === "APPROVED") || academicWeek?.weeklyMenuStatus === "APPROVED"}
                onChange={(e) => setMenuTitle(e.target.value)}
                placeholder="Nhập tên thực đơn tuần..."
              />
            </div>

            {/* Select sổ xuống có checkbox chọn nhiều khối lớp */}
            <div className={styles.inputGroup} ref={gradeDropdownRef}>
              <label className={styles.inputLabel}>
                Đối tượng áp dụng <span className={styles.inputRequired}>*</span>
              </label>

              <div className={styles.multiSelectContainer}>
                <div
                  className={`${styles.selectTrigger} ${
                    isGradeDropdownOpen ? styles.selectTriggerOpen : ""
                  }`}
                  onClick={() => setIsGradeDropdownOpen((prev) => !prev)}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="listbox"
                  aria-expanded={isGradeDropdownOpen}
                >
                  <span
                    className={`${styles.selectValueText} ${
                      !targetScopeText ? styles.selectPlaceholder : ""
                    }`}
                  >
                    {targetScopeText || "Chọn khối lớp áp dụng..."}
                  </span>
                  {isGradeDropdownOpen ? (
                    <ChevronUp size={16} className={styles.selectChevron} />
                  ) : (
                    <ChevronDown size={16} className={styles.selectChevron} />
                  )}
                </div>

                {isGradeDropdownOpen && (
                  <div className={styles.selectDropdownMenu} role="listbox">
                    {/* Mục Chọn tất cả */}
                    <label className={styles.dropdownOptionAll}>
                      <input
                        type="checkbox"
                        className={styles.dropdownCheckbox}
                        checked={
                          selectedGrades.length === GRADE_OPTIONS.length
                        }
                        onChange={handleToggleAllGrades}
                      />
                      <span className={styles.dropdownOptionTextBold}>
                        Toàn trường
                      </span>
                    </label>

                    {/* Danh sách từng khối lớp */}
                    <div className={styles.dropdownOptionsList}>
                      {GRADE_OPTIONS.map((grade) => {
                        const isChecked = selectedGrades.includes(grade.id)
                        return (
                          <label
                            key={grade.id}
                            className={styles.dropdownOptionItem}
                          >
                            <input
                              type="checkbox"
                              className={styles.dropdownCheckbox}
                              checked={isChecked}
                              onChange={() => handleToggleGrade(grade.id)}
                            />
                            <span className={styles.dropdownOptionText}>
                              {grade.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 1 HÀNG DÀI THỰC ĐƠN TUẦN (WEEKLY GRID: 5 CỘT T2 - T6) */}
        <div className={styles.weeklySectionWrap}>
          <div className={styles.sectionHeaderRow}>
            <h3 className={styles.sectionTitle}>
              <CalendarDays size={18} />
              <span>Bảng thực đơn tuần (Thứ Hai – Thứ Sáu)</span>
            </h3>

            <div className={styles.headerActionsWrap}>
              {hasCopiedPreviousWeek && (
                <button
                  type="button"
                  className={styles.undoCopyBtn}
                  onClick={handleUndoCopyPreviousWeek}
                  title="Hủy bỏ sao chép và khôi phục lại thực đơn trước khi sao chép"
                >
                  <RotateCcw size={14} />
                  <span>Bỏ sao chép</span>
                </button>
              )}

              {/* Nút Sao chép thực đơn tuần trước */}
              <button
                type="button"
                className={styles.copyPrevWeekBtn}
                onClick={handleTriggerCopyPreviousWeek}
                disabled={isCopying || loadingSchedule || saving || Boolean(scheduleError) || academicWeek?.weeklyMenuStatus === "APPROVED"}
                title="Sao chép toàn bộ món ăn và gia vị từ thực đơn của tuần liền trước sang tuần này"
              >
                {isCopying ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Copy size={15} />
                )}
                <span>
                  {isCopying
                    ? "Đang sao chép..."
                    : hasCopiedPreviousWeek
                    ? "Sao chép lại"
                    : "Sao chép từ tuần trước"}
                </span>
              </button>
            </div>
          </div>

          <CreateMenuWeeklyGrid
            schoolDays={schoolDays}
            weeklyMeals={weeklyMeals}
            onOpenDayModal={handleOpenDayModal}
            readOnly={loadingSchedule || saving || Boolean(scheduleError) || academicWeek?.weeklyMenuStatus === "APPROVED"}
          />
        </div>
      </div>

      {scheduleError && <p role="alert">{scheduleError}</p>}
      {/* Sticky Bottom Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleOpenConfirmSubmit}
        isLoading={loadingSchedule || Boolean(scheduleError)}
        isSubmitting={saving}
        readOnly={academicWeek?.weeklyMenuStatus === "APPROVED"}
        submitText={academicWeek?.weeklyMenuStatus === "PENDING_APPROVAL" ? "Lưu và gửi BGH duyệt lại" : "Gửi BGH duyệt"}
      />

      {/* 3. POPUP MODAL TO RỘNG (50/50: NỬA TRÁI PREVIEW, NỬA PHẢI CHỌN MÓN & NHẬP GIA VỊ KHO) */}
      <CreateMenuDayModal
        isOpen={dayModalState.isOpen}
        onClose={handleCloseDayModal}
        dayData={dayModalState.dayData}
        dayMenu={
          dayModalState.dayData
            ? weeklyMeals[dayModalState.dayData.dateISO]
            : null
        }
        initialMealType={dayModalState.mealType}
        initialTab={dayModalState.tab}
        onSaveDay={handleSaveDayFromModal}
        submitText={academicWeek?.weeklyMenuStatus === "PENDING_APPROVAL" ? "Lưu và gửi BGH duyệt lại" : "Cập nhật vào ngày này"}
      />

      {/* Modal xác nhận gửi BGH duyệt */}
      <ConfirmSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={{
          name: menuTitle,
          date: weekRangeText,
          mealType: "WEEKLY",
        }}
        dishesCount={totalWeeklyDishesCount}
        selectedAllergyOption="OPTION_2"
        conflictCount={0}
      />

      {/* Modal xác nhận sao chép từ tuần trước */}
      {showCopyConfirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={(e) =>
            e.target === e.currentTarget &&
            !isCopying &&
            setShowCopyConfirmModal(false)
          }
        >
          <div className={styles.confirmModalBox}>
            <div className={styles.confirmModalHeader}>
              <div className={styles.confirmModalIconWrap}>
                <Copy size={20} />
              </div>
              <div className={styles.confirmModalHeaderContent}>
                <h3 className={styles.confirmModalTitle}>
                  Sao chép thực đơn tuần trước?
                </h3>
                <p className={styles.confirmModalDesc}>
                  Tuần hiện tại đang có <strong>{totalWeeklyDishesCount}</strong> món ăn. Hành động này sẽ thay thế các món ăn hiện có bằng thực đơn của tuần trước. Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>
            <div className={styles.confirmModalFooter}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setShowCopyConfirmModal(false)}
                disabled={isCopying}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={styles.confirmAcceptBtn}
                onClick={executeCopyPreviousWeek}
                disabled={isCopying}
              >
                {isCopying ? "Đang sao chép..." : "Xác nhận sao chép"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
