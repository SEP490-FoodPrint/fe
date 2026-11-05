import React, { useState, useEffect, useMemo } from "react"
import MenuService from "src/services/MenuService"
import { getSchoolWeekScheduleFromDate } from "src/services/MenuService/adapter"
import { DEFAULT_WEEKLY_MENU } from "./component/mockWeeklyMenuData"
import KitchenMenuHeader from "./component/KitchenMenuHeader"
import KitchenMenuWeeklyGrid from "./component/KitchenMenuWeeklyGrid"
import styles from "./index.module.scss"

export default function KitchenMenu() {
  const [targetDate, setTargetDate] = useState(() => new Date())
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [loading, setLoading] = useState(false)
  const [apiWeekData, setApiWeekData] = useState(null)

  // 1. Tính toán thông tin tuần từ targetDate
  const weekInfo = useMemo(() => {
    return getSchoolWeekScheduleFromDate(targetDate)
  }, [targetDate])

  const todayISO = useMemo(() => {
    const pad = (n) => String(n).padStart(2, "0")
    const now = new Date()
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  // 2. Tải dữ liệu thực đơn từ MenuService hoặc Mock
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

  // 3. Kết hợp schoolDays với dữ liệu món ăn theo từng ngày
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

  // 4. Thống kê tổng số món theo ca ăn đang chọn
  const stats = useMemo(() => {
    let totalDishes = 0
    let portions = 1250

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

      if (lunchDishes[0]?.portions) {
        portions = lunchDishes[0].portions
      }
    })

    return {
      totalDishes,
      portions,
    }
  }, [processedDays, mealTypeFilter])

  // Điều hướng tuần
  const handlePrevWeek = () => {
    setTargetDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  const handleNextWeek = () => {
    setTargetDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  const handleCurrentWeek = () => {
    setTargetDate(new Date())
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header: Tiêu đề, Duyệt BGH, Điều hướng tuần, Bộ lọc ca & KPI */}
      <KitchenMenuHeader
        weekInfo={weekInfo}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
        totalDishes={stats.totalDishes}
        portions={stats.portions}
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
