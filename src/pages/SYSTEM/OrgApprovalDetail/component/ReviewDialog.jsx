import React, { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, useMediaQuery } from "@mui/material"
import RegistrationService from "src/services/RegistrationService"
import RequestFields from "src/components/Registration/RequestFields"
import RequestStatus from "src/components/Registration/RequestStatus"
import ROUTER from "src/router/ROUTER"
import { formatRequestDate, organizationName, requestCode, REQUEST_TYPES } from "src/lib/registration"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./ReviewDialog.module.scss"

export default function ReviewDialog({ mode, request, reviewer, onClose, onReviewed, onReload, onSwitchToReject }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [conflict, setConflict] = useState(false)
  const [locationInactive, setLocationInactive] = useState(false)
  const submittingRef = useRef(false)
  useEffect(() => { setReason(""); setReasonError(""); setError(""); setConflict(false); setLocationInactive(false) }, [mode])
  const isResult = mode === "RESULT"
  const isReject = mode === "REJECTED"
  const title = isResult ? request.status === "APPROVED" ? "Đã phê duyệt hồ sơ đăng ký." : "Đã từ chối hồ sơ đăng ký."
    : isReject ? "Từ chối hồ sơ đăng ký" : "Xác nhận phê duyệt hồ sơ"
  const submit = async event => {
    event.preventDefault()
    if (submittingRef.current || isResult) return
    if (isReject && !reason.trim()) { setReasonError("Nhập lý do từ chối hồ sơ."); return }
    submittingRef.current = true
    setSubmitting(true)
    setReasonError("")
    setError("")
    setConflict(false)
    setLocationInactive(false)
    try {
      const response = await RegistrationService.reviewRequest(request.id, {
        status: mode,
        rejection_reason: isReject ? reason.trim() : null,
        expected_review_version: request.review_version,
      }, reviewer)
      onReviewed(response.data, response.isMock)
    } catch (err) {
      const code = err?.response?.data?.error?.code
      const status = err?.response?.status
      setConflict(["REGISTRATION_STALE", "REGISTRATION_ALREADY_REVIEWED"].includes(code))
      if (status === 409 && code === "REGISTRATION_LOCATION_INACTIVE") {
        setLocationInactive(true)
        setError("Phường/xã đã ngừng hoạt động. Hãy từ chối để họ chọn lại.")
      } else {
        setError(err.message || "Không thể lưu quyết định xét duyệt.")
      }
    } finally { setSubmitting(false); submittingRef.current = false }
  }
  const assignLocationUrl = request.schoolId
    ? `${ROUTER.SYSTEM_SCHOOL_LIST}/${encodeURIComponent(request.schoolId)}`
    : request.supplierId
      ? `${ROUTER.SYSTEM_SUPPLIER_LIST}/${encodeURIComponent(request.supplierId)}`
      : null
  const needsPostApprovalLocation = isResult && request.status === "APPROVED" && !request.location && Boolean(assignLocationUrl)
  return (
    <Dialog open={Boolean(mode)} onClose={submitting ? undefined : onClose} maxWidth={false} transitionDuration={reducedMotion ? 0 : undefined} aria-labelledby="review-dialog-title" className={styles.dialog}>
      <form onSubmit={submit}>
        <DialogTitle id="review-dialog-title" className={styles.title}>{title}<IconButton onClick={onClose} disabled={submitting} aria-label="Đóng hộp thoại"><CloseIcon /></IconButton></DialogTitle>
        <DialogContent className={styles.content}>
          {isResult ? <>
            <RequestStatus status={request.status} />
            <p>{requestCode(request.registrationID)} · {organizationName(request)}</p>
            <RequestFields columns={1} fields={[{ label: "Người xét duyệt", value: request.reviewer?.full_name || "Chưa có" }, { label: "Ngày xét duyệt", value: formatRequestDate(request.reviewed_at, true) }, ...(request.rejection_reason ? [{ label: "Lý do từ chối", value: request.rejection_reason }] : [])]} />
            {needsPostApprovalLocation ? (
              <Alert
                severity="warning"
                action={
                  <Button component={Link} to={assignLocationUrl} size="small" variant="outlined" onClick={onClose}>
                    Gắn phường/xã
                  </Button>
                }
              >
                Hồ sơ này chưa chọn phường/xã khi đăng ký. Bạn nên gắn phường/xã cho đơn vị vừa tạo để đảm bảo các luồng quản lý ATTP hoạt động đầy đủ.
              </Alert>
            ) : null}
            <p className={styles.muted}>Quyết định đã được ghi nhận.</p>
          </> : isReject ? <>
            <p className={styles.muted}>Hồ sơ {requestCode(request.registrationID)} của {request.applicant?.full_name || "người đăng ký"}.</p>
            <label className={styles.reasonLabel} htmlFor="rejection-reason">Lý do từ chối</label>
            <TextField id="rejection-reason" value={reason} onChange={event => { setReason(event.target.value); setReasonError("") }} multiline rows={4} fullWidth autoFocus disabled={submitting}
              error={Boolean(reasonError)} helperText={reasonError || undefined}
              placeholder="Nhập lý do từ chối hồ sơ" slotProps={{ htmlInput: { maxLength: 4000, "aria-describedby": "rejection-hint" } }} />
            <p id="rejection-hint" className={styles.muted}>Lý do từ chối là bắt buộc, tối đa 4000 ký tự.</p>
          </> : <>
            <p className={styles.muted}>Bạn có chắc chắn muốn phê duyệt hồ sơ đăng ký này?</p>
            <RequestFields columns={1} fields={[{ label: "Người đăng ký", value: request.applicant?.full_name }, { label: "Loại hồ sơ", value: REQUEST_TYPES[request.request_type] }, { label: "Đơn vị đăng ký", value: organizationName(request) }, { label: "Phường / Xã", value: request.location?.name || "Chưa chọn" }]} />
          </>}
          {error && <Alert severity="error" action={conflict && onReload ? <Button onClick={onReload}>Tải lại hồ sơ</Button> : locationInactive && onSwitchToReject ? <Button onClick={onSwitchToReject}>Từ chối hồ sơ</Button> : undefined}>{error}</Alert>}
        </DialogContent>
        {!isResult && <DialogActions className={styles.actions}><Button variant="outlined" onClick={onClose} disabled={submitting} autoFocus={!isReject}>Hủy</Button><Button type="submit" variant={isReject ? "outlined" : "contained"} className={isReject ? styles.reject : undefined} disabled={submitting}>{submitting ? "Đang lưu…" : "Xác nhận"}</Button></DialogActions>}
      </form>
    </Dialog>
  )
}
