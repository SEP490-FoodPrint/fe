import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, useMediaQuery } from "@mui/material"
import RegistrationService from "src/services/RegistrationService"
import RequestFields from "src/components/Registration/RequestFields"
import RequestStatus from "src/components/Registration/RequestStatus"
import { formatRequestDate, organizationName, requestCode, REQUEST_TYPES } from "src/lib/registration"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./ReviewDialog.module.scss"

export default function ReviewDialog({ mode, request, reviewer, onClose, onReviewed }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submittingRef = useRef(false)
  useEffect(() => { setReason(""); setError("") }, [mode])
  const isResult = mode === "RESULT"
  const isReject = mode === "REJECTED"
  const title = isResult ? request.status === "APPROVED" ? "Đã phê duyệt hồ sơ đăng ký." : "Đã từ chối hồ sơ đăng ký."
    : isReject ? "Từ chối hồ sơ đăng ký" : "Xác nhận phê duyệt hồ sơ"
  const submit = async event => {
    event.preventDefault()
    if (submittingRef.current || isResult) return
    submittingRef.current = true
    setSubmitting(true)
    setError("")
    try {
      const response = await RegistrationService.reviewRequest(request.id, { status: mode, rejection_reason: isReject ? reason.trim() || null : null }, reviewer)
      onReviewed(response.data)
    } catch (err) {
      setError(err.message || "Không thể lưu quyết định xét duyệt.")
    } finally { setSubmitting(false); submittingRef.current = false }
  }
  return (
    <Dialog open={Boolean(mode)} onClose={submitting ? undefined : onClose} maxWidth={false} transitionDuration={reducedMotion ? 0 : undefined} aria-labelledby="review-dialog-title" className={styles.dialog}>
      <form onSubmit={submit}>
        <DialogTitle id="review-dialog-title" className={styles.title}>{title}<IconButton onClick={onClose} disabled={submitting} aria-label="Đóng hộp thoại"><CloseIcon /></IconButton></DialogTitle>
        <DialogContent className={styles.content}>
          {isResult ? <>
            <RequestStatus status={request.status} />
            <p>{requestCode(request.id)} · {organizationName(request)}</p>
            <RequestFields columns={1} fields={[{ label: "Người xét duyệt", value: request.reviewer?.full_name || "Chưa có" }, { label: "Ngày xét duyệt", value: formatRequestDate(request.reviewed_at, true) }, ...(request.rejection_reason ? [{ label: "Lý do từ chối", value: request.rejection_reason }] : [])]} />
            <p className={styles.muted}>Quyết định đã được ghi nhận.</p>
          </> : isReject ? <>
            <p className={styles.muted}>Hồ sơ {requestCode(request.id)} của {request.applicant?.full_name || "người đăng ký"}.</p>
            <label className={styles.reasonLabel} htmlFor="rejection-reason">Lý do từ chối</label>
            <TextField id="rejection-reason" value={reason} onChange={event => setReason(event.target.value)} multiline rows={4} fullWidth autoFocus disabled={submitting}
              placeholder="Nhập lý do từ chối hồ sơ" slotProps={{ htmlInput: { maxLength: 2000, "aria-describedby": "rejection-hint" } }} />
            <p id="rejection-hint" className={styles.muted}>Bổ sung lý do nếu cần phản hồi cho người đăng ký.</p>
          </> : <>
            <p className={styles.muted}>Bạn có chắc chắn muốn phê duyệt hồ sơ đăng ký này?</p>
            <RequestFields columns={1} fields={[{ label: "Người đăng ký", value: request.applicant?.full_name }, { label: "Loại hồ sơ", value: REQUEST_TYPES[request.request_type] }, { label: "Đơn vị đăng ký", value: organizationName(request) }]} />
          </>}
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        {!isResult && <DialogActions className={styles.actions}><Button variant="outlined" onClick={onClose} disabled={submitting} autoFocus={!isReject}>Hủy</Button><Button type="submit" variant={isReject ? "outlined" : "contained"} className={isReject ? styles.reject : undefined} disabled={submitting}>{submitting ? "Đang lưu…" : "Xác nhận"}</Button></DialogActions>}
      </form>
    </Dialog>
  )
}
