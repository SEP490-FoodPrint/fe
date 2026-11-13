import React, { useCallback, useEffect, useMemo, useState } from "react"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import { Alert, Button, Chip } from "@mui/material"
import dayjs from "dayjs"
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  MessageSquareText,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import MealPortionService from "src/services/MealPortionService"
import ROUTER from "src/router/ROUTER"
import "./style.scss"

const meals = [
  { type: "LUNCH", label: "Bữa trưa" },
  { type: "AFTERNOON", label: "Bữa phụ" },
]

const statusMeta = submission => {
  if (!submission) return { label: "Cần khai báo", tone: "neutral", action: "Khai báo" }
  if (submission.status === "FINALIZED") return { label: "Đã chốt", tone: "success", action: "Xem lại" }
  return { label: "Cần chốt", tone: "warning", action: "Tiếp tục" }
}

function HomeroomOverview() {
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), [])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const responses = await Promise.all(meals.map(meal => (
        MealPortionService.getMyClassMeal({ date: today, mealType: meal.type })
      )))
      setData({
        class: responses[0].data.class,
        submissions: Object.fromEntries(meals.map((meal, index) => [meal.type, responses[index].data.submission])),
      })
    } catch (failure) {
      setData(null)
      setError(failure?.response?.data?.message || "Không thể tải thông tin lớp được phân công.")
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { load() }, [load])

  const allergies = data?.class?.classAllergies || []
  const pendingMeals = data
    ? meals.filter(meal => data.submissions[meal.type]?.status !== "FINALIZED").length
    : 0

  return (
    <div className="homeroom-overview">
      {loading && <div className="homeroom-overview__loading" role="status" aria-live="polite"><FoodPrintLoading size="medium" /></div>}
      {!loading && error && <Alert severity="warning" action={<Button color="inherit" onClick={load}>Thử lại</Button>}>{error}</Alert>}

      {!loading && data && <>
        <header className="homeroom-overview__header">
          <div className="homeroom-overview__class">
            <span className="homeroom-overview__class-icon"><Users size={22} aria-hidden="true" /></span>
            <div>
              <h1>{data.class.name}</h1>
              <p>Niên khóa {data.class.academicYear} · {data.class.registeredMealPortions} suất đăng ký</p>
            </div>
          </div>
          <time className="homeroom-overview__date" dateTime={today}>
            <CalendarDays size={18} aria-hidden="true" />
            <span>{dayjs(today).format("DD/MM/YYYY")}</span>
          </time>
        </header>

        <section className="homeroom-overview__section">
          <div className="homeroom-overview__section-heading">
            <div>
              <h2>Suất ăn hôm nay</h2>
              <p>{pendingMeals
                ? `${pendingMeals} bữa cần hoàn tất khai báo.`
                : "Đã hoàn tất khai báo cho cả hai bữa."}</p>
            </div>
          </div>
          <div className="homeroom-overview__meal-list">
            {meals.map(meal => {
              const submission = data.submissions[meal.type]
              const status = statusMeta(submission)
              return (
                <Link className="homeroom-overview__meal-card" key={meal.type}
                  aria-label={`${meal.label}: ${status.label}`}
                  to={`${ROUTER.SCHOOL_DAILY_CONFIRM}?date=${today}&mealType=${meal.type}`}>
                  <div className="homeroom-overview__meal-info">
                    <strong>{meal.label}</strong>
                    <span>{submission
                      ? `${submission.totalPortions}/${data.class.registeredMealPortions} suất`
                      : `${data.class.registeredMealPortions} suất đăng ký`}</span>
                  </div>
                  <div className="homeroom-overview__meal-action">
                    <Chip
                      size="small"
                      label={status.label}
                      className={`homeroom-overview__status homeroom-overview__status--${status.tone}`}
                    />
                    <span className="homeroom-overview__meal-link">
                      {status.action}<ArrowRight size={18} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section
          className={`homeroom-overview__notice ${allergies.length ? "homeroom-overview__notice--warning" : "homeroom-overview__notice--clear"}`}
          aria-label="Thông tin dị ứng của lớp"
        >
          {allergies.length
            ? <AlertTriangle size={20} aria-hidden="true" />
            : <ShieldCheck size={20} aria-hidden="true" />}
          <div>
            <h2>Dị ứng của lớp</h2>
            <p>{allergies.length
              ? `${allergies.length} nguyên liệu cần lưu ý khi xác nhận suất ăn.`
              : "Lớp chưa có nguyên liệu dị ứng được ghi nhận."}</p>
            {allergies.length > 0 && <div className="homeroom-overview__allergy-list">
              {allergies.map(item => <span key={item.ingredientEntryId}>
                {item.IngredientEntry?.Ingredient?.name} ({item.affectedCount})
              </span>)}
            </div>}
          </div>
        </section>

        <Link className="homeroom-overview__feedback" to={ROUTER.SCHOOL_MEAL_COMPLAINTS}
          aria-label="Mở trang phản ánh bữa ăn">
          <MessageSquareText size={22} />
          <span><strong>Phản ánh bữa ăn</strong><small>Gửi hoặc theo dõi phản ánh của lớp</small></span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </>}
    </div>
  )
}

export default HomeroomOverview
