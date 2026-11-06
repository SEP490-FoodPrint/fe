import React, { useEffect, useState } from "react"
import { Alert, Button, Chip, CircularProgress } from "@mui/material"
import { Link } from "react-router-dom"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"
import styles from "./RegistrationResult.module.scss"

const states = {
  PENDING: { label: "Chờ duyệt", tone: "pending", icon: <AccessTimeOutlinedIcon /> },
  APPROVED: { label: "Đã duyệt", tone: "approved", icon: <CheckCircleOutlineOutlinedIcon /> },
  REJECTED: { label: "Từ chối", tone: "rejected", icon: <ErrorOutlineOutlinedIcon /> },
}
const formatDate = value => value && Number.isFinite(new Date(value).getTime()) ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)) : "—"

export default function RegistrationResult({ user, onUpdate }) {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    Promise.all([AuthService.getOnboarding({ signal: controller.signal }), AuthService.getPersonalProfile({ signal: controller.signal })]).then(([application, updated]) => {
      if (controller.signal.aborted) return
      setRequest(application)
      onUpdate({ ...updated, registrationRequest: application ? { id: application.id, status: application.status, submittedAt: application.submittedAt, rejectionReason: application.rejectionReason } : null })
    }).catch(err => { if (!controller.signal.aborted) setError(err.message || "Không thể tải hồ sơ đăng ký.") })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user.id, retry, onUpdate])
  const profile = request?.profileData || {}
  const state = states[request?.status] || { label: request?.status || "—", tone: "pending" }
  const editable = ["PENDING", "REJECTED"].includes(request?.status) && user.onboardingRequired
  return <section className={styles.page} aria-label="Hồ sơ đăng ký" aria-busy={loading}>
    <div className={styles.heading}><div><span>Theo dõi và cập nhật thông tin đăng ký đơn vị của bạn.</span></div><Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => setRetry(value => value + 1)} disabled={loading}>Làm mới</Button></div>
    {error && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error}</Alert>}
    {loading ? <div className={styles.loading}><CircularProgress size={28} aria-label="Đang tải hồ sơ đăng ký" /></div> : !error && request && <>
      <article className={styles.record} aria-label="Hồ sơ đăng ký đơn vị">
        <div className={styles.recordHeader}>
          <div className={styles.organization}><h2>{profile.name || "—"}</h2><p>{request.requestType === "SUPPLIER" ? "Nhà cung cấp" : "Nhà trường"}{(profile.taxCode || profile.code) ? ` · ${profile.taxCode || profile.code}` : ""}</p></div>
          <Chip label={state.label} icon={state.icon} className={`${styles.status} ${styles[state.tone]}`} />
        </div>
        <dl className={styles.details}>
          <div><dt>Thông tin liên hệ</dt><dd>{profile.email || "—"}<span>{profile.phone || "Chưa có số điện thoại"}</span></dd></div>
          <div><dt>Ngày gửi</dt><dd><time dateTime={request.submittedAt || undefined}>{formatDate(request.submittedAt)}</time></dd></div>
        </dl>
        <div className={styles.recordActions}>{editable ? <Button component={Link} to={ROUTER.REGISTRATION_PROFILE} variant="outlined" startIcon={<EditOutlinedIcon />}>Chỉnh sửa hồ sơ đăng ký</Button> : <span>{request.status === "PENDING" ? "Chờ xét duyệt" : "Đã xét duyệt"}</span>}</div>
      </article>
      {request.status === "REJECTED" ? <Alert severity="error"><strong>Lý do từ chối</strong><p className={styles.reason}>{request.rejectionReason || "Chưa có thông tin lý do từ chối."}</p>{editable && "Chọn Chỉnh sửa hồ sơ đăng ký để cập nhật và gửi lại hồ sơ."}</Alert>
        : <p className={styles.notice}>{request.status === "PENDING" ? `Hồ sơ đang chờ xét duyệt.${editable ? " Chọn Chỉnh sửa hồ sơ đăng ký để cập nhật thông tin." : ""}` : "Hồ sơ đã được phê duyệt. Thông tin hồ sơ được lưu để bạn tra cứu."}</p>}
    </>}
  </section>
}
