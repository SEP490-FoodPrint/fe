import React, { useEffect, useState } from "react"
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { deactivateAccount, getLifecycleTarget, setIntakeState } from "src/services/SystemDirectoryService/lifecycle"
import styles from "./styles.module.scss"

export default function LifecycleActions({ kind, id, onAccountDeactivated, heading, children }) {
  const [target, setTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [action, setAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    getLifecycleTarget(kind, id, controller.signal).then(result => {
      if (!controller.signal.aborted) setTarget(result)
    }).catch(err => {
      if (!controller.signal.aborted) setError(err.message || "Không thể tải trạng thái quản lý.")
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [kind, id, attempt])

  const lifecycle = target?.lifecycle
  const paused = lifecycle && lifecycle.intakeState !== "ACTIVE"
  const locked = lifecycle?.accountStatus === "DEACTIVATED"
  const pauseLabel = paused ? "Tiếp tục hoạt động" : "Tạm dừng hoạt động"
  const scope = kind === "school" ? "trường học" : kind === "supplier" ? "nhà cung cấp" : "cán bộ ATTP"
  const intake = kind === "school" ? "tạo và gửi đơn hàng mới" : kind === "supplier" ? "nhận đơn hàng mới" : "tiếp nhận yêu cầu kiểm tra mới"
  async function confirm() {
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      if (action === "lock") {
        await deactivateAccount(target.user.id)
        onAccountDeactivated?.()
      }
      else await setIntakeState(target.user.id, paused ? "ACTIVE" : kind === "supplier" ? "PAUSED_FOR_FOOD_SAFETY_INSPECTION" : "PAUSED")
      setAction(null)
      setSuccess(action === "lock" ? "Đã khóa tài khoản." : paused ? "Đã tiếp tục hoạt động." : "Đã tạm dừng hoạt động.")
      setAttempt(n => n + 1)
    } catch (err) { setError(err.message || "Không thể thực hiện thao tác. Vui lòng thử lại.") }
    finally { setBusy(false) }
  }
  return <>
    <header className={styles.schoolDetailTitle}>{heading}<div className={styles.lifecycleActions}>
      <Button variant="outlined" disabled={loading || !target} onClick={() => { setError(""); setAction("pause") }}>{pauseLabel}</Button>
      <Button variant="outlined" color="error" disabled={loading || !target || locked} onClick={() => { setError(""); setAction("lock") }}>{locked ? "Đã khóa tài khoản" : "Khóa tài khoản"}</Button>
    </div></header>
    {children}
    <section className={`${styles.panel} ${styles.detailSection}`} aria-labelledby="lifecycle-title">
    <h2 id="lifecycle-title">Quản lý hoạt động và tài khoản</h2>
    {loading ? <CircularProgress size={24} aria-label="Đang tải trạng thái quản lý" /> : <>
      {target && <div className={styles.lifecycleStatus}><div><span>Tiếp nhận mới</span><strong>{paused ? "Đang tạm dừng" : "Đang hoạt động"}</strong></div><div><span>Tài khoản {kind === "officer" ? "cán bộ" : "quản trị"}</span><strong>{locked ? "Đã khóa" : lifecycle.accountStatus === "ACTIVE" ? "Hoạt động" : lifecycle.accountStatus}</strong></div></div>}
      {!target && <Button onClick={() => setAttempt(n => n + 1)}>Thử lại</Button>}
    </>}
    {error && <Alert severity="error" className={styles.lifecycleNotice}>{error}</Alert>}
    {success && <Alert severity="success" className={styles.lifecycleNotice}>{success}</Alert>}
    </section>
    <Dialog open={Boolean(action)} onClose={() => !busy && setAction(null)} aria-labelledby="lifecycle-dialog-title">
      <DialogTitle id="lifecycle-dialog-title">{action === "lock" ? "Khóa tài khoản" : pauseLabel}</DialogTitle>
      <DialogContent><DialogContentText>{action === "lock" ? `Bạn có chắc muốn khóa tài khoản ${scope}? ${kind === "officer" ? "Cán bộ sẽ không thể đăng nhập." : "Tất cả tài khoản thuộc đơn vị sẽ không thể đăng nhập."} Máy chủ sẽ kiểm tra các công việc chưa hoàn tất trước khi thực hiện.` : paused ? `Cho phép ${scope} ${intake} trở lại?` : `Tạm dừng ${scope} ${intake}? Các công việc đã tiếp nhận vẫn tiếp tục; tài khoản vẫn có thể đăng nhập.`}</DialogContentText>{action === "lock" && <DialogContentText sx={{ mt: 1 }}>Thao tác này vô hiệu hóa tài khoản; tiếp tục hoạt động không tự mở khóa tài khoản.</DialogContentText>}{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}</DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setAction(null)}>Hủy</Button><Button disabled={busy} color={action === "lock" ? "error" : "primary"} variant="contained" onClick={confirm}>{busy ? "Đang xử lý..." : "Xác nhận"}</Button></DialogActions>
    </Dialog>
  </>
}
