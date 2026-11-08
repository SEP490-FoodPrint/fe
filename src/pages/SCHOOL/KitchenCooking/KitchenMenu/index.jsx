import React, { useState, useEffect, useMemo, useCallback } from "react"
import MenuService from "src/services/MenuService"
import {
  MOCK_SCHOOL_ACADEMIC_YEARS,
  getWeeksOfAcademicYear,
  getISOWeekNumber,
  getSchoolWeekScheduleFromDate,
} from "src/services/MenuService/adapter"
import { DEFAULT_WEEKLY_MENU } from "./component/mockWeeklyMenuData"
import KitchenMenuHeader from "./component/KitchenMenuHeader"
import KitchenMenuWeeklyGrid from "./component/KitchenMenuWeeklyGrid"
import styles from "./index.module.scss"

export default function KitchenMenu() {
  const currentWeekNumber = useMemo(() => getISOWeekNumber(new Date()), [])

  // 1. Danh sách năm học cấu hình toàn trường (từ BGH)
  const availableAcademicYears = MOCK_SCHOOL_ACADEMIC_YEARS

  // 2. State Bộ lọc Năm học & Tuần học
  const [academicYear, setAcademicYear] = useState(() => {
    const cur = availableAcademicYears.find((ay) => ay.isCurrent)
    return cur ? cur.academicYear : "2026-2027"
  })
  const [selectedWeek, setSelectedWeek] = useState(currentWeekNumber)
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [loading, setLoading] = useState(false)
  const [apiWeekData, setApiWeekData] = useState(null)

  // Cấu hình năm học đang chọn
  const currentAcademicYearConfig = useMemo(() => {
    return (
      availableAcademicYears.find((ay) => ay.academicYear === academicYear) ||
      availableAcademicYears[0]
    )
  }, [availableAcademicYears, academicYear])

  // Danh sách các tuần học thực tế trong năm học
  const schoolWeeks = useMemo(() => {
    return getWeeksOfAcademicYear(currentAcademicYearConfig)
  }, [currentAcademicYearConfig])

  // Đối tượng tuần đang chọn
  const selectedWeekObj = useMemo(() => {
    const found = schoolWeeks.find((w) => w.isoWeek === Number(selectedWeek))
    if (found) return found
    const currentW = schoolWeeks.find((w) => w.isCurrentWeek)
    return currentW || schoolWeeks[0]
  }, [schoolWeeks, selectedWeek])

  // 3. Tính toán thông tin tuần từ selectedWeekObj (khớp lịch 5 ngày T2 - T6)
  const weekInfo = useMemo(() => {
    if (!selectedWeekObj?.startDateISO) {
      return getSchoolWeekScheduleFromDate(new Date())
    }
    const parts = selectedWeekObj.startDateISO.split("-").map(Number)
    const mondayDate = new Date(parts[0], parts[1] - 1, parts[2])
    return getSchoolWeekScheduleFromDate(mondayDate)
  }, [selectedWeekObj])

  const todayISO = useMemo(() => {
    const pad = (n) => String(n).padStart(2, "0")
    const now = new Date()
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  // 4. Tải dữ liệu thực đơn từ MenuService hoặc Mock
  useEffect(() => {
    let isMounted = true
    const fetchWeekMenu = async () => {
      try {
        setLoading(true)
        const dateStr = weekInfo.schoolDays?.[0]?.dateISO || weekInfo.dateISO
        const res = await MenuService.getWeekSchedule(dateStr)
        if (isMounted && res?.data) {
          setApiWeekData(res.data)
        }
      } catch (err) {
        console.warn("Không tải được thực đơn từ API, áp dụng thực đơn tuần chuẩn:", err?.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchWeekMenu()
    return () => {
      isMounted = false
    }
  }, [weekInfo])

  // 5. Kết hợp schoolDays với dữ liệu món ăn theo từng ngày
  const processedDays = useMemo(() => {
    if (!weekInfo?.schoolDays) return []

    return weekInfo.schoolDays.map((sd) => {
      // Lấy mock chuẩn theo dayOfWeek (1: Thứ Hai -> 5: Thứ Sáu)
      const defaultDay = DEFAULT_WEEKLY_MENU[sd.dayOfWeek] || {}

      // Nếu có API data map theo dateVN hoặc dateISO thì ưu tiên
      const apiDay = apiWeekData?.days?.find(
        (d) => d.date === sd.dateVN || d.rawDate === sd.dateISO
      )

      return {
        ...sd,
        meals: apiDay?.meals || defaultDay.meals || { LUNCH: { dishes: [] }, AFTERNOON: { dishes: [] } },
      }
    })
  }, [weekInfo, apiWeekData])

  // 6. Thống kê tổng số món theo ca ăn đang chọn
  const stats = useMemo(() => {
    let totalDishes = 0

    processedDays.forEach((day) => {
      const lunchDishes = day?.meals?.LUNCH?.dishes || []
      const afternoonDishes = day?.meals?.AFTERNOON?.dishes || []

      if (mealTypeFilter === "ALL") {
        totalDishes += lunchDishes.length + afternoonDishes.length
      } else if (mealTypeFilter === "LUNCH") {
        totalDishes += lunchDishes.length
      } else if (mealTypeFilter === "AFTERNOON") {
        totalDishes += afternoonDishes.length
      }
    })

    return {
      totalDishes,
    }
  }, [processedDays, mealTypeFilter])

  // Xử lý đổi năm học
  const handleAcademicYearChange = useCallback(
    (newAy) => {
      setAcademicYear(newAy)
      const targetConfig =
        availableAcademicYears.find((ay) => ay.academicYear === newAy) || availableAcademicYears[0]
      const newWeeks = getWeeksOfAcademicYear(targetConfig)
      const hasCurrent = newWeeks.some((w) => w.isoWeek === currentWeekNumber)
      if (hasCurrent) {
        setSelectedWeek(currentWeekNumber)
      } else if (newWeeks.length > 0) {
        setSelectedWeek(newWeeks[0].isoWeek)
      }
    },
    [availableAcademicYears, currentWeekNumber]
  )

  // Xử lý đổi tuần
  const handleWeekChange = useCallback((newWeekNum) => {
    setSelectedWeek(Number(newWeekNum))
  }, [])

  // Xác định vị trí tuần hiện tại trong danh sách tuần
  const currentWeekIndex = useMemo(() => {
    return schoolWeeks.findIndex((w) => w.isoWeek === selectedWeekObj?.isoWeek)
  }, [schoolWeeks, selectedWeekObj])

  const isFirstWeek = currentWeekIndex <= 0
  const isLastWeek = currentWeekIndex >= schoolWeeks.length - 1
  const isCurrentWeekSelected = Boolean(selectedWeekObj?.isCurrentWeek)

  // Chuyển tuần trước
  const handlePrevWeek = useCallback(() => {
    if (currentWeekIndex > 0) {
      setSelectedWeek(schoolWeeks[currentWeekIndex - 1].isoWeek)
    }
  }, [currentWeekIndex, schoolWeeks])

  // Chuyển tuần sau
  const handleNextWeek = useCallback(() => {
    if (currentWeekIndex < schoolWeeks.length - 1) {
      setSelectedWeek(schoolWeeks[currentWeekIndex + 1].isoWeek)
    }
  }, [currentWeekIndex, schoolWeeks])

  // Quay về tuần này
  const handleCurrentWeek = useCallback(() => {
    const curAy = availableAcademicYears.find((ay) => ay.isCurrent)
    if (curAy && academicYear !== curAy.academicYear) {
      setAcademicYear(curAy.academicYear)
    }
    setSelectedWeek(currentWeekNumber)
  }, [availableAcademicYears, academicYear, currentWeekNumber])

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header: Tiêu đề, Duyệt BGH, Bộ lọc Năm học & Tuần học, Ca ăn, KPI */}
      <KitchenMenuHeader
        academicYear={academicYear}
        academicYearOptions={availableAcademicYears}
        onAcademicYearChange={handleAcademicYearChange}
        week={selectedWeek}
        weeks={schoolWeeks}
        onWeekChange={handleWeekChange}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        isCurrentWeekSelected={isCurrentWeekSelected}
        isFirstWeek={isFirstWeek}
        isLastWeek={isLastWeek}
        totalDishes={stats.totalDishes}
        mealTypeFilter={mealTypeFilter}
        onMealTypeFilterChange={setMealTypeFilter}
      />

      {/* 2. Lưới 5 ngày phẳng, tối giản viền theo đúng nguyên mẫu thiết kế */}
      <KitchenMenuWeeklyGrid
        schoolDays={processedDays}
        mealTypeFilter={mealTypeFilter}
        todayISO={todayISO}
      />
    </div>
  )
}
