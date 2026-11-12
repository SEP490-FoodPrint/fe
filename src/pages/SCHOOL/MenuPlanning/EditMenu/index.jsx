import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import styles from "./EditMenu.module.scss"
import ROUTER from "src/router/ROUTER"
import http from "src/services/01_axios"
import MenuService from "src/services/MenuService"
import { apiMenuDetail } from "src/services/MenuService/urls"
import {
  formatDateVN,
  getSchoolWeekScheduleFromDate,
  menuWeekMeals,
} from "src/services/MenuService/adapter"

import CreateMenuHeader from "../component/CreateMenuHeader"
import CreateMenuBottomBar from "../component/CreateMenuBottomBar"
import ConfirmSubmitModal from "../component/ConfirmSubmitModal"
import MenuDetailBGHFeedback from "../MenuDetail/component/MenuDetailBGHFeedback"
import CreateMenuWeeklyGrid from "../CreateMenu/CreateMenuWeeklyGrid"
import CreateMenuDayModal from "../CreateMenu/CreateMenuDayModal"

export default function EditMenu() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Xử lý weeklyId nếu truyền vào dạng compound id (weeklyId_date_mealType)
  const weeklyId = useMemo(() => {
    const locMenu = location.state?.menu
    if (locMenu?.weeklyMenuId) return locMenu.weeklyMenuId
    if (typeof id === "string" && id.includes("_")) return id.split("_")[0]
    return id
  }, [id, location.state])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [rawMenu, setRawMenu] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Quản lý ngày & tuần học đường
  const [currentDateVN, setCurrentDateVN] = useState("")
  const [academicWeek, setAcademicWeek] = useState(null)

  const weekInfo = useMemo(() => {
    if (!currentDateVN) return null
    return getSchoolWeekScheduleFromDate(currentDateVN)
  }, [currentDateVN])

  const schoolDays = useMemo(() => {
    return (weekInfo?.schoolDays || []).map((day) => {
      const stored = academicWeek?.days?.find((d) => d.date === day.dateISO)
      return {
        ...day,
        isHoliday: stored?.isHoliday || false,
        holidayReason: stored?.holidayReason || null,
      }
    })
  }, [weekInfo, academicWeek])

  // 2. Thông tin thực đơn tuần
  const [menuTitle, setMenuTitle] = useState("")

  const GRADE_OPTIONS = useMemo(
    () => [
      { id: "grade-1", label: "Khối 1" },
      { id: "grade-2", label: "Khối 2" },
      { id: "grade-3", label: "Khối 3" },
      { id: "grade-4", label: "Khối 4" },
      { id: "grade-5", label: "Khối 5" },
    ],
    []
  )

  const [selectedGrades, setSelectedGrades] = useState([
    "grade-1",
    "grade-2",
    "grade-3",
    "grade-4",
    "grade-5",
  ])
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false)
  const gradeDropdownRef = useRef(null)

  const targetScopeText = useMemo(() => {
    if (selectedGrades.length === 0) return ""
    if (selectedGrades.length === GRADE_OPTIONS.length) {
      return "Tất cả các khối (Khối 1 - 5)"
    }
    return GRADE_OPTIONS.filter((g) => selectedGrades.includes(g.id))
      .map((g) => g.label)
      .join(", ")
  }, [selectedGrades, GRADE_OPTIONS])

  const [targetScope, setTargetScope] = useState("")

  // Click outside đóng dropdown khối lớp
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
      const next = prev.includes(gradeId)
        ? prev.filter((gid) => gid !== gradeId)
        : [...prev, gradeId]
      return next
    })
  }

  const handleToggleAllGrades = () => {
    if (selectedGrades.length === GRADE_OPTIONS.length) {
      setSelectedGrades([])
    } else {
      setSelectedGrades(GRADE_OPTIONS.map((g) => g.id))
    }
  }

  // Đồng bộ targetScope với selectedGrades khi người dùng đổi lựa chọn
  useEffect(() => {
    if (targetScopeText) {
      setTargetScope(targetScopeText)
    }
  }, [targetScopeText])

  // 3. Dữ liệu thực đơn cả tuần
  const [weeklyMeals, setWeeklyMeals] = useState({})

  // 4. Modal Chi tiết Ngày (50/50: Nửa trái Preview ngày, Nửa phải Chọn món & Nhập gia vị)
  const [dayModalState, setDayModalState] = useState({
    isOpen: false,
    dayData: null,
    mealType: "LUNCH",
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

  // Tải chi tiết thực đơn tuần cần chỉnh sửa
  useEffect(() => {
    let isMounted = true
    const fetchMenu = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const res = await http.get(apiMenuDetail(weeklyId), { notifyOnError: false })
        const raw = res?.data || res
        if (!isMounted) return
        if (!raw || !raw.id) {
          throw new Error("Không tìm thấy dữ liệu thực đơn tuần.")
        }

        setRawMenu(raw)
        setMenuTitle(raw.title || raw.name || "")

        // Xác định ngày bắt đầu tuần
        const startDateStr = typeof raw.weekStartDate === "string"
          ? raw.weekStartDate.slice(0, 10)
          : new Date(raw.weekStartDate).toISOString().slice(0, 10)
        const dateVN = formatDateVN(startDateStr)
        setCurrentDateVN(dateVN)

        // Phân tích phạm vi áp dụng
        if (raw.targetScope) {
          setTargetScope(raw.targetScope)
          const matchedGrades = GRADE_OPTIONS.filter((g) =>
            raw.targetScope.includes(g.label)
          ).map((g) => g.id)
          if (matchedGrades.length > 0) {
            setSelectedGrades(matchedGrades)
          }
        }

        // Lấy lịch tuần từ backend API
        const schedRes = await MenuService.getWeekSchedule(startDateStr)
        if (isMounted && schedRes?.data) {
          setAcademicWeek(schedRes.data)
        }

        // Chuyển đổi dữ liệu ngày & món ăn từ menu
        const parsedDays = menuWeekMeals(raw)
        const mapped = {}
        parsedDays.forEach((day) => {
          if (day.date) {
            mapped[day.date] = {
              LUNCH: day.meals?.LUNCH?.dishes || [],
              AFTERNOON: day.meals?.AFTERNOON?.dishes || [],
              seasonings: Array.isArray(day.seasonings) ? day.seasonings : [],
              seasoningsByMeal: day.seasoningsByMeal || { LUNCH: [], AFTERNOON: [] },
            }
          }
        })
        setWeeklyMeals(mapped)
      } catch (err) {
        if (isMounted) {
          console.warn("Lỗi tải thực đơn tuần để chỉnh sửa:", err)
          setLoadError(err.message || "Không thể tải thông tin thực đơn cần chỉnh sửa.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (weeklyId) {
      fetchMenu()
    }
    return () => {
      isMounted = false
    }
  }, [weeklyId, GRADE_OPTIONS])

  // Đảm bảo mọi ngày trong schoolDays đều có key trong weeklyMeals
  useEffect(() => {
    if (!schoolDays.length) return
    setWeeklyMeals((prev) => {
      let changed = false
      const copy = { ...prev }
      schoolDays.forEach((sd) => {
        if (!copy[sd.dateISO]) {
          changed = true
          copy[sd.dateISO] = {
            LUNCH: [],
            AFTERNOON: [],
            seasonings: [],
            seasoningsByMeal: { LUNCH: [], AFTERNOON: [] },
          }
        }
      })
      return changed ? copy : prev
    })
  }, [schoolDays])

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
    ({ dateISO, LUNCH, AFTERNOON, seasonings, seasoningsByMeal, useDishRecipes }) => {
      setWeeklyMeals((prev) => ({
        ...prev,
        [dateISO]: {
          ...prev[dateISO],
          LUNCH,
          AFTERNOON,
          seasonings,
          seasoningsByMeal,
          useDishRecipes,
        },
      }))
      showToast("Đã cập nhật món ăn và gia vị cho ngày thành công", "success")
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

  // Tính số ngày đã có món ăn
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
    const weekStartDate = schoolDays[0]?.dateISO || (rawMenu?.weekStartDate ? rawMenu.weekStartDate.slice(0, 10) : "")
    const days = []

    schoolDays.forEach((sd) => {
      const dayData = weeklyMeals[sd.dateISO]
      if (!dayData) return

      const lunchDishes = (dayData.LUNCH || [])
        .filter((d) => (d.name || "").trim().length > 0)
        .map((d) => ({
          ...(d.dishId ? { dishId: d.dishId } : { name: (d.name || "").trim() }),
          ingredients: Array.isArray(d.ingredientStandards)
            ? d.ingredientStandards
            : (d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])).map((id) => ({
                ingredientId: id,
                quantityPerPortion: String(d.portionQty || 50),
                unit: (d.unit || "g").trim().toLowerCase(),
              })),
        }))

      const afternoonDishes = (dayData.AFTERNOON || [])
        .filter((d) => (d.name || "").trim().length > 0)
        .map((d) => ({
          ...(d.dishId ? { dishId: d.dishId } : { name: (d.name || "").trim() }),
          ingredients: Array.isArray(d.ingredientStandards)
            ? d.ingredientStandards
            : (d.ingredientIds || (d.ingredientId ? [d.ingredientId] : [])).map((id) => ({
                ingredientId: id,
                quantityPerPortion: String(d.portionQty || 50),
                unit: (d.unit || "g").trim().toLowerCase(),
              })),
        }))

      const meals = []
      for (const [mealType, mealDishes] of [
        ["LUNCH", lunchDishes],
        ["AFTERNOON", afternoonDishes],
      ]) {
        if (!mealDishes.length) continue
        const rows =
          dayData.seasoningsByMeal?.[mealType] ||
          (mealType === "LUNCH" ? dayData.seasonings || [] : [])
        meals.push({
          mealType,
          dishes: mealDishes,
          ...(dayData.useDishRecipes ? { useDishRecipes: true } : {}),
          seasonings: rows.map((s) => ({
            ingredientEntryId: s.ingredientEntryId || s.id,
            quantityPerPortion: String(s.quantityPerPortion ?? s.portionQty),
            unit: s.unit,
          })),
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

  // Xử lý Lưu thay đổi (PUT /v1/menus/:id)
  const handleSaveDraft = async () => {
    if (!menuTitle.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi lưu", "warning")
      return
    }

    if (!targetScope.trim()) {
      showToast("Vui lòng chọn đối tượng áp dụng cho thực đơn", "warning")
      return
    }

    const payload = buildWeeklyMenuPayload()
    if (!payload.days.length) {
      showToast("Vui lòng thêm ít nhất một món ăn vào thực đơn tuần trước khi lưu", "warning")
      return
    }

    setIsSaving(true)
    try {
      await http.put(apiMenuDetail(weeklyId), payload, { notifyOnError: false })
      MenuService.invalidateMenuCache()
      showToast("Đã lưu các thay đổi của thực đơn tuần thành công!", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1000)
    } catch (err) {
      showToast("Không thể cập nhật thực đơn: " + (err.message || "Lỗi máy chủ"), "warning")
    } finally {
      setIsSaving(false)
    }
  }

  // Mở modal xác nhận gửi duyệt
  const handleOpenConfirmSubmit = () => {
    if (!menuTitle.trim()) {
      showToast("Vui lòng nhập tên thực đơn trước khi gửi duyệt", "warning")
      return
    }
    if (!targetScope.trim()) {
      showToast("Vui lòng chọn đối tượng áp dụng trước khi gửi duyệt", "warning")
      return
    }
    if (totalWeeklyDishesCount === 0) {
      showToast("Vui lòng thêm ít nhất một món ăn vào thực đơn tuần", "warning")
      return
    }
    setIsConfirmModalOpen(true)
  }

  // Xác nhận gửi Ban Giám Hiệu duyệt (PUT rồi POST /submit)
  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false)
    const payload = buildWeeklyMenuPayload()
    if (!payload.days.length) {
      showToast("Vui lòng thêm ít nhất một món ăn trước khi gửi duyệt", "warning")
      return
    }

    setIsSaving(true)
    try {
      await http.put(apiMenuDetail(weeklyId), payload, { notifyOnError: false })
      await MenuService.submitMenu(weeklyId)
      MenuService.invalidateMenuCache()
      showToast("Đã cập nhật và gửi thực đơn tuần lên Ban Giám hiệu phê duyệt thành công!", "success")
      setTimeout(() => {
        navigate(ROUTER.SCHOOL_MENU_PLANNING)
      }, 1200)
    } catch (err) {
      showToast("Lỗi gửi duyệt: " + (err.message || "Không thể gửi thực đơn"), "warning")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FoodPrintLoading />
      </div>
    )
  }

  if (loadError || !rawMenu) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.lockedContainer}>
          <div className={styles.lockedCard}>
            <div className={styles.lockedIconWrap}>
              <AlertTriangle size={32} />
            </div>
            <h2 className={styles.lockedTitle}>Không tìm thấy thực đơn</h2>
            <p className={styles.lockedDesc}>
              {loadError || "Thực đơn yêu cầu không tồn tại hoặc bạn không có quyền truy cập."}
            </p>
            <div className={styles.lockedActions}>
              <button
                type="button"
                className={styles.btnBackList}
                onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu thực đơn đã duyệt: không cho phép chỉnh sửa
  if (rawMenu.status === "APPROVED") {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.lockedContainer}>
          <div className={styles.lockedCard}>
            <div className={styles.lockedIconWrap}>
              <Lock size={32} />
            </div>
            <h2 className={styles.lockedTitle}>Thực đơn đã được phê duyệt</h2>
            <p className={styles.lockedDesc}>
              Thực đơn tuần này đã được Ban Giám Hiệu phê duyệt và đang áp dụng thực hiện. Bạn không thể chỉnh sửa thực đơn đã phê duyệt.
            </p>
            <div className={styles.lockedActions}>
              <button
                type="button"
                className={styles.btnBackDetail}
                onClick={() => navigate(ROUTER.SCHOOL_MENU_DETAIL.replace(":id", weeklyId))}
              >
                Xem chi tiết thực đơn
              </button>
              <button
                type="button"
                className={styles.btnBackList}
                onClick={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
              >
                Về danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const weekRangeText =
    schoolDays.length >= 5
      ? `${schoolDays[0].dateVN.slice(0, 5)} – ${schoolDays[4].dateVN}`
      : ""

  const statusLabel =
    rawMenu.status === "REVISION_REQUIRED" || rawMenu.status === "REVISION_REQUESTED"
      ? "Yêu cầu chỉnh sửa"
      : "Bản nháp"

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
          title="Chỉnh sửa thực đơn tuần"
          statusLabel={statusLabel}
          onBack={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        />

        {/* Thông báo ý kiến yêu cầu chỉnh sửa từ Ban Giám Hiệu (nếu có) */}
        {(rawMenu.status === "REVISION_REQUIRED" ||
          rawMenu.status === "REVISION_REQUESTED" ||
          rawMenu.feedback) && (
          <MenuDetailBGHFeedback menu={rawMenu} />
        )}

        {/* 1. THANH ĐIỀU KHIỂN ĐẦU TRANG: TUẦN & THÔNG TIN THỰC ĐƠN */}
        <div className={styles.topControlsCard}>
          <div className={styles.controlsTopRow}>
            {/* Cố định tuần của thực đơn đang sửa */}
            <div className={styles.weekStepper}>
              <CalendarDays size={16} className="text-emerald-700" />
              <span className={styles.weekRangeText}>
                {weekRangeText || "Tuần thực đơn"}
              </span>
              {academicWeek?.weekNumber && (
                <span className="text-xs text-slate-500 font-semibold ml-1">
                  (Tuần {academicWeek.weekNumber})
                </span>
              )}
            </div>

            {/* Thống kê nhanh */}
            <div className={styles.weekQuickStats}>
              <div className={styles.statPill}>
                <span>Tổng món tuần:</span>
                <strong>{totalWeeklyDishesCount} món</strong>
              </div>
              <div className={styles.statPill}>
                <span>Ngày đủ 2 ca:</span>
                <strong>{completedDaysCount}/5 ngày</strong>
              </div>
            </div>
          </div>

          {/* Hàng Form nhập Tên & Khối áp dụng */}
          <div className={styles.formFieldsRow}>
            <div className={styles.titleFieldWrap}>
              <label className={styles.fieldLabel} htmlFor="menu-title-input">
                Tên thực đơn <span className="text-rose-500">*</span>
              </label>
              <input
                id="menu-title-input"
                type="text"
                className={styles.titleInput}
                placeholder="VD: Thực đơn tuần 45 - Khối 1 - 5"
                value={menuTitle}
                onChange={(e) => setMenuTitle(e.target.value)}
              />
            </div>

            <div className={styles.scopeFieldWrap} ref={gradeDropdownRef}>
              <label className={styles.fieldLabel}>
                Đối tượng áp dụng <span className="text-rose-500">*</span>
              </label>
              <div className={styles.scopeDropdownWrap}>
                <button
                  type="button"
                  className={styles.scopeDropdownTrigger}
                  onClick={() => setIsGradeDropdownOpen((prev) => !prev)}
                >
                  <span className="truncate">
                    {targetScope || "Chọn các khối lớp áp dụng..."}
                  </span>
                  {isGradeDropdownOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {isGradeDropdownOpen && (
                  <div className={styles.scopeDropdownMenu}>
                    <div
                      className={`${styles.dropdownOption} ${styles.selectAllOption}`}
                      onClick={handleToggleAllGrades}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGrades.length === GRADE_OPTIONS.length}
                        onChange={() => {}}
                        className={styles.dropdownCheckbox}
                      />
                      <span className={styles.optionLabel}>
                        Tất cả các khối (Khối 1 - 5)
                      </span>
                    </div>
                    {GRADE_OPTIONS.map((g) => {
                      const isChecked = selectedGrades.includes(g.id)
                      return (
                        <div
                          key={g.id}
                          className={styles.dropdownOption}
                          onClick={() => handleToggleGrade(g.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className={styles.dropdownCheckbox}
                          />
                          <span className={styles.optionLabel}>{g.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. KHU VỰC THỰC ĐƠN CẢ TUẦN (5 NGÀY HỌC ĐƯỜNG) */}
        <div className={styles.weeklySectionWrap}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>
              <CalendarDays size={18} className="text-emerald-700" />
              <span>Kế hoạch thực đơn trong tuần (Thứ 2 – Thứ 6)</span>
            </h2>
          </div>

          <CreateMenuWeeklyGrid
            schoolDays={schoolDays}
            weeklyMeals={weeklyMeals}
            onOpenDayModal={handleOpenDayModal}
          />
        </div>
      </div>

      {/* 3. MODAL POPUP CHI TIẾT NGÀY (50/50) */}
      {dayModalState.isOpen && (
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
          onSaveDay={handleSaveDayFromModal}
        />
      )}

      {/* 4. THANH HÀNH ĐỘNG CỐ ĐỊNH Ở ĐÁY MÀN HÌNH */}
      <CreateMenuBottomBar
        onCancel={() => navigate(ROUTER.SCHOOL_MENU_PLANNING)}
        onSaveDraft={handleSaveDraft}
        onSubmitApproval={handleOpenConfirmSubmit}
        isLoading={isSaving}
        draftText="Lưu thay đổi"
        submitText="Gửi BGH phê duyệt"
      />

      {/* 5. MODAL XÁC NHẬN GỬI BAN GIÁM HIỆU DUYỆT */}
      <ConfirmSubmitModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        menuData={{
          name: menuTitle,
          date: weekRangeText,
          mealType: "Cả ngày (Trưa & Xế)",
          targetScope: targetScope,
          portionCount: 650,
          notes: rawMenu.feedback || "Cập nhật thực đơn theo yêu cầu",
        }}
        dishesCount={totalWeeklyDishesCount}
        selectedAllergyOption="OPTION_2"
        conflictCount={0}
      />
    </div>
  )
}
