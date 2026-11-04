import React, { useEffect, useState } from "react"
import { Alert, Button, Skeleton } from "@mui/material"
import notice from "src/components/Notice"
import SchoolService from "src/services/SchoolService"
import CookingModeOptions from "./component/CookingModeOptions"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

function CookingMode() {
  const [saved, setSaved] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    SchoolService.getCookingMode()
      .then(response => {
        if (!active) return
        setSaved(response.data.cookingMode)
        setSelected(response.data.cookingMode)
      })
      .catch(failure => {
        if (active) setError(errorMessage(failure, "Không thể tải chế độ nấu."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const response = await SchoolService.updateCookingMode(selected)
      setSaved(response.data.cookingMode)
      notice({ msg: "Đã lưu chế độ nấu" })
    } catch (failure) {
      notice({
        msg: "Không thể lưu chế độ nấu",
        desc: failure?.response?.data?.message,
        isSuccess: false,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cooking-mode-page">
      <header>
        <nav className="cooking-mode-page__breadcrumb" aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Chế độ nấu</strong>
        </nav>
        <h1 className="cooking-mode-page__title">Cấu hình chế độ nấu</h1>
      </header>

      {loading && <Skeleton variant="rounded" height={160} />}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          {!saved && (
            <Alert severity="warning">Bếp chưa lập được kế hoạch nấu cho đến khi trường chọn chế độ.</Alert>
          )}
          <CookingModeOptions value={selected} disabled={saving} onChange={setSelected} />
          <div className="cooking-mode-page__footer">
            <span className="cooking-mode-page__hint">Mẻ đã lập giữ nguyên chế độ cũ.</span>
            <Button
              variant="contained"
              disabled={saving || !selected || selected === saved}
              onClick={save}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default CookingMode
