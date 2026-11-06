import React, { useEffect, useState } from "react"
import { Alert, Button, Paper, Skeleton, TextField } from "@mui/material"
import { Clock3 } from "lucide-react"
import notice from "src/components/Notice"
import SchoolService from "src/services/SchoolService"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

function MealServingTimes() {
  const [saved, setSaved] = useState({ lunchTime: null, afternoonMealTime: null })
  const [form, setForm] = useState({ lunchTime: "", afternoonMealTime: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    SchoolService.getMealTimes()
      .then(response => {
        if (!active) return
        const value = response.data
        setSaved(value)
        setForm({ lunchTime: value.lunchTime || "", afternoonMealTime: value.afternoonMealTime || "" })
      })
      .catch(failure => active && setError(errorMessage(failure, "Không thể tải giờ phục vụ.")))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const changed = (saved.lunchTime || "") !== form.lunchTime
    || (saved.afternoonMealTime || "") !== form.afternoonMealTime
  const ordered = !form.lunchTime || !form.afternoonMealTime || form.lunchTime < form.afternoonMealTime

  const save = async () => {
    setSaving(true)
    try {
      const response = await SchoolService.updateMealTimes({
        lunchTime: form.lunchTime || null,
        afternoonMealTime: form.afternoonMealTime || null,
      })
      setSaved(response.data)
      notice({ msg: "Đã lưu giờ phục vụ bữa ăn" })
    } catch (failure) {
      notice({ msg: errorMessage(failure, "Không thể lưu giờ phục vụ."), isSuccess: false })
    } finally {
      setSaving(false)
    }
  }

  return <div className="meal-times-page">
    <header>
      <nav className="meal-times-page__breadcrumb" aria-label="Đường dẫn trang">
        <span>Ban Giám hiệu</span><span>/</span><strong>Giờ phục vụ</strong>
      </nav>
      <p>Thời điểm nhà trường dự kiến phục vụ từng ca ăn cho học sinh.</p>
    </header>
    {loading && <Skeleton variant="rounded" height={220} />}
    {!loading && error && <Alert severity="error">{error}</Alert>}
    {!loading && !error && <>
      <Alert severity="info">Đây là giờ phục vụ bữa ăn, không phải lịch giao nguyên liệu của nhà cung cấp. Bếp dùng cấu hình này khi lập kế hoạch mẻ.</Alert>
      <Paper variant="outlined" className="meal-times-page__card">
        <div className="meal-times-page__title"><Clock3 size={21} /><div><h2>Khung giờ trong ngày</h2><p>Để trống ca mà trường không tổ chức.</p></div></div>
        <div className="meal-times-page__fields">
          <TextField type="time" label="Bữa trưa" value={form.lunchTime} disabled={saving}
            onChange={event => setForm(current => ({ ...current, lunchTime: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }} />
          <TextField type="time" label="Bữa phụ" value={form.afternoonMealTime} disabled={saving}
            error={!ordered} helperText={!ordered ? "Bữa phụ phải sau bữa trưa" : " "}
            onChange={event => setForm(current => ({ ...current, afternoonMealTime: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }} />
        </div>
        <div className="meal-times-page__footer">
          <span>Thay đổi áp dụng cho các kế hoạch bếp lập sau khi lưu.</span>
          <Button variant="contained" disabled={saving || !changed || !ordered} onClick={save}>
            {saving ? "Đang lưu..." : "Lưu giờ phục vụ"}
          </Button>
        </div>
      </Paper>
    </>}
  </div>
}

export default MealServingTimes
