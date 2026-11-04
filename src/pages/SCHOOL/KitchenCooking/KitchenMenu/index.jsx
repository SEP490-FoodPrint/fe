import React, { useState, useEffect, useMemo } from "react"
import { Utensils, Users, CheckCircle2, Clock } from "lucide-react"
import MenuService from "src/services/MenuService"
import { getSchoolWeekScheduleFromDate } from "src/services/MenuService/adapter"
import { DEFAULT_WEEKLY_MENU } from "./component/mockWeeklyMenuData"
import KitchenMenuHeader from "./component/KitchenMenuHeader"
import KitchenMenuFilter from "./component/KitchenMenuFilter"
import KitchenMenuWeeklyGrid from "./component/KitchenMenuWeeklyGrid"
import styles from "./index.module.scss"

export default function KitchenMenu() {
  const [targetDate, setTargetDate] = useState(() => new Date())
  const [search, setSearch] = useState("")
  const [mealTypeFilter, setMealTypeFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
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

  // 4. Tính toán số liệu thống kê tổng hợp (KPI glanceable)
  const stats = useMemo(() => {
    let totalDishes = 0
    let createdBatches = 0
    let portions = 1250

    processedDays.forEach((day) => {
      const lunchDishes = day?.meals?.LUNCH?.dishes || []
      const afternoonDishes = day?.meals?.AFTERNOON?.dishes || []
      const allDayDishes = [...lunchDishes, ...afternoonDishes]

      totalDishes += allDayDishes.length
      createdBatches += allDayDishes.filter((d) => d.isBatchCreated).length
      if (lunchDishes[0]?.portions) {
        portions = lunchDishes[0].portions
      }
    })

    return {
      totalDishes,
      createdBatches,
      portions,
    }
  }, [processedDays])

  // 5. Tính số món thỏa mãn bộ lọc hiện tại
  const totalFilteredDishes = useMemo(() => {
    let count = 0
    processedDays.forEach((day) => {
      const lunchDishes = (day?.meals?.LUNCH?.dishes || []).filter((dish) => {
        if (mealTypeFilter !== "ALL" && mealTypeFilter !== "LUNCH") return false
        if (categoryFilter !== "ALL" && dish.category !== categoryFilter) return false
        if (search && !dish.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })

      const afternoonDishes = (day?.meals?.AFTERNOON?.dishes || []).filter((dish) => {
        if (mealTypeFilter !== "ALL" && mealTypeFilter !== "AFTERNOON") return false
        if (categoryFilter !== "ALL" && dish.category !== categoryFilter) return false
        if (search && !dish.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })

      count += lunchDishes.length + afternoonDishes.length
    })
    return count
  }, [processedDays, mealTypeFilter, categoryFilter, search])

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

  const handleResetFilter = () => {
    setSearch("")
    setMealTypeFilter("ALL")
    setCategoryFilter("ALL")
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header & Điều hướng tuần */}
      <KitchenMenuHeader
        weekInfo={weekInfo}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
      />

      {/* 2. Dải thông số nhanh tinh gọn cho bếp (Glanceable Stats Strip) */}
      <div className={styles.glanceStrip}>
        <div className={styles.glanceItem}>
          <Utensils size={15} className={styles.glanceIcon} />
          <span className={styles.glanceValue}>{stats.totalDishes}</span>
          <span className={styles.glanceLabel}>món / tuần</span>
        </div>

        <div className={styles.glanceDivider} />

        <div className={styles.glanceItem}>
          <Users size={15} className={styles.glanceIcon} />
          <span className={styles.glanceValue}>
            {stats.portions.toLocaleString("vi-VN")}
          </span>
          <span className={styles.glanceLabel}>suất / ca</span>
        </div>

        <div className={styles.glanceDivider} />

        <div className={styles.glanceItem}>
          <CheckCircle2 size={15} className={styles.glanceIconSuccess} />
          <span className={styles.glanceValue}>
            {stats.createdBatches}/{stats.totalDishes}
          </span>
          <span className={styles.glanceLabel}>đã lập lô</span>
        </div>

        <div className={styles.glanceDivider} />

        <div className={styles.glanceItem}>
          <Clock size={15} className={styles.glanceIcon} />
          <span className={styles.glanceLabel}>
            Trưa (11:00) • Xế (14:30)
          </span>
        </div>
      </div>

      {/* 3. Thanh bộ lọc thông minh */}
      <KitchenMenuFilter
        search={search}
        onSearchChange={setSearch}
        mealTypeFilter={mealTypeFilter}
        onMealTypeChange={setMealTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onReset={handleResetFilter}
        totalDishesCount={totalFilteredDishes}
      />

      {/* 4. Lưới thực đơn 5 ngày theo tuần (Thứ 2 -> Thứ 6) */}
      <KitchenMenuWeeklyGrid
        schoolDays={processedDays}
        mealTypeFilter={mealTypeFilter}
        categoryFilter={categoryFilter}
        search={search}
        todayISO={todayISO}
      />
    </div>
  )
}

