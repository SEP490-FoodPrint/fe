import React, { useEffect, useState } from "react"
import { Alert, Button, Chip, CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material"
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
  return <section className={styles.page} aria-labelledby="registration-list-title" aria-busy={loading}>
    <div className={styles.heading}><div><p>Tài khoản của bạn</p><h1 id="registration-list-title">Hồ sơ đăng ký</h1><span>Theo dõi và cập nhật thông tin đăng ký đơn vị của bạn.</span></div><Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => setRetry(value => value + 1)} disabled={loading}>Làm mới</Button></div>
    {error && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error}</Alert>}
    {loading ? <div className={styles.loading}><CircularProgress size={28} aria-label="Đang tải hồ sơ đăng ký" /></div> : !error && request && <>
      <div className={styles.tableWrapper}>
        <Table aria-label="Hồ sơ đăng ký đơn vị" className={styles.table}>
          <TableHead><TableRow><TableCell>Đơn vị đăng ký</TableCell><TableCell>Thông tin liên hệ</TableCell><TableCell>Trạng thái</TableCell><TableCell>Ngày gửi</TableCell><TableCell align="right">Thao tác</TableCell></TableRow></TableHead>
          <TableBody><TableRow>
            <TableCell data-label="Đơn vị đăng ký"><strong>{profile.name || "—"}</strong><span>{request.requestType === "SUPPLIER" ? "Nhà cung cấp" : "Nhà trường"}{(profile.taxCode || profile.code) ? ` · ${profile.taxCode || profile.code}` : ""}</span></TableCell>
            <TableCell data-label="Thông tin liên hệ"><div>{profile.email || "—"}</div><span>{profile.phone || "Chưa có số điện thoại"}</span></TableCell>
            <TableCell data-label="Trạng thái"><Chip label={state.label} icon={state.icon} className={`${styles.status} ${styles[state.tone]}`} /></TableCell>
            <TableCell data-label="Ngày gửi"><time dateTime={request.submittedAt || undefined}>{formatDate(request.submittedAt)}</time></TableCell>
            <TableCell data-label="Thao tác" align="right">{editable ? <Tooltip title="Chỉnh sửa hồ sơ đăng ký"><IconButton component={Link} to={ROUTER.REGISTRATION_PROFILE} aria-label="Chỉnh sửa hồ sơ đăng ký" className={styles.edit}><EditOutlinedIcon /></IconButton></Tooltip> : <span>Đã xét duyệt</span>}</TableCell>
          </TableRow></TableBody>
        </Table>
      </div>
      {request.status === "REJECTED" ? <Alert severity="error"><strong>Lý do từ chối</strong><p className={styles.reason}>{request.rejectionReason || "Chưa có thông tin lý do từ chối."}</p>Bấm biểu tượng bút chì để chỉnh sửa và gửi lại hồ sơ.</Alert>
        : <p className={styles.notice}>{request.status === "PENDING" ? "Hồ sơ đang chờ xét duyệt. Bạn có thể bấm biểu tượng bút chì để cập nhật thông tin." : "Hồ sơ đã được phê duyệt. Thông tin hồ sơ được lưu để bạn tra cứu."}</p>}
    </>}
  </section>
}
