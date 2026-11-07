import React, { useEffect, useRef, useState } from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
} from "@mui/material"
import { Info } from "lucide-react"
import notice from "src/components/Notice"
import SchoolService from "src/services/SchoolService"
import CookingModeExample from "./component/CookingModeExample"
import CookingModeOptions from "./component/CookingModeOptions"
import { cookingModeLabel } from "./component/cookingModeConfig"
import "./style.scss"

const errorMessage = (failure, fallback) => failure?.response?.data?.message || fallback

function CookingMode() {
  const [saved, setSaved] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const savingRef = useRef(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
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
  }, [retry])

  const save = async () => {
    if (savingRef.current || !selected || selected === saved) return
    savingRef.current = true
    setSaving(true)
    try {
      const response = await SchoolService.updateCookingMode(selected)
      setSaved(response.data.cookingMode)
      setSelected(response.data.cookingMode)
      setConfirmOpen(false)
      notice({ msg: "Đã lưu chế độ nấu cho nhà trường" })
    } catch (failure) {
      notice({
        msg: "Không thể lưu chế độ nấu",
        desc: failure?.response?.data?.message,
        isSuccess: false,
      })
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const requestSave = () => {
    if (!saved) {
      void save()
      return
    }
    setConfirmOpen(true)
  }

  const changed = Boolean(selected && selected !== saved)

  return (
    <div className="cooking-mode-page">
      <header>
        <nav className="cooking-mode-page__breadcrumb" aria-label="Đường dẫn trang">
          <span>Ban Giám hiệu</span>
          <span>/</span>
          <strong>Chế độ nấu</strong>
        </nav>
      </header>

      {loading && <Skeleton variant="rounded" height={360} />}
      {!loading && error && (
        <Alert
          severity="error"
          action={(
            <Button color="inherit" onClick={() => setRetry(value => value + 1)}>
              Thử lại
            </Button>
          )}
        >
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <>
          <p className="cooking-mode-page__status" aria-live="polite">
            <span aria-hidden="true" />
            {saved ? (
              <>Chế độ đang áp dụng: <strong>{cookingModeLabel(saved)}</strong></>
            ) : (
              "Nhà trường chưa thiết lập chế độ nấu."
            )}
          </p>

          <CookingModeOptions value={selected} disabled={saving} onChange={setSelected} />

          <CookingModeExample mode={selected} />

          <section className="cooking-mode-page__information" aria-labelledby="cooking-mode-information-title">
            <Info size={20} aria-hidden="true" />
            <div>
              <h2 id="cooking-mode-information-title">Lưu ý khi thay đổi chế độ</h2>
              <ul>
                <li>Chế độ được áp dụng cho toàn bộ nhà bếp của trường.</li>
                <li>Các mẻ đã lập vẫn giữ nguyên chế độ tại thời điểm được tạo.</li>
                <li>
                  Kế hoạch mới tuân theo chế độ đang áp dụng; kế hoạch đã có mẻ có thể tiếp tục giữ chế độ cũ
                  để bảo đảm nhất quán.
                </li>
                <li>Mọi lô nguyên liệu sử dụng vẫn được ghi nhận để truy xuất nguồn gốc.</li>
              </ul>
            </div>
          </section>

          <div className="cooking-mode-page__footer">
            <span className="cooking-mode-page__hint">Chỉ Ban Giám hiệu có quyền thay đổi cấu hình áp dụng cho nhà trường.</span>
            <Button
              variant="contained"
              disabled={saving || !changed}
              onClick={requestSave}
            >
              {saving ? "Đang lưu..." : "Lưu chế độ"}
            </Button>
          </div>

          <Dialog
            open={confirmOpen}
            onClose={() => !saving && setConfirmOpen(false)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Xác nhận thay đổi chế độ nấu</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Bạn đang thay đổi chế độ nấu của nhà trường từ {cookingModeLabel(saved)} sang {cookingModeLabel(selected)}.{" "}
                Các mẻ đã lập sẽ không bị thay đổi.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button disabled={saving} onClick={() => setConfirmOpen(false)}>Hủy</Button>
              <Button variant="contained" disabled={saving} onClick={save}>
                {saving ? "Đang lưu..." : "Xác nhận thay đổi"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  )
}

export default CookingMode
