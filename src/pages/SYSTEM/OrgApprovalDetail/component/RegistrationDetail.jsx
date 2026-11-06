import React, { useContext, useEffect, useState } from "react"
import { Alert, Button, Card, CircularProgress, IconButton } from "@mui/material"
import { Link, useLocation, useParams } from "react-router-dom"
import { StoreContext } from "src/contexts"
import RegistrationService from "src/services/RegistrationService"
import RequestFields from "src/components/Registration/RequestFields"
import RequestStatus from "src/components/Registration/RequestStatus"
import { formatRequestDate, organizationName, requestCode, REQUEST_TYPES } from "src/lib/registration"
import ROUTER from "src/router/ROUTER"
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import ReviewDialog from "./ReviewDialog"
import SupportingDocuments from "./SupportingDocuments"
import RegisteredIngredients from "./RegisteredIngredients"
import styles from "./RegistrationDetail.module.scss"

const ACCOUNT_STATUSES = {
  ACTIVE: "Hoạt động", INACTIVE: "Ngừng hoạt động", PENDING: "Chờ xác minh",
  SUSPENDED: "Tạm khóa", UNVERIFIED: "Chưa xác minh",
}

export default function RegistrationDetail() {
  const { requestId } = useParams()
  const location = useLocation()
  const { userStore } = useContext(StoreContext)
  const [request, setRequest] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [dialog, setDialog] = useState(null)
  const listUrl = `${ROUTER.SYSTEM_ORG_APPROVAL}${location.state?.listSearch || ""}`

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setDialog(null)
    window.scrollTo(0, 0)
    RegistrationService.getRequest(requestId, { signal: controller.signal }).then(response => {
      if (active) { setRequest(response.data); setIsMock(Boolean(response.isMock)) }
    }).catch(err => {
      if (active) setError(err.message || "Không thể tải hồ sơ đăng ký.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort() }
  }, [requestId, retry])

  if (loading) return <div className={styles.loading} role="status"><CircularProgress size={28} /><p>Đang tải chi tiết hồ sơ…</p></div>
  if (error || !request) return <div className={styles.page}><Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error || "Không tìm thấy hồ sơ đăng ký."}</Alert></div>

  const profile = request.profile_data || {}
  const applicant = request.applicant || {}
  const name = organizationName(request)
  const type = REQUEST_TYPES[request.request_type] || request.request_type || "Chưa cung cấp"
  const code = requestCode(request.registrationID)
  const isSupplier = request.request_type === "SUPPLIER"
  const isReviewed = request.status === "APPROVED" || request.status === "REJECTED"
  const organizationLabel = isSupplier ? "nhà cung cấp" : request.request_type === "SCHOOL" ? "trường học" : "đơn vị đăng ký"
  const field = (label, value) => ({ label, value: value == null || typeof value === "string" && !value.trim() ? "Chưa cung cấp" : value })
  const applicantFields = [
    field("Họ và tên", applicant.full_name),
    field("Email đăng ký", applicant.email), field("Số điện thoại", applicant.phone),
    field("Trạng thái tài khoản", <span className={applicant.status === "ACTIVE" ? styles.active : ""}>{ACCOUNT_STATUSES[applicant.status] || applicant.status || "Chưa cung cấp"}</span>),
  ]
  const profileFields = [
    field(`Tên ${organizationLabel}`, name),
    ...(isSupplier ? [field("Mã số thuế", profile.taxCode || profile.tax_code)] : []),
    field("Email liên hệ", profile.email), field("Số điện thoại liên hệ", profile.phone),
    field("Địa chỉ", profile.address),
  ]
  const organizationDetails = [
    field(`Giới thiệu về ${organizationLabel}`, profile.description),
  ]

  return (
    <section className={styles.page} aria-label="Chi tiết hồ sơ đăng ký">
      <div className={styles.heading}>
        <IconButton component={Link} to={listUrl} className={styles.back} aria-label="Quay lại danh sách"><KeyboardArrowLeftIcon /></IconButton>
        <span>Xem chi tiết</span>
      </div>
      <header className={styles.headingContent}>
        <div className={styles.titleRow}>
          <div className={styles.requestStatus}><RequestStatus status={request.status} variant="badge" /></div>
        </div>
        <dl className={styles.metadata}>
          <div><dd>{code}</dd></div>
          <div><dd>{type}</dd></div>
          <div className={styles.submitted}><dt>Ngày gửi</dt><dd>{formatRequestDate(request.submitted_at, true)}</dd></div>
        </dl>
      </header>
      <Card component="section" variant="outlined" className={styles.card} aria-labelledby="organization-info-title">
        <h2 id="organization-info-title">Thông tin {organizationLabel}</h2>
        <RequestFields columns={2} fields={profileFields} />
        <RequestFields columns={1} fields={organizationDetails} />
      </Card>
      <Card component="section" variant="outlined" className={styles.card} aria-labelledby="applicant-info-title">
        <h2 id="applicant-info-title">Thông tin người đăng ký</h2>
        <RequestFields columns={2} fields={applicantFields} />
      </Card>
      <SupportingDocuments documents={request.supporting_documents || []} organization={name} />
      {isSupplier && <RegisteredIngredients ingredients={Array.isArray(profile.ingredients) ? profile.ingredients.filter(item => item && typeof item === "object") : []} />}
      <Card component="section" variant="outlined" className={styles.card} aria-labelledby="review-title">
        <h2 id="review-title">Thông tin xét duyệt</h2>
        {request.status === "PENDING" ? <>
          <p className={styles.description}>Hồ sơ chưa được xét duyệt</p>
          <div className={styles.actions}><Button variant="contained" onClick={() => setDialog("APPROVED")}>Phê duyệt hồ sơ</Button><Button variant="outlined" className={styles.reject} onClick={() => setDialog("REJECTED")}>Từ chối hồ sơ</Button></div>
        </> : isReviewed ? <>
          <RequestFields columns={2} fields={[field("Người xét duyệt", request.reviewer?.full_name), field("Ngày xét duyệt", request.reviewed_at ? formatRequestDate(request.reviewed_at, true) : null)]} />
          {request.rejection_reason && <RequestFields columns={1} fields={[field("Lý do từ chối", request.rejection_reason)]} />}
        </> : <p className={styles.description}>Chưa có thông tin xét duyệt.</p>}
      </Card>
      <footer className={styles.footer}>
        <p>Cập nhật lần cuối: {formatRequestDate(request.updated_at, true)}</p>
        {isMock && <p>Dữ liệu và minh chứng minh họa cho giao diện.</p>}
      </footer>
      <ReviewDialog mode={dialog} request={request} reviewer={userStore?.user} onClose={() => setDialog(null)} onReviewed={(updated, reviewedMock) => { setRequest(updated); setIsMock(Boolean(reviewedMock)); setDialog("RESULT") }} onReload={() => { setDialog(null); setRetry(value => value + 1) }} />
    </section>
  )
}
