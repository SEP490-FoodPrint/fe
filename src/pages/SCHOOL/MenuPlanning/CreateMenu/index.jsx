import React, { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react"
import styles from "./CreateMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import http from "src/services/01_axios"
import MenuService from "src/services/MenuService"
import {
  parseDateVNToISO,
  formatDateVN,
  getSchoolWeekScheduleFromDate,
} from "src/services/MenuService/adapter"

import CreateMenuHeader from "../component/CreateMenuHeader"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"

import CreateMenuWeeklyGrid from "./CreateMenuWeeklyGrid"
import CreateMenuDayModal from "./CreateMenuDayModal"

export default function CreateMenu() {
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
  const schoolDays = weekInfo?.schoolDays || []
  const [academicWeek, setAcademicWeek] = useState(null)

  // 2. Thông tin thực đơn tuần
  const [menuTitle, setMenuTitle] = useState("")
  const [targetScope, setTargetScope] = useState("Toàn trường (Khối 1 – 5)")

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

  // 4. Modal Chi tiết Ngày (50/50: Nửa trái Preview ngày, Nửa phải Chọn món & Nhập gia vị)
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dayData: null,
    mealType: initialMealType || "LUNCH",
    tab: "DISHES",
  })

  // 5. Modal Xác nhận gửi duyệt & Toast
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
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
    setAcademicWeek(null)
    MenuService.getWeekSchedule(weekStart)
      .then((res) => {
        if (!active) return
        setAcademicWeek(res.data)
        const days = res?.data?.days || []
        const mapped = {}
        days.forEach((day) => {
          if (day.date) {
            mapped[day.date] = {
              LUNCH: day.meals?.LUNCH?.dishes || [],
              AFTERNOON: day.meals?.AFTERNOON?.dishes || [],
              seasonings: Array.isArray(day.seasonings) ? day.seasonings : [],
              seasoningsByMeal: day.seasoningsByMeal || { LUNCH: [], AFTERNOON: [] },
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
  }, [currentDateVN])

  // Mở Popup Modal Chi tiết ngày (50/50)
  const handleOpenDayModal = useCallback((dayData, mealType = "LUNCH", tab = "DISHES") => {
    setDayModalState({
      isOpen: true,
      dayData,
      mealType,
      tab,
    })
  }, [])

  const handleCloseDayModal = useCallback(() => {
    setDayModalState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  // Cập nhật dữ liệu từ DayModal vào weeklyMeals
  const handleSaveDayFromModal = useCallback(
    ({ dateISO, LUNCH, AFTERNOON, seasonings }) => {
      setWeeklyMeals((prev) => ({
        ...prev,
        [dateISO]: {
          ...prev[dateISO],
          LUNCH,
          AFTERNOON,
          seasonings,
        },
      }))
      showToast("Đã cập nhật thực đơn cho ngày thành công", "success")
    },
    []
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
      const dayData = weeklyMeals[sd.dateISO] || {}
      const hasLunch = Array.isArray(dayData.LUNCH) && dayData.LUNCH.length > 0
      const hasAfternoon =
        Array.isArray(dayData.AFTERNOON) && dayData.AFTERNOON.length > 0
      if (hasLunch && hasAfternoon) count += 1
    })
    return count
  }, [schoolDays, weeklyMeals])

  // Chuẩn hóa payload theo đúng schema MenuWrite của Backend
  const buildWeeklyMenuPayload = () => {
    const weekStartDate = schoolDays[0]?.dateISO
    const days = []

    schoolDays.forEach((sd) => {
      const dayData = weeklyMeals[sd.dateISO]
      if (!dayData) return

      const lunchDishes = (dayData.LUNCH || [])
        .filter((d) => (d.name || "").trim().length > 0)
        .map((d) => ({
          ...(d.dishId ? { dishId: d.dishId } : { name: (d.name || "").trim() }),
          ingredients: Array.isArray(d.ingredientStandards) ? d.ingredientStandards : (d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])).map((id) => ({
            ingredientId: id,
            quantityPerPortion: String(d.portionQty || 50),
            unit: (d.unit || "g").trim().toLowerCase(),
          })),
        }))

      const afternoonDishes = (dayData.AFTERNOON || [])
        .filter((d) => (d.name || "").trim().length > 0)
        .map((d) => ({
          ...(d.dishId ? { dishId: d.dishId } : { name: (d.name || "").trim() }),
          ingredients: Array.isArray(d.ingredientStandards) ? d.ingredientStandards : (d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])).map((id) => ({
            ingredientId: id,
            quantityPerPortion: String(d.portionQty || 50),
            unit: (d.unit || "g").trim().toLowerCase(),
          })),
        }))

      const isEntryId = (val) =>
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(val || "")

      const seasonings = (dayData.seasonings || [])
        .filter((s) => s && (s.ingredientEntryId || s.catalogId || isEntryId(s.id)))
        .map((s) => ({
          ingredientEntryId: s.ingredientEntryId || s.catalogId || s.id,
          quantityPerPortion: String(s.portionQty ?? s.quantityPerPortion ?? s.defaultQty ?? 5),
          unit: (s.unit || "g").trim().toLowerCase(),
        }))

      const meals = []
      if (lunchDishes.length > 0 || seasonings.length > 0) {
        meals.push({
          mealType: "LUNCH",
          dishes: lunchDishes,
          seasonings,
        })
      }
      if (afternoonDishes.length > 0) {
        meals.push({
          mealType: "AFTERNOON",
          dishes: afternoonDishes,
          seasonings: [],
        })
      }

      if (meals.length > 0) {
        days.push({
          menuDate: sd.dateISO,
          note: null,
          meals,
        })
      }
    })

    return {
      weekStartDate,
      title: menuTitle.trim(),
      days,
    }
  }

  // Xử lý Lưu bản nháp (gọi API thực tế)
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

    try {
      await http.post("/v1/menus", payload, { notifyOnError: false })
      MenuService.invalidateMenuCache()
      showToast("Đã lưu bản nháp thực đơn tuần thành công trên hệ thống!", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1000)
    } catch (err) {
      showToast("Không thể lưu bản nháp: " + (err.message || "Lỗi máy chủ"), "warning")
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

    try {
      const createRes = await http.post("/v1/menus", payload, { notifyOnError: false })
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
                Tiến độ: <strong>{completedDaysCount}/{schoolDays.length || 5}</strong> ngày đủ 2 ca
              </span>
              <span className={styles.statPill}>
                Tổng số món: <strong>{totalWeeklyDishesCount}</strong> món
              </span>
            </div>
          </div>

          {/* Dòng nhập Tên thực đơn & Đối tượng áp dụng */}
          <div className={styles.controlsInputsRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Tên thực đơn tuần <span className={styles.inputRequired}>*</span>
              </label>
              <input
                type="text"
                className={styles.textInput}
                value={menuTitle}
                onChange={(e) => setMenuTitle(e.target.value)}
                placeholder="Nhập tên thực đơn tuần..."
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Đối tượng áp dụng <span className={styles.inputRequired}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.textInput} ${
                  !targetScope.trim() ? "" : ""
                }`}
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                placeholder="Ví dụ: Toàn trường (Khối 1 - 5)"
              />
              {/* Dải gợi ý chọn nhanh */}
              <div className={styles.presetChipsWrap}>
                <span className={styles.presetLabel}>Gợi ý:</span>
                {[
                  "Toàn trường (Khối 1 - 5)",
                  "Khối 1 & 2",
                  "Khối 3, 4, 5",
                  "Toàn bộ Khối 1",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={styles.presetChip}
                    onClick={() => setTargetScope(preset)}
                  >
                    {preset}
                  </button>
                ))}
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
          </div>

          <CreateMenuWeeklyGrid
            schoolDays={schoolDays}
            weeklyMeals={weeklyMeals}
            onOpenDayModal={handleOpenDayModal}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleOpenConfirmSubmit}
        isLoading={loadingSchedule}
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
    </div>
  )
}
