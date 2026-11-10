import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Button, Chip, CircularProgress } from "@mui/material"
import dayjs from "dayjs"
import { AlertTriangle, ArrowRight, CalendarDays, MessageSquareText, Users } from "lucide-react"
import { Link } from "react-router-dom"
import MealPortionService from "src/services/MealPortionService"
import ROUTER from "src/router/ROUTER"
import "./style.scss"

const meals = [
  { type: "LUNCH", label: "Bữa trưa" },
  { type: "AFTERNOON", label: "Bữa phụ" },
]

const statusMeta = submission => {
  if (!submission) return { label: "Chưa khai báo", color: "default" }
  if (submission.status === "FINALIZED") return { label: "Đã chốt", color: "success" }
  return { label: "Bản nháp", color: "warning" }
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

  return (
    <div className="homeroom-overview">
      <header className="homeroom-overview__header">
        <div>
          <h1>Tổng quan lớp hôm nay</h1>
          <p>Theo dõi và hoàn tất các đầu việc trong ngày của lớp phụ trách.</p>
        </div>
        <div className="homeroom-overview__date" aria-label={`Ngày ${dayjs(today).format("DD/MM/YYYY")}`}>
          <CalendarDays size={18} aria-hidden="true" />
          <span>{dayjs(today).format("DD/MM/YYYY")}</span>
        </div>
      </header>

      {loading && <div className="homeroom-overview__loading" role="status" aria-live="polite"><CircularProgress size={28} /> Đang tải thông tin lớp...</div>}
      {!loading && error && <Alert severity="warning" action={<Button color="inherit" onClick={load}>Thử lại</Button>}>{error}</Alert>}

      {!loading && data && <>
        <section className="homeroom-overview__class-card" aria-label="Lớp được phân công">
          <div className="homeroom-overview__class-icon"><Users size={24} /></div>
          <div>
            <span>Lớp đang phụ trách</span>
            <h2>{data.class.name}</h2>
            <p>Niên khóa {data.class.academicYear} · {data.class.registeredMealPortions} suất đăng ký</p>
          </div>
        </section>

        <section className="homeroom-overview__section">
          <div className="homeroom-overview__section-heading">
            <div><h2>Suất ăn hôm nay</h2><p>Kiểm tra và chốt số suất theo từng bữa.</p></div>
          </div>
          <div className="homeroom-overview__meal-list">
            {meals.map(meal => {
              const submission = data.submissions[meal.type]
              const status = statusMeta(submission)
              return (
                <Link className="homeroom-overview__meal-card" key={meal.type}
                  aria-label={`${meal.label}: ${status.label}`}
                  to={`${ROUTER.SCHOOL_DAILY_CONFIRM}?date=${today}&mealType=${meal.type}`}>
                  <div>
                    <span>{meal.label}</span>
                    <strong>{submission ? `${submission.totalPortions} suất` : "Chưa có số liệu"}</strong>
                  </div>
                  <div className="homeroom-overview__meal-action">
                    <Chip size="small" color={status.color} label={status.label} />
                    <span className="homeroom-overview__meal-arrow"><ArrowRight size={20} aria-hidden="true" /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="homeroom-overview__notice" aria-label="Lưu ý dị ứng của lớp">
          <AlertTriangle size={22} />
          <div>
            <h2>Lưu ý dị ứng</h2>
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

        <Link className="homeroom-overview__feedback" to={ROUTER.SCHOOL_MEAL_FEEDBACK}
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
